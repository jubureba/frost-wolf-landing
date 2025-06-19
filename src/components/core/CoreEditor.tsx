"use client";

import { useState } from "react";
import { Core, Player } from "../../lib/firestoreService";
import { useToast } from "../ui/ToastContainer";
import { Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CoreEditorProps = {
  core: Core;
  onSave: (coreAtualizado: Core) => Promise<void>;
  loading: boolean;
};

export function CoreEditor({ core, onSave, loading }: CoreEditorProps) {
  const { showToast } = useToast();

  const [nome, setNome] = useState(core.nome);
  const [informacoes, setInformacoes] = useState(core.informacoes || "");
  const [dias, setDias] = useState(core.dias || "");
  const [precisaDe, setPrecisaDe] = useState(core.precisaDe || "");
  const [bossAtual, setBossAtual] = useState(core.bossAtual || "");
  const [composicao, setComposicao] = useState<Player[]>(core.composicaoAtual || []);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [novoNome, setNovoNome] = useState("");
  const [novoRealm, setNovoRealm] = useState("");
  const [novoDiscord, setNovoDiscord] = useState("");
  const [novoBattletag, setNovoBattletag] = useState("");

  function limparCampos() {
    setNovoNome("");
    setNovoRealm("");
    setNovoDiscord("");
    setNovoBattletag("");
    setEditIndex(null);
  }

  async function salvarTudo() {
    if (!nome.trim()) {
      showToast("Nome do Core é obrigatório.", "error");
      return;
    }
    const coreAtualizado: Core = {
      ...core,
      nome,
      informacoes,
      dias,
      precisaDe,
      bossAtual,
      composicaoAtual: composicao,
    };
    await onSave(coreAtualizado);
    showToast("Core salvo com sucesso!", "success");
  }

  function adicionarOuEditarJogador() {
    if (!novoNome.trim() || !novoRealm.trim()) {
      showToast("Preencha Nome e Reino.", "error");
      return;
    }

    const player: Player = {
      nome: novoNome.trim(),
      realm: novoRealm.trim(),
      discord: novoDiscord.trim() || undefined,
      battletag: novoBattletag.trim() || undefined,
    };

    if (editIndex !== null) {
      const atualizada = [...composicao];
      atualizada[editIndex] = player;
      setComposicao(atualizada);
      showToast("Jogador editado com sucesso.", "success");
    } else {
      const jaExiste = composicao.some(
        (p) => p.nome === player.nome && p.realm === player.realm
      );
      if (jaExiste) {
        showToast("Jogador já está na composição.", "error");
        return;
      }
      setComposicao((prev) => [...prev, player]);
      showToast("Jogador adicionado.", "success");
    }

    limparCampos();
    setShowAddForm(false);
  }

  function removerJogador(index: number) {
    const player = composicao[index];
    showToast(`Deseja remover ${player.nome} - ${player.realm}?`, "warning", {
      actionLabel: "Remover",
      onAction: () => {
        const atualizada = [...composicao];
        atualizada.splice(index, 1);
        setComposicao(atualizada);
        showToast("Jogador removido.", "info");
      },
    });
  }

  function editarJogador(index: number) {
    const player = composicao[index];
    setNovoNome(player.nome);
    setNovoRealm(player.realm);
    setNovoDiscord(player.discord ?? "");
    setNovoBattletag(player.battletag ?? "");
    setEditIndex(index);
    setShowAddForm(true);
  }

  return (
    <div className="max-w-5xl mx-auto p-8 sm:p-10 bg-neutral-900 rounded-2xl border border-neutral-700 shadow-lg text-neutral-100 font-nunito select-none">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-lime-400">
        Editar Core: <span className="text-white">{core.nome}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Nome do Core", value: nome, setter: setNome },
          { label: "Dias", value: dias, setter: setDias },
          { label: "Precisa de", value: precisaDe, setter: setPrecisaDe },
          { label: "Boss Atual", value: bossAtual, setter: setBossAtual },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition disabled:opacity-60"
              placeholder={label}
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Informações
          </label>
          <textarea
            value={informacoes}
            onChange={(e) => setInformacoes(e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none resize-none transition disabled:opacity-60"
            placeholder="Digite informações adicionais..."
          />
        </div>
      </div>

      <hr className="my-10 border-neutral-700" />

      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-lime-400">Composição Atual</h3>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              limparCampos();
            }}
            className={`px-4 py-2 rounded-xl transition font-semibold ${
              showAddForm
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {showAddForm ? "Cancelar" : "+ Adicionar Membro"}
          </button>
        </div>

        {/* Formulário de adicionar/editar animado */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden bg-neutral-800 border border-neutral-700 rounded-xl p-5 mb-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  placeholder="Nome *"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
                />
                <input
                  placeholder="Reino *"
                  value={novoRealm}
                  onChange={(e) => setNovoRealm(e.target.value)}
                  className="rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
                />
                <input
                  placeholder="Discord"
                  value={novoDiscord}
                  onChange={(e) => setNovoDiscord(e.target.value)}
                  className="rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
                />
                <input
                  placeholder="BattleTag"
                  value={novoBattletag}
                  onChange={(e) => setNovoBattletag(e.target.value)}
                  className="rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
                />
              </div>

              <button
                onClick={adicionarOuEditarJogador}
                disabled={loading}
                className="bg-lime-600 hover:bg-lime-700 px-6 py-2 rounded-xl text-white font-semibold transition disabled:opacity-60"
              >
                {editIndex !== null ? "Salvar Edição" : "Adicionar Jogador"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {composicao.length === 0 ? (
          <p className="text-gray-500 italic mb-6">Nenhum jogador adicionado.</p>
        ) : (
          <div className="overflow-x-auto mb-8">
            <div
              className="max-h-64 overflow-y-auto rounded-xl border border-neutral-700
              scrollbar-thin scrollbar-thumb-lime-600 scrollbar-track-neutral-900 scrollbar-thumb-rounded"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#84cc16 #1f1f1f" }}
            >
              <table className="w-full border-collapse border border-neutral-700">
                <thead className="bg-neutral-800 sticky top-0">
                  <tr>
                    <th className="p-2 text-left border-b border-neutral-700">Nome</th>
                    <th className="p-2 text-left border-b border-neutral-700">Reino</th>
                    <th className="p-2 text-left border-b border-neutral-700">Discord</th>
                    <th className="p-2 text-left border-b border-neutral-700">BattleTag</th>
                    <th className="p-2 text-center border-b border-neutral-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {composicao.map((player, idx) => (
                    <tr
                      key={`${player.nome}-${player.realm}`}
                      className={`${idx % 2 === 0 ? "bg-neutral-900" : "bg-neutral-800"} hover:bg-neutral-700 transition-colors`}
                    >
                      <td className="p-2 border-b border-neutral-700">{player.nome}</td>
                      <td className="p-2 border-b border-neutral-700">{player.realm}</td>
                      <td className="p-2 border-b border-neutral-700">
                        {player.discord || <span className="text-gray-500 italic">-</span>}
                      </td>
                      <td className="p-2 border-b border-neutral-700">
                        {player.battletag || <span className="text-gray-500 italic">-</span>}
                      </td>
                      <td className="p-2 border-b border-neutral-700 text-center">
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => editarJogador(idx)}
                            className="text-lime-400 hover:text-lime-500"
                            title="Editar"
                            aria-label={`Editar ${player.nome}`}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => removerJogador(idx)}
                            className="text-red-500 hover:text-red-600"
                            title="Remover"
                            aria-label={`Remover ${player.nome}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={salvarTudo}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-lime-600 text-white font-semibold hover:bg-lime-700 transition disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar Tudo"}
        </button>
      </div>
    </div>
  );
}
