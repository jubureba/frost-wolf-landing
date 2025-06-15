import axios from 'axios';

export class BlizzardApi {
  private clientId: string;
  private clientSecret: string;
  private token: string | null = null;
  private tokenExpiration: number = 0;
  public region: string = 'us';

  // Cache simples para evitar requisições repetidas da mesma spec
  private specRoleCache = new Map<string, 'tank' | 'healer' | 'dps'>();

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async authenticate(): Promise<string> {
    const now = Date.now();
    if (this.token && now < this.tokenExpiration) {
      return this.token ?? '';
    }

    const response = await axios.post(
      `https://${this.region}.battle.net/oauth/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      }
    );

    this.token = response.data.access_token;
    this.tokenExpiration = now + response.data.expires_in * 1000 - 60000;

    return this.token ?? '';
  }

  async request(endpoint: string, namespace: 'static' | 'dynamic', locale = 'pt_BR') {
    const token = await this.authenticate();
    const url = `https://${this.region}.api.blizzard.com${endpoint}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        namespace: `${namespace}-${this.region}`,
        locale,
      },
    });

    return response.data;
  }

  async getCharacterProfile(realm: string, characterName: string) {
    const token = await this.authenticate();
    const url = `https://${this.region}.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${characterName.toLowerCase()}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        namespace: `profile-${this.region}`,
        locale: 'pt_BR',
      },
    });

    return response.data;
  }

  async getCharacterAvatar(realm: string, characterName: string) {
  const token = await this.authenticate();
  const url = `https://${this.region}.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${characterName.toLowerCase()}/character-media`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { namespace: `profile-${this.region}`, locale: 'pt_BR' },
  });

  const assets: Asset[] = response.data.assets;
  const avatar = assets.find((a) => a.key === 'avatar')?.value || null;
  return avatar;
}

  async getClassData(classId: number) {
    const endpoint = `/data/wow/playable-class/${classId}`;
    const classData = await this.request(endpoint, 'static');

    const mediaUrl = classData.media?.key?.href;
    let icon = '';

    if (mediaUrl) {
      const mediaData = await axios.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${await this.authenticate()}`,
        },
        params: {
          namespace: `static-${this.region}`,
          locale: 'pt_BR',
        },
      });

      const assets: Asset[] = mediaData.data.assets;
      icon = assets.find((a) => a.key === 'icon')?.value ?? '';

    }

    const color = this.getClassColor(classData.name.en_US);

    return {
      id: classData.id,
      name: classData.name.pt_BR,
      name_en: classData.name.en_US,
      icon,
      color,
    };
  }

  getClassColor(classe: string): string {
    const map: Record<string, string> = {
      Warrior: '#C79C6E',
      Paladin: '#F58CBA',
      Hunter: '#ABD473',
      Rogue: '#FFF569',
      Priest: '#FFFFFF',
      DeathKnight: '#C41F3B',
      Shaman: '#0070DE',
      Mage: '#69CCF0',
      Warlock: '#9482C9',
      Monk: '#00FF96',
      Druid: '#FF7D0A',
      DemonHunter: '#A330C9',
      Evoker: '#33937F',
    };

    return map[classe.replace(/\s/g, '')] ?? '#FFFFFF';
  }

  // Novo método: pega o role da spec via URL (href) com cache
  async getSpecRole(href: string): Promise<'tank' | 'healer' | 'dps' | undefined> {
    if (this.specRoleCache.has(href)) {
      return this.specRoleCache.get(href);
    }

    try {
      const token = await this.authenticate();
      const response = await axios.get(href, {
        headers: { Authorization: `Bearer ${token}` },
        params: { namespace: `static-${this.region}`, locale: 'pt_BR' },
      });

      // Exemplo: role: { type: 'HEALER', name: 'Cura' }
      const roleType = response.data.role?.type?.toLowerCase();

      let normalizedRole: 'tank' | 'healer' | 'dps' | undefined;

      if (roleType === 'tank') {
        normalizedRole = 'tank';
      } else if (roleType === 'healer') {
        normalizedRole = 'healer';
      } else if (roleType === 'damage') {
        normalizedRole = 'dps';
      }

      if (normalizedRole) {
        this.specRoleCache.set(href, normalizedRole);
        return normalizedRole;
      }

      return undefined;
    } catch (error) {
      console.error('Erro ao buscar role da spec:', error);
      return undefined;
    }
  }



}
