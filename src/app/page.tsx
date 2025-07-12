"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Filters } from "@/components/shared/Filters";
import { FloatingButton } from "@/components/shared/FloatingButton";
import { CoreActions } from "@/components/core/CoreActions";
import { CoreGrid } from "@/components/core/CoreGrid";
import { useCores } from "@/hooks/useCores";
import { useSortableCores } from "@/hooks/useSortableCores";
import { useRef } from "react";

export default function HomePage() {
  const {
    cores,
    setCores,
    editingCoreId,
    setEditingCoreId,
    modoReordenacao,
    setModoReordenacao,
    salvarOrdem,
    removerCore,
    handleStartEdit,
    handleNovoCore,
    loadingRemocao,
    canEdit,
    user,
    canEditAll,
  } = useCores();

  const containerRef = useRef<HTMLDivElement>(null);
  useSortableCores(containerRef, modoReordenacao, cores, setCores);

  return (
    <main className="min-h-screen bg-[#121212] p-4 sm:p-6 flex flex-col">
      <Header />
      <Filters />
      {canEditAll && (
        <CoreActions
          modoReordenacao={modoReordenacao}
          setModoReordenacao={setModoReordenacao}
          salvarOrdem={salvarOrdem}
          loadingRemocao={loadingRemocao}
        />
      )}
      <CoreGrid
        cores={cores}
        containerRef={containerRef}
        editingCoreId={editingCoreId}
        onStartEdit={handleStartEdit}
        onFinishEdit={() => setEditingCoreId(null)}
        onRemoveClick={canEditAll ? removerCore : undefined}
        modoReordenacao={modoReordenacao}
      />
      {!modoReordenacao && user && canEditAll && (
        <FloatingButton action={handleNovoCore} disabled={loadingRemocao}>
          +
        </FloatingButton>
      )}
      <Footer />
    </main>
  );
}
