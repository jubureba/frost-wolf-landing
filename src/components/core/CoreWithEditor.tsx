import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { CoreCard } from "./CoreCard";
import { CoreEditor } from "./CoreEditor";
import { saveCore, Core } from "../../lib/firestoreService";
import { logInfo, logError } from "../../utils/logger";

// 🔸 Tempo de expiração do cache (6 horas)
const CACHE_EXPIRATION_MS = 6 * 60 * 60 * 1000;

// 🔸 Dados genéricos de personagem
type CharacterData = Record<string, unknown>;

// 🔸 Função para obter do cache
function getCachedCharacter(realm: string, name: string): CharacterData | null {
  const key = `char-${realm.toLowerCase()}-${name.toLowerCase()}`;
  const item = localStorage.getItem(key);

  if (!item) return null;

  try {
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_EXPIRATION_MS) {
      logInfo(`⏰ Cache expirado para ${name} - ${realm}`);
      localStorage.removeItem(key);
      return null;
    }
    logInfo(`✅ Pegando do cache: ${name} - ${realm}`);
    return data;
  } catch (error) {
    logError(`Erro ao parsear cache para ${name} - ${realm}`, error);
    localStorage.removeItem(key);
    return null;
  }
}

// 🔸 Função para salvar no cache
function setCachedCharacter(realm: string, name: string, data: CharacterData) {
  const key = `char-${realm.toLowerCase()}-${name.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  logInfo(`💾 Salvando no cache: ${name} - ${realm}`);
}

export function CoreWithEditor({ core: coreOriginal }: { core: Core }) {
  const { user, loading: authLoading, role } = useAuth();
  const showEditor = !authLoading && user && role === "RL";

  const [core, setCore] = useState(coreOriginal);
  const [composicao, setComposicao] = useState(coreOriginal.composicaoAtual);
  const [loading, setLoading] = useState(true);

  const [jogadoresNovos, setJogadoresNovos] = useState<Set<string>>(new Set());

  // 🔸 Carregamento inicial
  useEffect(() => {
    fetchAndCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔸 Quando adicionar jogadores novos, busca da API (ignora cache desses)
  useEffect(() => {
    if (jogadoresNovos.size > 0) {
      fetchAndCache(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogadoresNovos]);

  // 🔸 Função principal de busca
  async function fetchAndCache(ignoreCache = false) {
    setLoading(true);

    const composicaoAtualizada = await Promise.all(
      composicao.map(async (jogador) => {
        const chave = `${jogador.realm.toLowerCase()}-${jogador.nome.toLowerCase()}`;

        // Verifica cache (se permitido e não for novo)
        if (!ignoreCache && !jogadoresNovos.has(chave)) {
          const cached = getCachedCharacter(jogador.realm, jogador.nome);
          if (cached) {
            return { ...jogador, ...cached };
          }
        } else {
          logInfo(
            `🔄 Ignorando cache para ${jogador.nome} - ${jogador.realm}`
          );
        }

        // Busca na API
        try {
          logInfo(`🌐 Buscando da API para ${jogador.nome} - ${jogador.realm}`);
          const res = await fetch(
            `/api/blizzard/character?realm=${encodeURIComponent(
              jogador.realm
            )}&name=${encodeURIComponent(jogador.nome)}`
          );

          if (!res.ok) {
            logError(
              `[ERRO] API falhou para ${jogador.nome}: ${res.status}`,
              { status: res.status }
            );
            return jogador;
          }

          const dados = await res.json();
          setCachedCharacter(jogador.realm, jogador.nome, dados);

          // Remove da lista de novos se estava lá
          if (jogadoresNovos.has(chave)) {
            setJogadoresNovos((prev) => {
              const novoSet = new Set(prev);
              novoSet.delete(chave);
              return novoSet;
            });
          }

          return { ...jogador, ...dados };
        } catch (err) {
          logError(`[ERRO] Falha na requisição para ${jogador.nome}`, err);
          return jogador;
        }
      })
    );

    setComposicao(composicaoAtualizada);
    setLoading(false);
  }

  // 🔸 Função para salvar o core e identificar novos jogadores
  async function handleSalvarCore(coreAtualizado: Core) {
    setLoading(true);
    try {
      await saveCore(coreAtualizado);
      setCore(coreAtualizado);
      setComposicao(coreAtualizado.composicaoAtual);

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
      logInfo(`Core salvo com sucesso`, { coreAtualizado });
    } catch (error) {
      logError(`Erro ao salvar core`, error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
      <div className="min-w-[600px] flex-shrink-0">
        <CoreCard
          core={{
            ...core,
            composicaoAtual: composicao,
            recrutando: core.recrutando ?? false,
          }}
          loading={loading}
        />
      </div>

      {showEditor && (
        <div className="flex-1 min-w-[600px]">
          <CoreEditor
            core={{ ...core, composicaoAtual: composicao }}
            onSave={handleSalvarCore}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
