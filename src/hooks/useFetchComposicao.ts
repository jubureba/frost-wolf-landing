import { useState, useEffect, useCallback } from "react";
import { getCachedCharacter, setCachedCharacter } from "./useCachedCharacter";
import type { Player } from "../lib/firestoreService";
import { buscarEspecializacaoPorNome } from "../lib/firestoreService";

export function useFetchComposicao(
  composicaoInicial: Player[],
  jogadoresNovos: Set<string>,
  setJogadoresNovos: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  console.log("useFetchComposicao: composicaoInicial=", composicaoInicial);
  const [composicao, setComposicao] = useState<Player[]>(composicaoInicial);
  const [loading, setLoading] = useState(false);

  const fetchCharacters = useCallback(
    async (playersToFetch: Player[]) => {
      console.log("fetchCharacters chamado com", playersToFetch);
      setLoading(true);
      try {
        const composicaoAtualizada = await Promise.all(
          playersToFetch.map(async (jogador) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const chave = `${jogador.realm.toLowerCase()}-${jogador.nome.toLowerCase()}`;
            const cached = getCachedCharacter(jogador.realm, jogador.nome);
            let dados;

            if (cached) {
              dados = cached;
            } else {
              const res = await fetch(
                `/api/blizzard/character?realm=${encodeURIComponent(
                  jogador.realm
                )}&name=${encodeURIComponent(jogador.nome)}`
              );
              console.log(`Fetching personagem ${jogador.nome} - status:`, res.status);
              if (!res.ok){
                console.warn("Falha ao buscar personagem", jogador.nome);
                return jogador;
              } 

              dados = await res.json();
              setCachedCharacter(jogador.realm, jogador.nome, dados);
            }

            // Tenta sobrescrever especializacao/funcao com dados do Firebase
            // Se já existir especializacao e funcao no Firebase, preserve-as
if (jogador.especializacao && jogador.funcao) {
  // só atualiza outros dados vindos da API, mas mantém especializacao e funcao do Firebase
  return {
    ...jogador,
    ...dados,
    especializacao: jogador.especializacao,
    funcao: jogador.funcao,
  };
}

// Caso não tenha, tenta preencher com dados da API e buscar papel da especializacao
if (dados?.especializacao) {
  const especFirebase = await buscarEspecializacaoPorNome(dados.especializacao);
  if (especFirebase) {
    return {
      ...jogador,
      ...dados,
      especializacao: especFirebase.name,
      funcao: especFirebase.role,
    };
  }
}

// Fallback, caso não tenha especializacao ou funcao
return { ...jogador, ...dados };
          })
        );

        return composicaoAtualizada;
      } finally {
        setLoading(false);
      }
    },
    []
  );

useEffect(() => {
  fetchCharacters(composicaoInicial).then(setComposicao);
}, [composicaoInicial, fetchCharacters]);

  useEffect(() => {
    if (jogadoresNovos.size === 0) return;

    const novosJogadores = composicao.filter((jogador) => {
      const chave = `${jogador.realm.toLowerCase()}-${jogador.nome.toLowerCase()}`;
      return jogadoresNovos.has(chave);
    });

    fetchCharacters(novosJogadores).then((dadosAtualizados) => {
      const novaComposicao = composicao.map((jogador) => {
        const chave = `${jogador.realm.toLowerCase()}-${jogador.nome.toLowerCase()}`;
        const atualizado = dadosAtualizados.find(
          (p) => `${p.realm.toLowerCase()}-${p.nome.toLowerCase()}` === chave
        );
        return atualizado ?? jogador;
      });

      setComposicao(novaComposicao);

      setJogadoresNovos((prev) => {
        const novoSet = new Set(prev);
        novosJogadores.forEach((jogador) => {
          const chave = `${jogador.realm.toLowerCase()}-${jogador.nome.toLowerCase()}`;
          novoSet.delete(chave);
        });
        return novoSet;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogadoresNovos]);

  return { composicao, loading, setComposicao };
}
