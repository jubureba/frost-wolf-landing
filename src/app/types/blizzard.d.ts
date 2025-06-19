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
  role?: {
    type: string;
  };
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
  level?: number | null;
  ilvl?: number | null;
  discord?: string;
  iddiscord?: number | null;
  battletag?: string;
}

type Core = {
  id: string;
  nome: string;
  informacoes: string;
  dias: string;
  precisaDe: string;
  bossAtual: string;
  composicaoAtual: Jogador[];
}
