"use client";

import React, { useEffect, useState } from "react";
import { Core, Player } from "../../lib/firestoreService";
import { useToast } from "../shared/ToastContainer";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import { Checkbox } from "../ui/Checkbox";
import { InputField } from "../ui/InputField";
import { DiasHorarioSelector } from "../ui/DiasHorarioSelector";
import { CardSkeleton } from "../shared/CardSkeleton";
import { buscarPersonagemBlizzard } from "@/lib/services/buscarPersonagemBlizzard";
import { SelectField } from "../ui/SelectField";

type Especializacao = {
  id: string;
  name: string;
  role: "tank" | "healer" | "dps";
  icon: string;
  href: string;
};

const classesSpecs: Record<string, Especializacao[]> = {
  Guerreiro: [
    {
      id: "1",
      name: "Armas",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "2",
      name: "Fúria",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "3",
      name: "Proteção",
      role: "tank",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Mago: [
    {
      id: "4",
      name: "Arcano",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "5",
      name: "Fogo",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "6",
      name: "Gelo",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Paladino: [
    {
      id: "7",
      name: "Sagrado",
      role: "healer",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "8",
      name: "Proteção",
      role: "tank",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "9",
      name: "Retribuição",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Druida: [
    {
      id: "10",
      name: "Equilíbrio",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "11",
      name: "Feral",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "12",
      name: "Guardião",
      role: "tank",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "13",
      name: "Restauração",
      role: "healer",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Caçador: [
    {
      id: "14",
      name: "Domínio das Feras",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "15",
      name: "Precisão",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "16",
      name: "Sobrevivência",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Ladino: [
    {
      id: "17",
      name: "Assassinato",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "18",
      name: "Fora da Lei",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "19",
      name: "Subterfúgio",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Sacerdote: [
    {
      id: "20",
      name: "Disciplina",
      role: "healer",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "21",
      name: "Sagrado",
      role: "healer",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "22",
      name: "Sombra",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Bruxo: [
    {
      id: "23",
      name: "Suplício",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "24",
      name: "Demonologia",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "25",
      name: "Destruição",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Monge: [
    {
      id: "26",
      name: "Tecelão da Névoa",
      role: "healer",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "27",
      name: "Mestre Cervejeiro",
      role: "tank",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "28",
      name: "Andarilho do Vento",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  "Caçador de Demônios": [
    {
      id: "29",
      name: "Devastação",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "30",
      name: "Vingança",
      role: "tank",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Xamã: [
    {
      id: "31",
      name: "Elemental",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "32",
      name: "Aperfeiçoamento",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "33",
      name: "Restauração",
      role: "healer",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  "Cavaleiro da Morte": [
    {
      id: "34",
      name: "Sangue",
      role: "tank",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "35",
      name: "Gélido",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "36",
      name: "Profano",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
  Conjurante: [
    {
      id: "37",
      name: "Devastação",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "38",
      name: "Preservação",
      role: "healer",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
    {
      id: "39",
      name: "Aprimoramento",
      role: "dps",
      icon: "spell_holy_powerwordshield",
      href: "",
    },
  ],
};

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
  const [novoClasse, setNovoClasse] = useState("");

  const [novoEspecializacao, setNovoEspecializacao] = React.useState("");
  const [especializacoesDisponiveis, setEspecializacoesDisponiveis] = useState<
    Especializacao[]
  >([]);

  const [novoFuncao, setNovoFuncao] = useState("");

  // Busca personagem Blizzard e preenche campos + especializações fixas
  const buscar = async () => {
    try {
      const dados = await buscarPersonagemBlizzard(novoRealm, novoNome);
      console.log("dados retornados:", dados);

      setNovoClasse(dados.classe);

      const specsDaClasse = classesSpecs[dados.classe] || [];
      setEspecializacoesDisponiveis(specsDaClasse);

      const nomeEspecializacao = Array.isArray(dados.especializacao)
        ? dados.especializacao[0]?.name ?? ""
        : dados.especializacao ?? "";

      const specEncontrada = specsDaClasse.find(
        (s) => s.name.toLowerCase() === nomeEspecializacao.toLowerCase()
      );

      setNovoEspecializacao(specEncontrada ? specEncontrada.id : "");
      setNovoFuncao(specEncontrada ? specEncontrada.role : "");
    } catch (err) {
      console.error("Erro ao buscar personagem:", err);
      alert("Não foi possível carregar dados do personagem.");
    }
  };useEffect(() => {
  const specsDaClasse = classesSpecs[novoClasse] || [];
  setEspecializacoesDisponiveis(specsDaClasse);

  if (specsDaClasse.length === 0) {
    setNovoEspecializacao("");
    setNovoFuncao("");
    return;
  }

  setNovoEspecializacao((atual) => {
    // Se o valor atual existe na lista, mantém ele
    if (atual && specsDaClasse.some(s => s.id === atual)) {
      const specAtual = specsDaClasse.find(s => s.id === atual)!;
      setNovoFuncao(specAtual.role);
      return atual;
    }
    // Senão, seta a primeira especialização válida
    setNovoFuncao(specsDaClasse[0].role);
    return specsDaClasse[0].id;
  });
}, [novoClasse]);

  const handleEspecializacaoChange = (id: string) => {
  const spec = especializacoesDisponiveis.find((s) => s.id === id);
  if (spec) {
    setNovoEspecializacao(spec.id); // guarda o id para controle do select
    setNovoFuncao(spec.role);
  }
};

  function limparCampos() {
    setNovoNome("");
    setNovoRealm("");
    setNovoDiscord("");
    setNovoBattletag("");
    setNovoTwitch("");
    setNovoClasse("");
    setNovoEspecializacao("");
    setEspecializacoesDisponiveis([]);
    setNovoFuncao("");
    setEditIndex(null);
  }

  const specSelecionada = especializacoesDisponiveis.find(
  (s) => s.id === novoEspecializacao
);

const player: Player = {
  nome: novoNome.trim(),
  realm: novoRealm.trim(),
  discord: novoDiscord.trim() || undefined,
  battletag: novoBattletag.trim() || undefined,
  twitch: novoTwitch.trim() || undefined,
  classe: novoClasse.trim() || undefined,
  especializacao: specSelecionada ? specSelecionada.name : undefined,
  especializacoesDisponiveis: especializacoesDisponiveis,
  funcao: novoFuncao.trim() || undefined,
};

  function editarJogador(index: number) {
    const player = composicao[index];
    setNovoNome(player.nome);
    setNovoRealm(player.realm);
    setNovoDiscord(player.discord ?? "");
    setNovoBattletag(player.battletag ?? "");
    setNovoTwitch(player.twitch ?? "");
    setNovoFuncao(player.funcao ?? "");
    setNovoClasse(player.classe ?? "");

    const specsDaClasse = classesSpecs[player.classe ?? ""] || [];
    setEspecializacoesDisponiveis(specsDaClasse);

    // Seleciona a especialização atual pelo id, se existir
    if (player.especializacao) {
      // Tenta achar pelo nome da especialização atual
      const spec = specsDaClasse.find(
        (s) =>
          s.name === player.especializacao || s.id === player.especializacao
      );
      setNovoEspecializacao(spec ? spec.id : "");
    } else {
      setNovoEspecializacao("");
    }

    setEditIndex(index);
    setShowAddForm(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core]);

  // Quando muda a classe manualmente, atualiza as specs fixas
  useEffect(() => {
    if (!novoClasse) {
      setEspecializacoesDisponiveis([]);
      setNovoEspecializacao("");
      setNovoFuncao("");
      return;
    }

    const specsDaClasse = classesSpecs[novoClasse] || [];
    setEspecializacoesDisponiveis(specsDaClasse);

    // Se a especialização atual não pertence mais à classe, limpa seleção
    if (!specsDaClasse.find((s) => s.id === novoEspecializacao)) {
      setNovoEspecializacao("");
      setNovoFuncao("");
    }
  }, [novoClasse]);

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

                  {/* Busca automática Blizzard */}
                  {novoNome && novoRealm && (
                    <div className="flex justify-end mt-2">
                      <button onClick={buscar}>Buscar na Blizzard</button>
                    </div>
                  )}

                  {/* Campos: Classe (readonly), Especialização (editável), Função (readonly) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                    <InputField
                      label="Classe"
                      value={novoClasse}
                      onChange={() => {}}
                      disabled
                    />

                    <SelectField
                      label="Especialização"
                      value={novoEspecializacao}
                      onChange={handleEspecializacaoChange}
                      options={especializacoesDisponiveis}
                      disabled={loading}
                    />

                    <InputField
                      label="Função"
                      value={novoFuncao}
                      onChange={() => {}}
                      disabled
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
