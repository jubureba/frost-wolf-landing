"use client";

import { useState } from "react";
import { Core, saveCore } from "../../lib/firestoreService";

export function NovoCoreEditor() {
  const [nome, setNome] = useState("");
  const [informacoes, setInformacoes] = useState("");
  const [dias, setDias] = useState("");
  const [precisaDe, setPrecisaDe] = useState("");
  const [bossAtual, setBossAtual] = useState("");
  const [loading, setLoading] = useState(false);

  async function criarCore() {
    if (!nome.trim()) {
      alert("O nome do core é obrigatório.");
      return;
    }

    const novoCore: Core = {
      id: nome.trim(),
      nome: nome.trim(),
      informacoes,
      dias,
      precisaDe,
      bossAtual,
      composicaoAtual: [],
    };

    setLoading(true);
    try {
      await saveCore(novoCore);
      alert("Core criado com sucesso!");
      setNome("");
      setInformacoes("");
      setDias("");
      setPrecisaDe("");
      setBossAtual("");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar core.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#1a002d] to-[#10001f] rounded-xl p-6 border border-purple-700 shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-300 mb-6">Criar Novo Core</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-purple-400 mb-1 font-semibold">Nome do Core *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-900 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-purple-400 mb-1 font-semibold">Informações</label>
          <textarea
            value={informacoes}
            onChange={(e) => setInformacoes(e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-purple-900 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-purple-400 mb-1 font-semibold">Dias</label>
          <input
            type="text"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-900 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-purple-400 mb-1 font-semibold">Precisa de</label>
          <input
            type="text"
            value={precisaDe}
            onChange={(e) => setPrecisaDe(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-900 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-purple-400 mb-1 font-semibold">Boss Atual</label>
          <input
            type="text"
            value={bossAtual}
            onChange={(e) => setBossAtual(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-900 text-purple-100 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={criarCore}
          disabled={loading}
          className={`bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg transition ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Criando..." : "Criar Core"}
        </button>
      </div>
    </div>
  );
}
