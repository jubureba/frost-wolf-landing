import { BlizzardHttpClient } from "./BlizzardHttpClient";
import { logInfo, logError } from "../utils/logger";

export class BlizzardApi {
  private specRoleCache = new Map<string, "tank" | "healer" | "dps">();

  constructor(private client: BlizzardHttpClient) {}

  async getCharacterProfile(realm: string, name: string) {
    const url = `https://${
      this.client.region
    }.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${name.toLowerCase()}`;
    logInfo(`🔍 Buscando perfil: ${name} - ${realm}`, { url });

    const res = await this.client.get<CharacterProfileResponse>(url, {
      namespace: `profile-${this.client.region}`,
    });

    logInfo(`✅ Perfil encontrado: ${name} - ${realm}`, res);
    return res;
  }

  async getCharacterAvatar(realm: string, name: string) {
    const url = `https://${
      this.client.region
    }.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${name.toLowerCase()}/character-media`;
    logInfo(`🔍 Buscando avatar: ${name} - ${realm}`, { url });

    const res = await this.client.get<CharacterMediaResponse>(url, {
      namespace: `profile-${this.client.region}`,
    });

    const avatar = res.assets?.find((a) => a.key === "avatar")?.value ?? null;

    logInfo(`🎨 Avatar encontrado: ${name} - ${realm}`, { avatar });
    return avatar;
  }

  async getClassData(classId: number) {
    const url = `https://${this.client.region}.api.blizzard.com/data/wow/playable-class/${classId}`;
    logInfo(`🔍 Buscando dados da classe ID ${classId}`, { url });

    const res = await this.client.get<ClassDataResponse>(url, {
      namespace: `static-${this.client.region}`,
    });

    const icon = res.media?.assets?.find((a) => a.key === "icon")?.value ?? "";
    const color = this.getClassColor(res.name);

    logInfo(`🎯 Classe encontrada: ${res.name}`, { icon, color });

    return {
      id: res.id,
      name: res.name,
      name_en: res.name,
      icon,
      color,
    };
  }

  async getSpecData(
    href: string
  ): Promise<{
    role?: "tank" | "healer" | "dps";
    icon?: string;
    name?: string;
  }> {
    if (this.specRoleCache.has(href)) {
      const cached = this.specRoleCache.get(href);
      logInfo(`📦 Role carregado do cache`, { href, role: cached });
      return { role: cached };
    }

    logInfo(`🔍 Buscando dados da spec`, { href });

    // Busca o Spec
    const specRes = await this.client.get<SpecResponse>(href, {
      namespace: `static-${this.client.region}`,
    });

    const roleType = specRes.role?.type?.toLowerCase();
    const role =
      roleType === "tank"
        ? "tank"
        : roleType === "healer"
        ? "healer"
        : roleType === "damage"
        ? "dps"
        : undefined;

    if (role) {
      this.specRoleCache.set(href, role);
      logInfo(`🎯 Role encontrado e salvo no cache`, { href, role });
    } else {
      logInfo(`❓ Role não identificado`, { href, response: specRes });
    }

    // 🔥 Busca o media (ícone) da spec
    const mediaHref = specRes.media?.key?.href;
    let icon: string | undefined = undefined;

    if (mediaHref) {
      const mediaRes = await this.client.get<SpecMediaResponse>(mediaHref, {
        namespace: `static-${this.client.region}`,
      });

      icon = mediaRes.assets?.find((a) => a.key === "icon")?.value;
    }

    const name = specRes.name ?? undefined;

    return { role, icon, name };
  }

  async getCompleteCharacterData(realm: string, name: string) {
    logInfo(`🚀 Iniciando busca completa para ${name} - ${realm}`);

    try {
      const [profile, avatar] = await Promise.all([
        this.getCharacterProfile(realm, name),
        this.getCharacterAvatar(realm, name),
      ]);

      const classData = await this.getClassData(profile.character_class.id);
      const spec = profile.active_spec?.name || "";
      const roleHref = profile.active_spec?.key?.href;
      const specData = roleHref ? await this.getSpecData(roleHref) : {};

      const result = {
        nome: profile.name,
        realm: profile.realm.slug,
        classe: classData.name,
        classe_en: classData.name_en,
        color: classData.color,
        icon: classData.icon, // ícone da classe
        spec: spec, // nome da spec
        specIcon: specData.icon || "", // ícone da spec
        role: specData.role, // role (tank, healer, dps)
        level: profile.level,
        avatar: avatar ?? null,
        ilvl: profile.equipped_item_level,
      };

      logInfo(`✅ Dados completos para ${name} - ${realm}`, result);

      return result;
    } catch (error) {
      logError(`🔥 Erro ao buscar dados de ${name} - ${realm}`, error);
      throw error;
    }
  }

  getClassColor(classe?: string): string {
    if (!classe) return "#FFFFFF";

    const sanitized = classe
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s/g, "")
      .toLowerCase();

    const map: Record<string, string> = {
      guerreiro: "#C79C6E",
      paladino: "#F58CBA",
      cacador: "#ABD473",
      ladino: "#FFF569",
      sacerdote: "#FFFFFF",
      cavaleirodamorte: "#C41F3B",
      xama: "#0070DE",
      mago: "#69CCF0",
      bruxo: "#9482C9",
      monge: "#00FF96",
      druida: "#FF7D0A",
      cacadordedemonios: "#A330C9",
      conjurante: "#33937F",
    };

    const color = map[sanitized] ?? "#FFFFFF";
    logInfo(`🎨 Cor da classe ${classe}: ${color}`);
    return color;
  }
}
