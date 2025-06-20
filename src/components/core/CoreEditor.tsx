"use client";

import React, { useState } from "react";
import { Core, Player } from "../../lib/firestoreService";
import { useToast } from "../ui/ToastContainer";
import { Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Checkbox com animação
function Checkbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`inline-flex items-center cursor-pointer select-none ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div
        className={`relative w-4 h-4 rounded-lg border-2 transition-colors flex justify-center items-center
        ${checked ? "border-lime-500 bg-lime-600" : "border-neutral-700 bg-neutral-800"}
        ${disabled ? "pointer-events-none" : "hover:border-lime-400"}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              key="checkmark"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={3}
              className="w-4 h-4"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      {label && (
        <span
          className={`ml-3 text-sm font-semibold ${
            disabled ? "text-gray-500" : "text-lime-400"
          }`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </span>
      )}
    </label>
  );
}

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
  const [recrutando, setRecrutando] = useState(core.recrutando || false);
  const [linkRecrutamento, setLinkRecrutamento] = useState(
    core.linkRecrutamento || ""
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [novoNome, setNovoNome] = useState("");
  const [novoRealm, setNovoRealm] = useState("");
  const [novoDiscord, setNovoDiscord] = useState("");
  const [novoBattletag, setNovoBattletag] = useState("");
  const [novoTwitch, setNovoTwitch] = useState("");

  function limparCampos() {
    setNovoNome("");
    setNovoRealm("");
    setNovoDiscord("");
    setNovoBattletag("");
    setNovoTwitch("");
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
      precisaDe: recrutando ? precisaDe : "Não estamos recrutando no momento",
      bossAtual,
      composicaoAtual: composicao,
      recrutando,
      linkRecrutamento,
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
      twitch: novoTwitch.trim() || undefined,
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
    setNovoTwitch(player.twitch ?? "");
    setEditIndex(index);
    setShowAddForm(true);
  }

  return (
    <div className="max-w-5xl mx-auto p-8 sm:p-10 bg-neutral-900 rounded-2xl border border-neutral-700 shadow-lg text-neutral-100 font-nunito select-none">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-lime-400">
        Editar Core: <span className="text-white">{core.nome}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Nome do Core
          </label>
          <input
            type="text"
            placeholder="Digite o nome do core"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Dia/Hora
          </label>
          <input
            type="text"
            placeholder="Quando ocorrem as runs"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition disabled:opacity-60"
          />
        </div>

        <div className="mb-4 select-none">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => !loading && setRecrutando(!recrutando)}
          >
            <Checkbox
              checked={recrutando}
              onChange={setRecrutando}
              disabled={loading}
            />
            <label
              htmlFor="precisaDeInput"
              className="text-sm font-medium text-gray-400 select-none"
            >
              Recrutando
            </label>
          </div>

          <AnimatePresence initial={false}>
            {recrutando && (
              <motion.input
                key="input-precisaDe"
                id="precisaDeInput"
                type="text"
                placeholder="Ex: Tanks, Healers, DPS..."
                value={precisaDe}
                onChange={(e) => setPrecisaDe(e.target.value)}
                disabled={loading}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition disabled:opacity-60 max-w-xs"
              />
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Luta Atual
          </label>
          <input
            type="text"
            placeholder="Boss que estão enfrentando"
            value={bossAtual}
            onChange={(e) => setBossAtual(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition disabled:opacity-60"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Informações
          </label>
          <textarea
            placeholder="Digite informações adicionais..."
            value={informacoes}
            onChange={(e) => setInformacoes(e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none resize-none transition disabled:opacity-60"
          />
        </div>

        <AnimatePresence initial={false}>
  {recrutando && (
    <motion.div
      key="link-recrutamento"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sm:col-span-2 overflow-hidden"
    >
      <label className="block text-sm font-medium text-gray-400 mb-1">
        Link de Recrutamento
      </label>
      <input
        type="text"
        placeholder="https://..."
        value={linkRecrutamento}
        onChange={(e) => setLinkRecrutamento(e.target.value)}
        disabled={loading}
        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none transition disabled:opacity-60"
      />
    </motion.div>
  )}
</AnimatePresence>

      </div>


      <hr className="my-10 border-neutral-700" />

      {/* Composição Atual */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-lime-400">
            Composição Atual
          </h3>
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

        {/* Formulário de adicionar/editar */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
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
                <input
                  placeholder="Twitch"
                  value={novoTwitch}
                  onChange={(e) => setNovoTwitch(e.target.value)}
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
          <p className="text-gray-500 italic mb-6">
            Nenhum jogador adicionado.
          </p>
        ) : (
          <div className="overflow-x-auto mb-8">
            <div
              className="max-h-64 overflow-y-auto rounded-xl border border-neutral-700
              scrollbar-thin scrollbar-thumb-lime-600 scrollbar-track-neutral-900 scrollbar-thumb-rounded"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#84cc16 #1f1f1f",
              }}
            >
              <table className="w-full table-fixed border-collapse border border-neutral-700">
  <thead className="bg-neutral-800 sticky top-0">
    <tr>
      <th className="p-2 text-left border-b border-neutral-700">Nome</th>
      <th className="p-2 text-left border-b border-neutral-700">Reino</th>
      <th className="p-2 text-left border-b border-neutral-700">BattleTag</th>
      <th className="p-2 text-center border-b border-neutral-700">Ações</th>
    </tr>
  </thead>
  <tbody>
    {composicao.map((player, idx) => (
      <tr
        key={`${player.nome}-${player.realm}`}
        className={`${
          idx % 2 === 0 ? "bg-neutral-900" : "bg-neutral-800"
        } hover:bg-neutral-700 transition-colors`}
      >
        <td className="p-2 border-b border-neutral-700">{player.nome}</td>
        <td className="p-2 border-b border-neutral-700">{player.realm}</td>
        
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
      </div>

      <button
        onClick={salvarTudo}
        disabled={loading}
        className="bg-lime-600 hover:bg-lime-700 px-6 py-3 rounded-xl text-white font-semibold w-full sm:w-auto transition disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar Core"}
      </button>
    </div>
  );
}
