"use client";

import { useState } from "react";
import { Core, Player } from "../../lib/firestoreService";
import { useToast } from "../ui/ToastContainer";
import { Pencil, Trash2 } from "lucide-react";

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
  const [composicao, setComposicao] = useState<Player[]>(
    core.composicaoAtual || []
  );

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
      // Editar
      const atualizada = [...composicao];
      atualizada[editIndex] = player;
      setComposicao(atualizada);
      showToast("Jogador editado com sucesso.", "success");
    } else {
      // Adicionar novo
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
    <div className="max-w-5xl mx-auto p-8 sm:p-10 bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a] shadow-lg text-white font-nunito">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8">
        Editar Core: <span className="text-lime-400">{core.nome}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Nome do Core", value: nome, setter: setNome },
          { label: "Dias", value: dias, setter: setDias },
          { label: "Precisa de", value: precisaDe, setter: setPrecisaDe },
          { label: "Boss Atual", value: bossAtual, setter: setBossAtual },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[#444] bg-[#2a2a2a] px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none"
              placeholder={label}
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Informações
          </label>
          <textarea
            value={informacoes}
            onChange={(e) => setInformacoes(e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full rounded-xl border border-[#444] bg-[#2a2a2a] px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none resize-none"
            placeholder="Digite informações adicionais..."
          />
        </div>
      </div>

      <hr className="my-10 border-[#333]" />

      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Composição Atual</h3>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              limparCampos();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
          >
            {showAddForm ? "Cancelar" : "+ Adicionar Membro"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-4 mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <input
                placeholder="Nome *"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="rounded-xl border border-[#555] bg-[#1f1f1f] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                placeholder="Reino *"
                value={novoRealm}
                onChange={(e) => setNovoRealm(e.target.value)}
                className="rounded-xl border border-[#555] bg-[#1f1f1f] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                placeholder="Discord"
                value={novoDiscord}
                onChange={(e) => setNovoDiscord(e.target.value)}
                className="rounded-xl border border-[#555] bg-[#1f1f1f] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                placeholder="BattleTag"
                value={novoBattletag}
                onChange={(e) => setNovoBattletag(e.target.value)}
                className="rounded-xl border border-[#555] bg-[#1f1f1f] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={adicionarOuEditarJogador}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl text-white font-medium transition disabled:opacity-60"
            >
              {editIndex !== null ? "Salvar Edição" : "Adicionar Jogador"}
            </button>
          </div>
        )}

        {composicao.length === 0 ? (
          <p className="text-gray-400 italic mb-6">
            Nenhum jogador adicionado.
          </p>
        ) : (
          <div className="overflow-x-auto mb-8">
  <div
    className="
      max-h-64 overflow-y-auto rounded-xl border border-[#444]
      scrollbar-thin scrollbar-thumb-lime-600 scrollbar-track-[#1f1f1f]
      scrollbar-thumb-rounded
    "
    style={{
      scrollbarWidth: "thin",
      scrollbarColor: "#84cc16 #1f1f1f",
    }}
  >
    <table className="w-full border-collapse border border-[#444]">
      <thead className="bg-[#2a2a2a] sticky top-0">
        <tr>
          <th className="p-2 text-left border-b border-[#444]">Nome</th>
          <th className="p-2 text-left border-b border-[#444]">Reino</th>
          <th className="p-2 text-left border-b border-[#444]">Discord</th>
          <th className="p-2 text-left border-b border-[#444]">BattleTag</th>
          <th className="p-2 text-center border-b border-[#444]">Ações</th>
        </tr>
      </thead>
      <tbody>
        {composicao.map((player, idx) => (
          <tr
            key={`${player.nome}-${player.realm}`}
            className={`${
              idx % 2 === 0 ? "bg-[#222]" : "bg-[#1a1a1a]"
            } hover:bg-[#2f2f2f] transition-colors`}
          >
            <td className="p-2 border-b border-[#444]">{player.nome}</td>
            <td className="p-2 border-b border-[#444]">{player.realm}</td>
            <td className="p-2 border-b border-[#444]">
              {player.discord || (
                <span className="text-gray-500 italic">-</span>
              )}
            </td>
            <td className="p-2 border-b border-[#444]">
              {player.battletag || (
                <span className="text-gray-500 italic">-</span>
              )}
            </td>
            <td className="p-2 border-b border-[#444] text-center">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => editarJogador(idx)}
                  className="text-blue-500 hover:text-blue-600"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => removerJogador(idx)}
                  className="text-red-500 hover:text-red-600"
                  title="Remover"
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
