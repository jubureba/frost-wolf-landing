import React, { useEffect, useState } from 'react';
import { getCores, saveCore, deleteCore, Core } from '../lib/firestoreService';
import { useIsRL } from '../hooks/useIsRL';

export function AdminCores() {
  const { isRL } = useIsRL();
  const [cores, setCores] = useState<Core[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCore, setEditingCore] = useState<Core | null>(null);

  const fetchCores = async () => {
    setLoading(true);
    try {
      const cores = await getCores();
      setCores(cores);
    } catch (e) {
      alert('Erro ao carregar cores');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRL) {
      fetchCores();
    }
  }, [isRL]);

  if (!isRL) return <p>Você não tem permissão para acessar esta página.</p>;

  // Limpa formulário
  const limparFormulario = () => setEditingCore(null);

  // Atualiza ou cria
  const salvarCore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCore) return;

    if (!editingCore.nome) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      await saveCore(editingCore);
      alert('Core salvo com sucesso!');
      limparFormulario();
      fetchCores();
    } catch (err) {
      alert('Erro ao salvar core');
      console.error(err);
    }
  };

  // Deleta core
  const removerCore = async (nome: string) => {
    if (!confirm(`Deseja realmente remover o core "${nome}"?`)) return;
    try {
      await deleteCore(nome);
      alert('Core removido!');
      fetchCores();
    } catch (err) {
      alert('Erro ao remover core');
      console.error(err);
    }
  };

  // Editar core (preenche formulário)
  const editarCore = (core: Core) => {
    setEditingCore(core);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-[#1a002e]/80 rounded-xl border border-purple-600">
      <h2 className="text-xl font-bold mb-4 text-purple-300">Painel Admin Cores</h2>

      <form onSubmit={salvarCore} className="mb-8 space-y-3">
        <input
          type="text"
          placeholder="Nome"
          value={editingCore?.nome ?? ''}
          onChange={(e) => setEditingCore((c) => ({ ...c!, nome: e.target.value }))}
          className="w-full p-2 rounded bg-[#330066] text-purple-200 border border-purple-500"
          disabled={!!editingCore?.nome} // bloqueia mudar nome se editar (chave)
          required
        />

        <textarea
          placeholder="Informações"
          value={editingCore?.informacoes ?? ''}
          onChange={(e) => setEditingCore((c) => ({ ...c!, informacoes: e.target.value }))}
          className="w-full p-2 rounded bg-[#330066] text-purple-200 border border-purple-500"
          rows={2}
        />

        <input
          type="text"
          placeholder="Dias"
          value={editingCore?.dias ?? ''}
          onChange={(e) => setEditingCore((c) => ({ ...c!, dias: e.target.value }))}
          className="w-full p-2 rounded bg-[#330066] text-purple-200 border border-purple-500"
        />

        <input
          type="text"
          placeholder="Precisa de"
          value={editingCore?.precisaDe ?? ''}
          onChange={(e) => setEditingCore((c) => ({ ...c!, precisaDe: e.target.value }))}
          className="w-full p-2 rounded bg-[#330066] text-purple-200 border border-purple-500"
        />

        <input
          type="text"
          placeholder="Boss Atual"
          value={editingCore?.bossAtual ?? ''}
          onChange={(e) => setEditingCore((c) => ({ ...c!, bossAtual: e.target.value }))}
          className="w-full p-2 rounded bg-[#330066] text-purple-200 border border-purple-500"
        />

        {/* Botão salvar */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white"
          >
            {editingCore?.nome ? 'Atualizar' : 'Criar'}
          </button>
          <button
            type="button"
            onClick={limparFormulario}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
          >
            Cancelar
          </button>
        </div>
      </form>

      <h3 className="text-lg font-semibold text-purple-300 mb-3">Lista de Cores</h3>

      {loading ? (
        <p>Carregando...</p>
      ) : cores.length === 0 ? (
        <p>Nenhum core cadastrado.</p>
      ) : (
        <ul className="space-y-3">
          {cores.map((core) => (
            <li
              key={core.nome}
              className="bg-[#330066] p-3 rounded flex justify-between items-center border border-purple-500"
            >
              <div>
                <strong className="text-purple-300">{core.nome}</strong> -{' '}
                <span className="text-purple-400">{core.informacoes}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editarCore(core)}
                  className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 rounded text-white"
                >
                  Editar
                </button>
                <button
                  onClick={() => removerCore(core.nome)}
                  className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1 rounded text-white"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
