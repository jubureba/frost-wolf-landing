import { useState, useEffect } from "react";
import { getCachedCharacter, setCachedCharacter } from "./useCachedCharacter";

// Extensão para permitir dados extras vindos da API
type JogadorComDadosExtras = Jogador & {
  [key: string]: unknown;
};

export function useFetchComposicao(
  composicaoInicial: Jogador[],
  jogadoresNovos: Set<string>,
  setJogadoresNovos: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  const [composicao, setComposicao] = useState<JogadorComDadosExtras[]>(composicaoInicial);
  const [loading, setLoading] = useState(false);

  async function fetchAndCache(ignoreCache = false) {
    setLoading(true);
    const composicaoAtualizada = await Promise.all(
      composicao.map(async (jogador) => {
        const chave = `${jogador.realm.toLowerCase()}-${jogador.nome.toLowerCase()}`;

        if (!ignoreCache && !jogadoresNovos.has(chave)) {
          const cached = getCachedCharacter(jogador.realm, jogador.nome);
          if (cached) return { ...jogador, ...cached };
        }

        try {
          const res = await fetch(
            `/api/blizzard/character?realm=${encodeURIComponent(
              jogador.realm
            )}&name=${encodeURIComponent(jogador.nome)}`
          );
          if (!res.ok) return jogador;
          const dados = await res.json();

          setCachedCharacter(jogador.realm, jogador.nome, dados);

          if (jogadoresNovos.has(chave)) {
            setJogadoresNovos((prev) => {
              const novoSet = new Set(prev);
              novoSet.delete(chave);
              return novoSet;
            });
          }

          return { ...jogador, ...dados };
        } catch {
          return jogador;
        }
      })
    );
    setComposicao(composicaoAtualizada);
    setLoading(false);
  }

  useEffect(() => {
    fetchAndCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (jogadoresNovos.size > 0) {
      fetchAndCache(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogadoresNovos]);

  return { composicao, loading, setComposicao };
}
