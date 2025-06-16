"use client";

import { useState } from "react";
import {
  Core,
  Player,
  updateCoreField,
  addPlayerToCore,
  removePlayerFromCore,
} from "../lib/firestoreService";

type CoreEditorProps = {
  core: Core;
};

export function CoreEditor({ core }: CoreEditorProps) {
  const [nome, setNome] = useState(core.nome);
  const [informacoes, setInformacoes] = useState(core.informacoes || "");
  const [dias, setDias] = useState(core.dias || "");
  const [precisaDe, setPrecisaDe] = useState(core.precisaDe || "");
  const [bossAtual, setBossAtual] = useState(core.bossAtual || "");
  const [composicao, setComposicao] = useState<Player[]>(core.composicaoAtual || []);
  const [novoNome, setNovoNome] = useState("");
  const [novoRealm, setNovoRealm] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvarCore() {
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

  async function adicionarJogador() {
    if (!novoNome.trim() || !novoRealm.trim()) {
      alert("Preencha nome e reino para adicionar jogador.");
      return;
    }
    const player: Player = { nome: novoNome.trim(), realm: novoRealm.trim() };

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

  function editarJogador(index: number, campo: "nome" | "realm", valor: string) {
    setComposicao((prev) => {
      const novaComposicao = [...prev];
      novaComposicao[index] = { ...novaComposicao[index], [campo]: valor };
      return novaComposicao;
    });
  }

  async function salvarComposicao() {
    setLoading(true);
    try {
      await updateCoreField(core.id, { composicaoAtual: composicao });
      alert("Composição atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar composição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 sm:p-10 bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a] shadow-lg text-white font-nunito">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-white">
        Editar Core: <span className="text-lime-400 font-bold">{core.nome}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {[{ label: "Nome do Core", value: nome, setter: setNome },
          { label: "Dias", value: dias, setter: setDias },
          { label: "Precisa de", value: precisaDe, setter: setPrecisaDe },
          { label: "Boss Atual", value: bossAtual, setter: setBossAtual },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[#444] bg-[#2a2a2a] px-4 py-2 text-sm text-white focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
              placeholder={label}
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">Informações</label>
          <textarea
            value={informacoes}
            onChange={(e) => setInformacoes(e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full rounded-xl border border-[#444] bg-[#2a2a2a] px-4 py-2 text-sm text-white focus:ring-2 focus:ring-lime-500 focus:outline-none transition resize-none"
            placeholder="Digite informações adicionais..."
          />
        </div>
      </div>

      <button
        onClick={salvarCore}
        disabled={loading}
        className={`w-full py-3 rounded-xl bg-lime-600 text-white font-semibold hover:bg-lime-700 transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Salvando..." : "Salvar Core"}
      </button>

      <hr className="my-10 border-[#333]" />

      <div>
        <h3 className="text-xl font-semibold mb-6 text-white">Composição Atual</h3>

        {composicao.length === 0 && (
          <p className="text-gray-400 italic mb-6">Nenhum jogador adicionado.</p>
        )}

        <ul className="space-y-4 mb-8">
          {composicao.map((player, idx) => (
            <li
              key={`${player.nome}-${player.realm}`}
              className="flex flex-col sm:flex-row gap-3 sm:items-center bg-[#2a2a2a] border border-[#444] px-4 py-3 rounded-xl shadow-sm"
            >
              <input
                type="text"
                value={player.nome}
                onChange={(e) => editarJogador(idx, "nome", e.target.value)}
                disabled={loading}
                className="flex-1 rounded-xl border border-[#555] bg-[#1f1f1f] px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nome"
              />
              <input
                type="text"
                value={player.realm}
                onChange={(e) => editarJogador(idx, "realm", e.target.value)}
                disabled={loading}
                className="flex-1 rounded-xl border border-[#555] bg-[#1f1f1f] px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Reino"
              />
              <button
                onClick={() => removerJogador(player)}
                disabled={loading}
                className="text-red-500 hover:text-red-600 text-xl font-bold"
                title="Remover"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-4 mb-6">
          <input
            placeholder="Nome"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            disabled={loading}
            className="flex-1 min-w-[140px] rounded-xl border border-[#555] bg-[#1f1f1f] px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            placeholder="Reino"
            value={novoRealm}
            onChange={(e) => setNovoRealm(e.target.value)}
            disabled={loading}
            className="flex-1 min-w-[140px] rounded-xl border border-[#555] bg-[#1f1f1f] px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={adicionarJogador}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </button>
        </div>

        {composicao.length > 0 && (
          <button
            onClick={salvarComposicao}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar Composição"}
          </button>
        )}
      </div>
    </div>
  );
}
