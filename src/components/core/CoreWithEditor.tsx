import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { CoreCard } from "./CoreCard";
import { CoreEditor } from "./CoreEditor";
import { saveCore, Core } from "../../lib/firestoreService";

// Tempo de expiração do cache (6 horas)
const CACHE_EXPIRATION_MS = 6 * 60 * 60 * 1000;

// 🔸 Função para obter do cache
function getCachedCharacter(realm: string, name: string) {
  const key = `char-${realm.toLowerCase()}-${name.toLowerCase()}`;
  const item = localStorage.getItem(key);

  if (!item) return null;

  try {
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_EXPIRATION_MS) {
      console.log(`⏰ Cache expirado para ${name} - ${realm}`);
      localStorage.removeItem(key);
      return null;
    }
    console.log(`✅ Pegando do cache: ${name} - ${realm}`);
    return data;
  } catch (error) {
    console.error(`Erro ao parsear cache para ${name} - ${realm}`, error);
    localStorage.removeItem(key);
    return null;
  }
}

// 🔸 Função para salvar no cache
function setCachedCharacter(realm: string, name: string, data: any) {
  const key = `char-${realm.toLowerCase()}-${name.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  console.log(`💾 Salvando no cache: ${name} - ${realm}`);
}

export function CoreWithEditor({ core: coreOriginal }: { core: Core }) {
  const { user, loading: authLoading, role } = useAuth();
  const showEditor = !authLoading && user && role === "RL";

  const [core, setCore] = useState(coreOriginal);
  const [loading, setLoading] = useState(true);

  // Lista de jogadores recém adicionados para ignorar cache
  const [jogadoresNovos, setJogadoresNovos] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchAndCache() {
      setLoading(true);

      const composicaoAtualizada = await Promise.all(
        core.composicaoAtual.map(async (jogador) => {
          const chave = `${jogador.realm.toLowerCase()}-${jogador.nome.toLowerCase()}`;

          if (!jogadoresNovos.has(chave)) {
            const cached = getCachedCharacter(jogador.realm, jogador.nome);
            if (cached) {
              return { ...jogador, ...cached };
            }
          } else {
            console.log(
              `🔄 Ignorando cache para novo jogador ${jogador.nome} - ${jogador.realm}`
            );
          }

          try {
            console.log(
              `[LOG] Buscando da API para ${jogador.nome} - ${jogador.realm}`
            );
            const res = await fetch(
              `/api/blizzard/character?realm=${encodeURIComponent(
                jogador.realm
              )}&name=${encodeURIComponent(jogador.nome)}`
            );

            if (!res.ok) {
              console.error(
                `[ERRO] API falhou para ${jogador.nome}: ${res.status}`
              );
              return jogador;
            }

            const dados = await res.json();
            setCachedCharacter(jogador.realm, jogador.nome, dados);

            // Remove da lista de novos após buscar da API
            setJogadoresNovos((prev) => {
              const novoSet = new Set(prev);
              novoSet.delete(chave);
              return novoSet;
            });

            return { ...jogador, ...dados };
          } catch (err) {
            console.error(
              `[ERRO] Falha na requisição para ${jogador.nome}:`,
              err
            );
            return jogador;
          }
        })
      );

      setCore({ ...core, composicaoAtual: composicaoAtualizada });
      setLoading(false);
    }

    fetchAndCache();
  }, [coreOriginal, jogadoresNovos]);

  // Função que o editor chama para salvar e registrar jogadores novos
  async function handleSalvarCore(coreAtualizado: Core) {
    setLoading(true);
    try {
      await saveCore(coreAtualizado);
      setCore(coreAtualizado);

      const jogadoresAnteriores = new Set(
        core.composicaoAtual.map(
          (p) => `${p.realm.toLowerCase()}-${p.nome.toLowerCase()}`
        )
      );

      const jogadoresNovosSet = new Set<string>();
      coreAtualizado.composicaoAtual.forEach((p) => {
        const chave = `${p.realm.toLowerCase()}-${p.nome.toLowerCase()}`;
        if (!jogadoresAnteriores.has(chave)) {
          jogadoresNovosSet.add(chave);
        }
      });

      setJogadoresNovos(jogadoresNovosSet);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
      <div className="min-w-[600px] flex-shrink-0">
        <CoreCard core={core} loading={loading} />
      </div>

      {showEditor && (
        <div className="flex-1 min-w-[600px]">
          <CoreEditor core={core} onSave={handleSalvarCore} loading={loading} />
        </div>
      )}
    </div>
  );
}
