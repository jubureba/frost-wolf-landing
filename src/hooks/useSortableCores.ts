import { useEffect } from "react";
import Sortable from "sortablejs";
import { Core } from "@/lib/firestoreService";

export function useSortableCores(
  containerRef: React.RefObject<HTMLDivElement | null>,
  modoReordenacao: boolean,
  cores: Core[],
  setCores: (lista: Core[]) => void
) {
  useEffect(() => {
    if (!modoReordenacao || !containerRef.current) return;

    const sortable = Sortable.create(containerRef.current, {
      animation: 150,
      handle: ".drag-handle",
      onEnd: () => {
        const novaOrdemIds = Array.from(containerRef.current!.children).map(
          el => el.getAttribute("data-id")
        );

        const novaLista = novaOrdemIds
          .map(id => cores.find(core => core.id === id))
          .filter(Boolean) as Core[];

        setCores(novaLista);
      },
    });

    return () => sortable.destroy();
  }, [modoReordenacao, cores]);
}
