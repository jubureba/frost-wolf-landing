import { BlizzardHttpClient } from "./BlizzardHttpClient";

export class BlizzardApi {
  private specRoleCache = new Map<string, "tank" | "healer" | "dps">();

  constructor(private client: BlizzardHttpClient) {}

  async getCharacterProfile(realm: string, name: string) {
    const url = `https://${
      this.client.region
    }.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${name.toLowerCase()}`;
    return this.client.get<CharacterProfileResponse>(url, {
      namespace: `profile-${this.client.region}`,
    });
  }

  async getCharacterAvatar(realm: string, name: string) {
    const url = `https://${
      this.client.region
    }.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${name.toLowerCase()}/character-media`;
    const res = await this.client.get<CharacterMediaResponse>(url, {
      namespace: `profile-${this.client.region}`,
    });

    return res.assets?.find((a) => a.key === "avatar")?.value ?? null;
  }

  async getClassData(classId: number) {
    const url = `https://${this.client.region}.api.blizzard.com/data/wow/playable-class/${classId}`;
    const res = await this.client.get<ClassDataResponse>(url, {
      namespace: `static-${this.client.region}`,
    });

    const icon = res.media?.assets?.find((a) => a.key === "icon")?.value ?? "";
    const color = this.getClassColor(res.name);

    return {
      id: res.id,
      name: res.name,
      name_en: res.name,
      icon,
      color,
    };
  }

  async getSpecRole(
    href: string
  ): Promise<"tank" | "healer" | "dps" | undefined> {
    if (this.specRoleCache.has(href)) return this.specRoleCache.get(href);

    const res = await this.client.get<SpecResponse>(href, {
      namespace: `static-${this.client.region}`,
    });

    const roleType = res.role?.type?.toLowerCase();
    const role =
      roleType === "tank"
        ? "tank"
        : roleType === "healer"
        ? "healer"
        : roleType === "damage"
        ? "dps"
        : undefined;

    if (role) this.specRoleCache.set(href, role);
    return role;
  }

  async getCompleteCharacterData(realm: string, name: string) {
    const [profile, avatar] = await Promise.all([
      this.getCharacterProfile(realm, name),
      this.getCharacterAvatar(realm, name),
    ]);

    const classData = await this.getClassData(profile.character_class.id);
    const spec = profile.active_spec?.name || "";
    const roleHref = profile.active_spec?.key?.href;
    const role = roleHref ? await this.getSpecRole(roleHref) : undefined;

    return {
      nome: profile.name,
      realm: profile.realm.slug,
      classe: classData.name,
      classe_en: classData.name_en,
      color: classData.color, // 🔥 Aqui fica mais direto
      icon: classData.icon,
      spec,
      role,
      level: profile.level,
      avatar: avatar ?? null,
      ilvl: profile.equipped_item_level,
    };
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

    return map[sanitized] ?? "#FFFFFF";
  }
}
