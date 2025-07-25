
import type { Especializacao } from "../firestoreService";

export type DadosPersonagemBlizzard = {
  classe: string;
  especializacao: Especializacao[];
  role: "tank" | "healer" | "dps" | null;
};

export async function buscarPersonagemBlizzard(
  realm: string,
  name: string
): Promise<DadosPersonagemBlizzard> {
  const url = `/api/blizzard/character?realm=${encodeURIComponent(
    realm
  )}&name=${encodeURIComponent(name)}`;

  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Erro ao buscar personagem na Blizzard");
  }

  const data: DadosPersonagemBlizzard = await res.json();
  return data;
}
