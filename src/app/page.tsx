"use client";

import { useEffect, useState } from "react";
import { criarNovoCore, getCores, Core } from "../lib/firestoreService";
import { CoreWithEditor } from "../components/core/CoreWithEditor";
import { Header } from "../components/layout/Header";
import { Filters } from "../components/layout/Filters";
import { FloatingButton } from "../components/layout/FloatingButton";

export default function Home() {
  const [cores, setCores] = useState<Core[]>([]);
  const [editingCoreId, setEditingCoreId] = useState<string | null>(null); // controle de edição

  useEffect(() => {
    async function fetch() {
      const dadosRaw = await getCores();

      const dados: Core[] = dadosRaw.map((core) => ({
        ...core,
        recrutando: core.recrutando ?? false,
      }));

      setCores(dados);
    }

    fetch();
  }, []);

  return (
    <main className="min-h-screen bg-[#121212] p-4 sm:p-6">
      <Header />
      <Filters />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cores.map((core) => (
          <CoreWithEditor
            key={core.id}
            core={core}
            isEditing={editingCoreId === core.id}
            hideWhenEditing={
              editingCoreId !== null && editingCoreId !== core.id
            }
            onStartEdit={() => setEditingCoreId(core.id)}
            onFinishEdit={() => setEditingCoreId(null)}
          />
        ))}
      </div>

      <FloatingButton
        action={async () => {
          const novoCore = await criarNovoCore();
          setCores((prev) => [...prev, novoCore]);
        }}
      >
        +
      </FloatingButton>
    </main>
  );
}
