import { useState, useEffect } from "react";
import { criarNovoCore, getCores, saveCore, deleteCore, Core } from "@/lib/firestoreService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/shared/ToastContainer";
import { logError } from "@/utils/logger";

export function useCores() {
  const { user, role, coreId: userCoreId } = useAuth();
  const { showToast } = useToast();

  const [cores, setCores] = useState<Core[]>([]);
  const [editingCoreId, setEditingCoreId] = useState<string | null>(null);
  const [modoReordenacao, setModoReordenacao] = useState(false);
  const [loadingRemocao, setLoadingRemocao] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const raw = await getCores();
      const parsed = raw.map(c => ({ ...c, recrutando: c.recrutando ?? false }));
      setCores(parsed.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
    }
    fetchData();
  }, []);

  const salvarOrdem = async () => {
    try {
      await Promise.all(cores.map((core, index) => saveCore({ ...core, ordem: index })));
      return true;
    } catch (err) {
      logError("Erro ao salvar nova ordem", err);
      return false;
    }
  };

  const removerCore = async (coreId: string) => {
    const core = cores.find(c => c.id === coreId);
    if (!core) return;

    showToast(`Deseja remover o Core "${core.nome}"?`, "warning", {
      actionLabel: "Remover",
      onAction: async () => {
        try {
          setLoadingRemocao(true);
          await deleteCore(coreId);
          setCores(prev => prev.filter(c => c.id !== coreId));
          showToast("Core removido com sucesso!", "info");
          if (editingCoreId === coreId) setEditingCoreId(null);
        } catch (err) {
          logError("Erro ao remover core", err);
          showToast("Falha ao remover core.", "error");
        } finally {
          setLoadingRemocao(false);
        }
      },
    });
  };

  const handleStartEdit = (coreId: string) => {
    if (role === "ADMIN" || (role === "RL" && userCoreId === coreId)) {
      setEditingCoreId(coreId);
    } else {
      alert("Você não tem permissão para editar este core.");
    }
  };

  const handleNovoCore = async () => {
    const novo = await criarNovoCore();
    setCores(prev => [...prev, novo]);
  };

  return {
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
    user,
    canEdit: role === "ADMIN" || role === "RL",
    canEditAll: role === "ADMIN",
  };
}
