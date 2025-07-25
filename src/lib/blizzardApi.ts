import { BlizzardHttpClient } from "./BlizzardHttpClient";
import { logInfo, logError } from "../utils/logger";

export class BlizzardApi {
  private cacheFuncaoPorSpec = new Map<string, "tank" | "healer" | "dps">();

  constructor(private cliente: BlizzardHttpClient) {}

  async obterPerfilPersonagem(reino: string, nome: string) {
    const url = `https://${
      this.cliente.region
    }.api.blizzard.com/profile/wow/character/${reino.toLowerCase()}/${nome.toLowerCase()}`;
    logInfo(`🔍 Buscando perfil: ${nome} - ${reino}`, { url });

    const res = await this.cliente.get<CharacterProfileResponse>(url, {
      namespace: `profile-${this.cliente.region}`,
    });

    logInfo(`✅ Perfil encontrado: ${nome} - ${reino}`, res);
    return res;
  }

  async obterAvatarPersonagem(reino: string, nome: string) {
    const url = `https://${
      this.cliente.region
    }.api.blizzard.com/profile/wow/character/${reino.toLowerCase()}/${nome.toLowerCase()}/character-media`;
    logInfo(`🔍 Buscando avatar: ${nome} - ${reino}`, { url });

    const res = await this.cliente.get<CharacterMediaResponse>(url, {
      namespace: `profile-${this.cliente.region}`,
    });

    const avatar = res.assets?.find((a) => a.key === "avatar")?.value ?? null;

    logInfo(`🎨 Avatar encontrado: ${nome} - ${reino}`, { avatar });
    return avatar;
  }

  async obterClassePorId(idClasse: number) {
    const url = `https://${this.cliente.region}.api.blizzard.com/data/wow/playable-class/${idClasse}`;
    logInfo(`🔍 Buscando dados da classe ID ${idClasse}`, { url });

    const res = await this.cliente.get<ClassDataResponse>(url, {
      namespace: `static-${this.cliente.region}`,
    });

    const icone = res.media?.assets?.find((a) => a.key === "icon")?.value ?? "";
    const cor = this.obterCorClasse(res.name);

    logInfo(`🎯 Classe encontrada: ${res.name}`, { icone, cor });

    return {
      id: res.id,
      nome: res.name,
      nome_en: res.name,
      icone,
      cor,
    };
  }

  async obterDadosEspecializacao(href: string): Promise<{
    funcao?: "tank" | "healer" | "dps";
    icone?: string;
    nome?: string;
  }> {
    if (this.cacheFuncaoPorSpec.has(href)) {
      const cache = this.cacheFuncaoPorSpec.get(href);
      logInfo(`📦 Função carregada do cache`, { href, cache });
      return { funcao: cache };
    }

    logInfo(`🔍 Buscando dados da especialização`, { href });

    const specRes = await this.cliente.get<SpecResponse>(href, {
      namespace: `static-${this.cliente.region}`,
    });

    const tipoFuncao = specRes.role?.type?.toLowerCase();
    const funcao =
      tipoFuncao === "tank"
        ? "tank"
        : tipoFuncao === "healer"
        ? "healer"
        : tipoFuncao === "damage"
        ? "dps"
        : undefined;

    if (funcao) {
      this.cacheFuncaoPorSpec.set(href, funcao);
      logInfo(`🎯 Função identificada e salva no cache`, { href, funcao });
    } else {
      logInfo(`❓ Função não identificada`, { href, resposta: specRes });
    }

    const hrefMedia = specRes.media?.key?.href;
    let icone: string | undefined = undefined;

    if (hrefMedia) {
      const mediaRes = await this.cliente.get<SpecMediaResponse>(hrefMedia, {
        namespace: `static-${this.cliente.region}`,
      });
      icone = mediaRes.assets?.find((a) => a.key === "icon")?.value;
    }

    return { funcao, icone, nome: specRes.name };
  }

  async obterDadosCompletosPersonagem(reino: string, nome: string) {
    logInfo(`🚀 Iniciando busca completa para ${nome} - ${reino}`);

    try {
      const [perfil, avatar] = await Promise.all([
        this.obterPerfilPersonagem(reino, nome),
        this.obterAvatarPersonagem(reino, nome),
      ]);

      const dadosClasse = await this.obterClassePorId(
        perfil.character_class.id
      );
      const nomeSpec = perfil.active_spec?.name || "";
      const hrefSpec = perfil.active_spec?.key?.href;
      const dadosSpec = hrefSpec
        ? await this.obterDadosEspecializacao(hrefSpec)
        : {};

      const resultado = {
        nome: perfil.name,
        reino: perfil.realm.slug,
        classe: dadosClasse.nome,
        classe_en: dadosClasse.nome_en,
        cor: dadosClasse.cor,
        icone: dadosClasse.icone,
        especializacao: nomeSpec,
        iconeEspecializacao: dadosSpec.icone || "",
        funcao: dadosSpec.funcao,
        nivel: perfil.level,
        avatar: avatar ?? null,
        ilvl: perfil.equipped_item_level,
      };

      logInfo(`✅ Dados completos para ${nome} - ${reino}`, resultado);

      return resultado;
    } catch (erro) {
      logError(`🔥 Erro ao buscar dados de ${nome} - ${reino}`, erro);
      throw erro;
    }
  }

  obterCorClasse(classe?: string): string {
    if (!classe) return "#FFFFFF";

    const chave = classe
      .normalize("NFD")
      .replace(/[̀-\u036f]/g, "")
      .replace(/\s/g, "")
      .toLowerCase();

    const mapa: Record<string, string> = {
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

    const cor = mapa[chave] ?? "#FFFFFF";
    logInfo(`🎨 Cor da classe ${classe}: ${cor}`);
    return cor;
  }

 async obterTodasAsClasses() {
  const url = `https://${this.cliente.region}.api.blizzard.com/data/wow/playable-class/index`;

  const data = await this.cliente.get<{
    classes: { id: number; name: string; key: { href: string } }[];
  }>(url, {
    namespace: `static-${this.cliente.region}`,
    locale: "pt_BR",
  });

  return data.classes.map((c) => ({
    id: c.id,
    name: c.name,
    href: c.key.href,
  }));
}

  async obterEspecializacoesPorClasseId(
    classId: number
  ): Promise<{ id: number; nome: string }[]> {
    const url = `https://${this.cliente.region}.api.blizzard.com/data/wow/playable-class/${classId}`;

    const resposta = await this.cliente.get<{
      specializations: { id: number; name: string }[];
    }>(url, {
      namespace: `static-${this.cliente.region}`,
      locale: "pt_BR",
    });

    return resposta.specializations.map((spec) => ({
      id: spec.id,
      nome: spec.name,
    }));
  }
}
