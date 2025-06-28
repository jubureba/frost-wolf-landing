"use client";

import { useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";
import { Core, getCores, saveCore } from "../lib/firestoreService";
import { CoreWithEditor } from "./core/CoreWithEditor";
import { logError } from "../utils/logger";

export default function CoreListWithReorder() {
  const [cores, setCores] = useState<Core[]>([]);
  const [modoReordenacao, setModoReordenacao] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCores() {
      const data = await getCores();
      setCores(data.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
      setLoading(false);
    }

    fetchCores();
  }, []);

  useEffect(() => {
    if (!modoReordenacao || !containerRef.current) return;

    const sortable = Sortable.create(containerRef.current, {
      animation: 150,
      handle: ".drag-handle",
      onEnd: () => {
        const novaOrdemIds = Array.from(containerRef.current!.children).map(
          (el) => el.getAttribute("data-id")!
        );
        const novaLista = novaOrdemIds
          .map((id) => cores.find((c) => c.id === id))
          .filter(Boolean) as Core[];

        setCores(novaLista);
      },
    });

    return () => sortable.destroy();
  }, [modoReordenacao, cores]);

  async function salvarNovaOrdem() {
    try {
      setLoading(true);
      await Promise.all(
        cores.map((core, index) =>
          saveCore({
            ...core,
            ordem: index,
          })
        )
      );
      alert("Nova ordem salva com sucesso.");
      setModoReordenacao(false);
    } catch (err) {
      logError("Erro ao salvar nova ordem", err);
      alert("Erro ao salvar ordem.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function removerCoreDaLista(id: string) {
    setCores((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Lista de Cores</h2>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => setModoReordenacao((v) => !v)}
          >
            {modoReordenacao ? "Cancelar" : "Reordenar"}
          </button>

          {modoReordenacao && (
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={salvarNovaOrdem}
            >
              Salvar Nova Ordem
            </button>
          )}
        </div>
      </div>

      {loading && <p>Carregando cores...</p>}

      {!loading && (
        <div
          ref={containerRef}
          className="flex flex-col gap-4"
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          {cores.map((core) => (
            <div key={core.id} data-id={core.id}>
              <div className="drag-handle cursor-move mb-1 text-gray-400 text-sm select-none">
                ☰ arraste
              </div>
              <CoreWithEditor
                key={core.id}
                core={core}
                onFinishEdit={() => {}}
                onStartEdit={() => {}}
                onOrdemSalva={() => {}}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
