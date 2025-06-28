"use client";

import { useEffect, useRef, useState } from "react";
import {
  criarNovoCore,
  getCores,
  saveCore,
  deleteCore,
  Core,
} from "../lib/firestoreService";
import { CoreWithEditor } from "../components/core/CoreWithEditor";
import { Header } from "../components/layout/Header";
import { Filters } from "../components/layout/Filters";
import { FloatingButton } from "../components/layout/FloatingButton";
import { Footer } from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import Sortable from "sortablejs";
import { logError } from "../utils/logger";
import { useToast } from "../components/ui/ToastContainer";

export default function Home() {
  const { user, role, coreId: userCoreId } = useAuth();
  const [cores, setCores] = useState<Core[]>([]);
  const [editingCoreId, setEditingCoreId] = useState<string | null>(null);
  const [modoReordenacao, setModoReordenacao] = useState(false);
  const [loadingRemocao, setLoadingRemocao] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetch() {
      const dadosRaw = await getCores();
      const dados: Core[] = dadosRaw.map((core) => ({
        ...core,
        recrutando: core.recrutando ?? false,
      }));
      setCores(dados.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
    }
    fetch();
  }, []);

  useEffect(() => {
    if (!modoReordenacao || !containerRef.current) return;

    const sortable = Sortable.create(containerRef.current, {
      animation: 150,
      handle: ".drag-handle",
      onEnd: () => {
        const novaOrdemIds = Array.from(containerRef.current!.children).map(
          (el) => el.getAttribute("data-id")
        );

        const novaLista = novaOrdemIds
          .map((id) => cores.find((core) => core.id === id))
          .filter(Boolean) as Core[];

        setCores(novaLista);
      },
    });

    return () => sortable.destroy();
  }, [modoReordenacao, cores]);

  function handleStartEdit(coreId: string) {
    if (role === "ADMIN" || (role === "RL" && userCoreId === coreId)) {
      setEditingCoreId(coreId);
    } else {
      alert("Você não tem permissão para editar este core.");
    }
  }

  async function handleSalvarOrdem() {
    try {
      await Promise.all(
        cores.map((core, index) => saveCore({ ...core, ordem: index }))
      );
      alert("Ordem salva com sucesso!");
      setModoReordenacao(false);
    } catch (err) {
      logError("Erro ao salvar nova ordem", err);
      alert("Erro ao salvar ordem.");
    }
  }

  function handleRemoveCore(coreId: string) {
    const core = cores.find((c) => c.id === coreId);
    if (!core) return;

    showToast(`Deseja remover o Core "${core.nome}"?`, "warning", {
      actionLabel: "Remover",
      onAction: async () => {
        try {
          setLoadingRemocao(true);
          await deleteCore(coreId);
          setCores((prev) => prev.filter((c) => c.id !== coreId));
          showToast("Core removido com sucesso!", "info");
          if (editingCoreId === coreId) setEditingCoreId(null);
        } catch (error) {
          logError("Erro ao remover core", error);
          showToast("Falha ao remover core.", "error");
        } finally {
          setLoadingRemocao(false);
        }
      },
    });
  }

  return (
    <main className="min-h-screen bg-[#121212] p-4 sm:p-6 flex flex-col">
      <Header />
      <Filters />

      <div className="flex justify-between items-center mb-6">

        {(role === "ADMIN" || role === "RL") && (
          <div className="flex gap-2 items-center">
            {modoReordenacao && (
              <button
                onClick={handleSalvarOrdem}
                disabled={loadingRemocao}
                className="rounded-xl border border-lime-500 text-lime-400 hover:bg-lime-500 hover:text-black px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Salvar Ordem
              </button>
            )}
            <button
              onClick={() => setModoReordenacao((prev) => !prev)}
              disabled={loadingRemocao}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition 
          ${
            modoReordenacao
              ? "border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              : "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-lime-400"
          }
        disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {modoReordenacao ? "Cancelar" : "Reordenar Cores"}
            </button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {(editingCoreId
          ? cores.filter((core) => core.id === editingCoreId)
          : cores
        ).map((core) => (
          <div key={core.id} data-id={core.id}>
            <CoreWithEditor
              key={core.id}
              core={core}
              isEditing={editingCoreId === core.id}
              hideWhenEditing={
                editingCoreId !== null && editingCoreId !== core.id
              }
              onStartEdit={() => handleStartEdit(core.id)}
              onFinishEdit={() => setEditingCoreId(null)}
              modoReordenacao={modoReordenacao}
              onRemoveClick={() => handleRemoveCore(core.id)}
            />
          </div>
        ))}
      </div>

      {!modoReordenacao && user && (role === "ADMIN" || role === "RL") && (
        <FloatingButton
          action={async () => {
            const novoCore = await criarNovoCore();
            setCores((prev) => [...prev, novoCore]);
          }}
          disabled={loadingRemocao}
        >
          +
        </FloatingButton>
      )}

      <Footer />
    </main>
  );
}
