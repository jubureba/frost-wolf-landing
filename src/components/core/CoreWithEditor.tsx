"use client";

import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { CoreCard } from "./CoreCard";
import { CoreEditor } from "./CoreEditor";
import { saveCore, Core } from "../../lib/firestoreService";
import { logError } from "../../utils/logger";

const CACHE_EXPIRATION_MS = 6 * 60 * 60 * 1000;

type CharacterData = Record<string, unknown>;

function getCachedCharacter(realm: string, name: string): CharacterData | null {
  const key = `char-${realm.toLowerCase()}-${name.toLowerCase()}`;
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_EXPIRATION_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function setCachedCharacter(realm: string, name: string, data: CharacterData) {
  const key = `char-${realm.toLowerCase()}-${name.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

export function CoreWithEditor({
  core: coreOriginal,
  isEditing = false,
  hideWhenEditing = false,
  onStartEdit,
  onFinishEdit,
}: {
  core: Core;
  isEditing?: boolean;
  hideWhenEditing?: boolean;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
}) {
  const { user, loading: authLoading } = useAuth();
  const showEditButton = !authLoading && user != null;

  const [core, setCore] = useState(coreOriginal);
  const [composicao, setComposicao] = useState(coreOriginal.composicaoAtual);
  const [loading, setLoading] = useState(true);
  const [jogadoresNovos, setJogadoresNovos] = useState<Set<string>>(new Set());

  async function handleToggleEdit() {
    if (isEditing) {
      if (onFinishEdit) onFinishEdit();
    } else {
      if (onStartEdit) onStartEdit();
    }
  }

  useEffect(() => {
    console.log("Composição atualizada:", composicao);
  }, [composicao]);

  useEffect(() => {
    setCore(coreOriginal);
    setComposicao(coreOriginal.composicaoAtual);
  }, [coreOriginal]);

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

  async function handleSalvarCore(coreAtualizado: Core) {
    setLoading(true);
    try {
      await saveCore(coreAtualizado);

      // Atualiza o estado com nova referência para forçar renderização
      setCore({
        ...coreAtualizado,
        composicaoAtual: [...coreAtualizado.composicaoAtual],
      });
      setComposicao([...coreAtualizado.composicaoAtual]);

      const jogadoresAnteriores = new Set(
        coreOriginal.composicaoAtual.map(
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
      logError(`Erro ao salvar core`, error);
    } finally {
      setLoading(false);
    }
  }

  if (hideWhenEditing) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-[900px_700px] gap-4">
          <CoreCard
            key={`${core.id}-${composicao.length}`}
            core={{
              ...core,
              composicaoAtual: composicao,
              recrutando: core.recrutando ?? false,
            }}
            loading={loading}
            onEditClick={handleToggleEdit}
            showEditor={showEditButton}
          />
          <CoreEditor
            core={{ ...core, composicaoAtual: composicao }}
            onSave={handleSalvarCore}
            loading={loading}
            onCancel={onFinishEdit}
          />
        </div>
      ) : (
        <CoreCard
          key={`${core.id}-${composicao.length}`}
          core={{
            ...core,
            composicaoAtual: composicao,
            recrutando: core.recrutando ?? false,
          }}
          loading={loading}
          onEditClick={handleToggleEdit}
          showEditor={showEditButton}
        />
      )}
    </div>
  );
}
