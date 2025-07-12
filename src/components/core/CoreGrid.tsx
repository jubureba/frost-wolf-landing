import { Core } from "@/lib/firestoreService";
import { CoreWithEditor } from "./CoreWithEditor";

interface Props {
  cores: Core[];
  containerRef: React.RefObject<HTMLDivElement | null>
  editingCoreId: string | null;
  onStartEdit: (id: string) => void;
  onFinishEdit: () => void;
  onRemoveClick?: (id: string) => void;
  modoReordenacao: boolean;
}

export function CoreGrid({
  cores,
  containerRef,
  editingCoreId,
  onStartEdit,
  onFinishEdit,
  onRemoveClick,
  modoReordenacao,
}: Props) {
  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {(editingCoreId ? cores.filter(c => c.id === editingCoreId) : cores).map(core => (
        <div key={core.id} data-id={core.id}>
          <CoreWithEditor
            core={core}
            isEditing={editingCoreId === core.id}
            hideWhenEditing={editingCoreId !== null && editingCoreId !== core.id}
            onStartEdit={() => onStartEdit(core.id)}
            onFinishEdit={onFinishEdit}
            onRemoveClick={() => onRemoveClick?.(core.id)}
            modoReordenacao={modoReordenacao}
          />
        </div>
      ))}
    </div>
  );
}
