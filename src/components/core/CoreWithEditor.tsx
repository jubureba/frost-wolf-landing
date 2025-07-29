"use client";

import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { CoreCard } from "./CoreCard";
import { CoreEditor } from "./CoreEditor";
import { saveCore, Core } from "../../lib/firestoreService";
// import { logError } from "../../utils/logger"; // removido
import { useFetchComposicao } from "../../hooks/useFetchComposicao";

export function CoreWithEditor({
  core: coreOriginal,
  isEditing = false,
  hideWhenEditing = false,
  onStartEdit,
  onFinishEdit,
  modoReordenacao = false,
  onRemoveClick,
}: {
  core: Core;
  isEditing?: boolean;
  hideWhenEditing?: boolean;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
  modoReordenacao?: boolean;
  onRemoveClick?: () => void;
}) {
  const { user, role, coreId, loading: authLoading } = useAuth();

  const canEdit =
    !authLoading &&
    user != null &&
    (role === "ADMIN" || (role === "RL" && coreId === coreOriginal.id));

  const [core, setCore] = useState(coreOriginal);
  const [jogadoresNovos, setJogadoresNovos] = useState<Set<string>>(new Set());

  const { composicao, loading, setComposicao } = useFetchComposicao(
    coreOriginal.composicaoAtual,
    jogadoresNovos,
    setJogadoresNovos
  );

  console.log("coreOriginal.composicaoAtual:", coreOriginal.composicaoAtual);
  console.log("composicao (do hook):", composicao);

  useEffect(() => {
    setComposicao(coreOriginal.composicaoAtual);
  }, [coreOriginal, setComposicao]);

  function handleToggleEdit() {
    if (isEditing) {
      onFinishEdit?.();
    } else {
      onStartEdit?.();
    }
  }

  async function handleSalvarCore(coreAtualizado: Core) {
    try {
      // Atualiza o core local (para nome, infos, dias etc.)
      setCore(coreAtualizado);

      // 📌 Atualiza também a composição para o CoreCard renderizar na hora
      setComposicao(coreAtualizado.composicaoAtual);

      await saveCore(coreAtualizado);

      const jogadoresAnteriores = new Set(
        coreOriginal.composicaoAtual.map(
          (p) => `${p.realm.toLowerCase()}-${p.nome.toLowerCase()}`
        )
      );

      const novosSet = new Set<string>();
      coreAtualizado.composicaoAtual.forEach((p) => {
        const chave = `${p.realm.toLowerCase()}-${p.nome.toLowerCase()}`;
        if (!jogadoresAnteriores.has(chave)) {
          novosSet.add(chave);
        }
      });

      setJogadoresNovos(novosSet);
    } catch (error) {
      console.error("Erro ao salvar core", error); // substitui logError
    }
  }

  if (hideWhenEditing) return null;

  console.log("CoreWithEditor - composicao:", composicao);
  console.log("CoreWithEditor - loading:", loading);

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
            showEditor={canEdit}
            modoReordenacao={modoReordenacao}
            onRemoveClick={onRemoveClick}
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
          showEditor={canEdit}
          modoReordenacao={modoReordenacao}
          onRemoveClick={onRemoveClick}
        />
      )}
    </div>
  );
}