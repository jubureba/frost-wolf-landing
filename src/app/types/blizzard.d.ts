type CharacterMediaResponse = {
  assets: { key: string; value: string }[];
};

type ClassDataResponse = {
  id: number;
  name: string;
  media?: {
    assets: { key: string; value: string }[];
  };
};

type SpecResponse = {
  id: number;
  name: string;
  description: string;
  role?: {
    type: string;
    name: string;
  };
  media: {
    key: {
      href: string;
    };
    id: number;
  };
  playable_class: {
    key: {
      href: string;
    };
    name: string;
    id: number;
  };
};

type SpecMediaResponse = {
  assets: { key: string; value: string }[];
  id: number;
};

type CharacterProfileResponse = {
  name: string;
  realm: { slug: string };
  character_class: { id: number };
  active_spec?: {
    name: string;
    key: { href: string };
  };
  level: number;
  equipped_item_level: number;
};

type Jogador = {
  nome: string;
  realm: string;
  role?: string;
  avatar?: string | null;
  color?: string;
  classe?: string | null;
  spec?: string | null;
  specIcon?: string | null;
  icon?: string | null;
  level?: number | null;
  ilvl?: number | null;
  discord?: string;
  iddiscord?: number | null;
  battletag?: string;
  twitch?: string;
};

type Core = {
  id: string;
  nome: string;
  informacoes: string;
  dias: string;
  precisaDe: string;
  recrutando: boolean;
  bossAtual: string;
  linkRecrutamento?: string;
  composicaoAtual: Jogador[];
};
