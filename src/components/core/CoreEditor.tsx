"use client";

import React, { useEffect, useState } from "react";
import { Core, Player } from "../../lib/firestoreService";
import { useToast } from "../ui/ToastContainer";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import { Checkbox } from "../ui/Checkbox";
import { InputField } from "../ui/InputField";
import { DiasHorarioSelector } from "../ui/DiasHorarioSelector";
import { CardSkeleton } from "../layout/CardSkeleton";

export function CoreEditor({
  core,
  onSave,
  loading,
  onCancel,
}: {
  core: Core;
  onSave: (coreAtualizado: Core) => Promise<void>;
  loading: boolean;
  onCancel?: () => void;
}) {
  const { showToast } = useToast();

  const [nome, setNome] = useState(core.nome);
  const [informacoes, setInformacoes] = useState(core.informacoes || "");
  const [precisaDe, setPrecisaDe] = useState(core.precisaDe || "");
  const [bossAtual, setBossAtual] = useState(core.bossAtual || "");
  const [composicao, setComposicao] = useState<Player[]>(
    core.composicaoAtual || []
  );
  const [recrutando, setRecrutando] = useState(core.recrutando || false);
  const [linkRecrutamento, setLinkRecrutamento] = useState(
    core.linkRecrutamento || ""
  );

  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");

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

  type DiasEHorario = {
    diasSelecionados: string[];
    horaInicio: string;
    horaFim: string;
  };

  function preencherDiasEHorarios(dados: Partial<DiasEHorario>) {
    if (!dados) return;

    if (Array.isArray(dados.diasSelecionados)) {
      setDiasSelecionados(dados.diasSelecionados);
    }
    if (dados.horaInicio) {
      setHoraInicio(dados.horaInicio);
    }
    if (dados.horaFim) {
      setHoraFim(dados.horaFim);
    }
  }

  useEffect(() => {
    if (core?.dias) {
      preencherDiasEHorarios(core.dias);
    }
  }, [core, preencherDiasEHorarios]);

  async function salvarTudo() {
    if (!nome.trim()) {
      showToast("Nome do Core é obrigatório.", "error");
      return;
    }
    if (diasSelecionados.length === 0) {
      showToast("Selecione pelo menos um dia.", "error");
      return;
    }
    if (!horaInicio || !horaFim) {
      showToast("Informe o horário de início e fim.", "error");
      return;
    }

    const coreAtualizado: Core = {
      ...core,
      nome,
      informacoes,
      dias: {
        diasSelecionados,
        horaInicio,
        horaFim,
      },
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
    <div className="max-w-5xl mx-auto p-8 sm:p-10 bg-neutral-950 rounded-2xl border border-neutral-800 shadow-lg text-neutral-100 font-nunito select-none">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-lime-400 font-saira">
          Editando <span className="text-white">{core.nome}</span>
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-red-500 hover:text-red-600 font-semibold rounded px-3 py-1 border border-red-500 hover:bg-red-500 hover:text-white transition"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="h-px w-full bg-neutral-800 mb-8" />

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <div className="h-5 w-32 shimmer rounded" />
              <div className="h-10 shimmer rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-24 shimmer rounded" />
              <div className="h-10 shimmer rounded-xl" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="h-5 w-48 shimmer rounded" />
              <div className="h-20 shimmer rounded-xl" />
            </div>
          </div>

          <hr className="my-10 border-neutral-700" />

          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="h-7 w-48 shimmer rounded" />
              <div className="h-10 w-36 shimmer rounded-xl" />
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton
                  key={i}
                  variant="table"
                  lines={1}
                  widths={["100%"]}
                  className="mb-2"
                />
              ))}
            </div>
          </div>

          <div className="h-12 w-40 shimmer rounded-xl mx-auto" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-saira">
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
              <DiasHorarioSelector
                diasSelecionados={diasSelecionados}
                setDiasSelecionados={setDiasSelecionados}
                horaInicio={horaInicio}
                setHoraInicio={setHoraInicio}
                horaFim={horaFim}
                setHoraFim={setHoraFim}
                disabled={loading}
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
                  className="text-sm font-medium text-gray-400 select-none font-saira"
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
              <label className="block text-sm font-medium text-gray-400 mb-1 font-saira">
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
              <label className="block text-sm font-medium text-gray-400 mb-1 font-saira">
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
                  <label className="block text-sm font-medium text-gray-400 mb-1 font-saira">
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
              <h3 className="text-xl font-semibold text-lime-400 font-saira">
                Editar Composição de jogadores
              </h3>
              <div>
                <button
                  data-tooltip-id="tooltipAdd"
                  data-tooltip-content={
                    showAddForm ? "Cancelar" : "Adicionar Jogador"
                  }
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    limparCampos();
                  }}
                  className={`p-2 rounded-xl border transition 
        ${
          showAddForm
            ? "bg-neutral-800 border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
            : "bg-neutral-800 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"
        }`}
                >
                  {showAddForm ? <X size={20} /> : <UserPlus size={20} />}
                </button>
                <Tooltip
                  id="tooltipAdd"
                  className="!z-50 !text-sm !rounded-lg"
                />
              </div>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden bg-neutral-900 border border-neutral-700 rounded-2xl p-6 mb-8 space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
                    <InputField
                      label="Nome *"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      required
                    />
                    <InputField
                      label="Reino *"
                      value={novoRealm}
                      onChange={(e) => setNovoRealm(e.target.value)}
                      required
                    />
                    <InputField
                      label="Discord"
                      value={novoDiscord}
                      onChange={(e) => setNovoDiscord(e.target.value)}
                    />
                    <InputField
                      label="BattleTag"
                      value={novoBattletag}
                      onChange={(e) => setNovoBattletag(e.target.value)}
                    />
                    <InputField
                      label="Twitch"
                      value={novoTwitch}
                      onChange={(e) => setNovoTwitch(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      onClick={adicionarOuEditarJogador}
                      disabled={loading}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 12px rgb(163 230 53)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-lime-500 px-5 py-3 
    ${
      loading
        ? "opacity-60 cursor-not-allowed"
        : "text-lime-400 hover:bg-lime-500 hover:text-neutral-900"
    } 
    transition-colors duration-200 text-base font-semibold shadow-sm select-none`}
                    >
                      {editIndex !== null
                        ? "Salvar Edição"
                        : "Adicionar Jogador"}
                    </motion.button>
                  </div>
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
                  <table className="w-full table-fixed border-collapse border border-neutral-700 text-gray-400 font-saira">
                    <thead className="bg-neutral-800 sticky top-0">
                      <tr>
                        <th className="p-2 text-left border-b border-neutral-700">
                          Nome
                        </th>
                        <th className="p-2 text-left border-b border-neutral-700">
                          Reino
                        </th>
                        <th className="p-2 text-left border-b border-neutral-700">
                          BattleTag
                        </th>
                        <th className="p-2 text-center border-b border-neutral-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {composicao.map((player, idx) => (
                        <tr
                          key={`${player.nome}-${player.realm}`}
                          className={`${
                            idx % 2 === 0
                              ? "bg-neutral-900 text-gray-400"
                              : "bg-neutral-800 text-lime-400"
                          } hover:bg-neutral-700 transition-colors`}
                        >
                          <td className="p-2 border-b border-neutral-700">
                            {player.nome}
                          </td>
                          <td className="p-2 border-b border-neutral-700">
                            {player.realm}
                          </td>
                          <td className="p-2 border-b border-neutral-700">
                            {player.battletag || (
                              <span className="italic">-</span>
                            )}
                          </td>
                          <td className="p-2 border-b border-neutral-700 text-center">
                            <div className="flex gap-3 justify-center">
                              <button
                                data-tooltip-id={`tooltip-edit-${idx}`}
                                data-tooltip-content="Editar"
                                onClick={() => editarJogador(idx)}
                                className="text-lime-400 hover:text-lime-500 cursor-pointer"
                                aria-label={`Editar ${player.nome}`}
                              >
                                <Pencil size={18} />
                              </button>
                              <Tooltip id={`tooltip-edit-${idx}`} place="top" />

                              <button
                                data-tooltip-id={`tooltip-remove-${idx}`}
                                data-tooltip-content="Remover"
                                onClick={() => removerJogador(idx)}
                                className="text-red-500 hover:text-red-600 cursor-pointer"
                                aria-label={`Remover ${player.nome}`}
                              >
                                <Trash2 size={18} />
                              </button>
                              <Tooltip
                                id={`tooltip-remove-${idx}`}
                                place="top"
                              />
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

          <motion.button
            onClick={salvarTudo}
            disabled={loading}
            whileHover={
              !loading
                ? { scale: 1.05, boxShadow: "0 0 12px rgb(163 230 53)" }
                : {}
            }
            whileTap={!loading ? { scale: 0.95 } : {}}
            className={`inline-flex items-center justify-center rounded-lg border border-lime-500 px-5 py-3
                        ${
                          loading
                            ? "opacity-60 cursor-not-allowed text-lime-400"
                            : "text-lime-400 hover:bg-lime-500 hover:text-neutral-900"
                        }
                        transition-colors duration-200 text-base font-semibold shadow-sm select-none w-full sm:w-auto`}
          >
            {loading ? "Salvando..." : "Salvar Core"}
          </motion.button>
        </>
      )}
    </div>
  );
}
