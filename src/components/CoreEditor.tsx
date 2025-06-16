//coreEditor.tsx
"use client";

import { useState } from "react";
import {
  Core,
  Player,
  updateCoreField,
  addPlayerToCore,
  removePlayerFromCore,
} from "@/lib/firestoreService";

type CoreEditorProps = {
  core: Core;
};

export function CoreEditor({ core }: CoreEditorProps) {
  // Estado para cada campo editável
  const [nome, setNome] = useState(core.nome);
  const [informacoes, setInformacoes] = useState(core.informacoes || "");
  const [dias, setDias] = useState(core.dias || "");
  const [precisaDe, setPrecisaDe] = useState(core.precisaDe || "");
  const [bossAtual, setBossAtual] = useState(core.bossAtual || "");

  // Composição atual, pode ser editada (lista de jogadores)
  const [composicao, setComposicao] = useState<Player[]>(core.composicaoAtual || []);

  // Estados para inputs de adicionar jogador
  const [novoNome, setNovoNome] = useState("");
  const [novoRealm, setNovoRealm] = useState("");

  const [loading, setLoading] = useState(false);

  // Função para atualizar um campo do Core no Firestore
  async function salvarCampoCampo() {
    setLoading(true);
    try {
      await updateCoreField(core.id, {
        nome,
        informacoes,
        dias,
        precisaDe,
        bossAtual,
        composicaoAtual: composicao,
      });
      alert("Core atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar core.");
    } finally {
      setLoading(false);
    }
  }

  // Função para adicionar novo jogador à composição
  async function adicionarJogador() {
    if (!novoNome.trim() || !novoRealm.trim()) {
      alert("Preencha nome e reino para adicionar jogador.");
      return;
    }
    const player: Player = { nome: novoNome.trim(), realm: novoRealm.trim() };

    // Evita duplicação
    if (composicao.some((p) => p.nome === player.nome && p.realm === player.realm)) {
      alert("Jogador já está na composição.");
      return;
    }

    setLoading(true);
    try {
      await addPlayerToCore(core.id, player);
      setComposicao((prev) => [...prev, player]);
      setNovoNome("");
      setNovoRealm("");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar jogador.");
    } finally {
      setLoading(false);
    }
  }

  // Função para remover jogador da composição
  async function removerJogador(player: Player) {
    setLoading(true);
    try {
      await removePlayerFromCore(core.id, player);
      setComposicao((prev) =>
        prev.filter((p) => !(p.nome === player.nome && p.realm === player.realm))
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao remover jogador.");
    } finally {
      setLoading(false);
    }
  }

  // Função para editar jogador inline (alterar nome ou realm)
  function editarJogador(index: number, campo: "nome" | "realm", valor: string) {
    setComposicao((prev) => {
      const novaComposicao = [...prev];
      novaComposicao[index] = { ...novaComposicao[index], [campo]: valor };
      return novaComposicao;
    });
  }

  // Função para salvar a lista de jogadores inteira (ex: após edição inline)
  async function salvarComposicao() {
    setLoading(true);
    try {
      await updateCoreField(core.id, {
        composicaoAtual: composicao,
      });
      alert("Composição atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar composição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#2a004d] to-[#1a0033] rounded-xl p-6 border border-purple-700 shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-200 mb-6">Editar Core: {core.nome}</h2>

      <div className="space-y-4 mb-6">
        {/* Campos texto simples */}
        <div>
          <label className="block text-purple-300 mb-1 font-semibold">Nome do Core</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-950 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-purple-300 mb-1 font-semibold">Informações</label>
          <textarea
            value={informacoes}
            onChange={(e) => setInformacoes(e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-purple-950 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-purple-300 mb-1 font-semibold">Dias</label>
          <input
            type="text"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-950 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-purple-300 mb-1 font-semibold">Precisa de</label>
          <input
            type="text"
            value={precisaDe}
            onChange={(e) => setPrecisaDe(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-950 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-purple-300 mb-1 font-semibold">Boss Atual</label>
          <input
            type="text"
            value={bossAtual}
            onChange={(e) => setBossAtual(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-950 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={salvarCampoCampo}
          disabled={loading}
          className={`bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg transition ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Salvando..." : "Salvar Core"}
        </button>
      </div>

      <hr className="border-purple-700 mb-6" />

      {/* Composição - jogadores */}
      <div>
        <h3 className="text-xl text-purple-200 font-semibold mb-4">Composição Atual</h3>

        {composicao.length === 0 && (
          <p className="text-sm text-purple-400 italic mb-4">Nenhum jogador adicionado.</p>
        )}

        <ul className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {composicao.map((player, idx) => (
            <li
              key={`${player.nome}-${player.realm}`}
              className="flex items-center space-x-3 bg-purple-950 px-3 py-2 rounded-md border border-purple-700"
            >
              <input
                type="text"
                value={player.nome}
                onChange={(e) => editarJogador(idx, "nome", e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent border border-purple-600 rounded px-2 py-1 text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="text"
                value={player.realm}
                onChange={(e) => editarJogador(idx, "realm", e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent border border-purple-600 rounded px-2 py-1 text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={() => removerJogador(player)}
                disabled={loading}
                className={`text-red-400 hover:text-red-600 font-semibold ${
                  loading ? "cursor-not-allowed text-red-300" : ""
                }`}
                title="Remover jogador"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            placeholder="Nome"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            disabled={loading}
            className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-purple-950 text-purple-100 placeholder-purple-500 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            placeholder="Reino"
            value={novoRealm}
            onChange={(e) => setNovoRealm(e.target.value)}
            disabled={loading}
            className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-purple-950 text-purple-100 placeholder-purple-500 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={adicionarJogador}
            disabled={loading}
            className={`${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } px-4 py-2 rounded-lg text-white font-medium transition-all`}
          >
            {loading ? "Salvando..." : "Adicionar Jogador"}
          </button>
        </div>

        {composicao.length > 0 && (
          <button
            onClick={salvarComposicao}
            disabled={loading}
            className={`bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Salvando..." : "Salvar Composição"}
          </button>
        )}
      </div>
    </div>
  );
}
