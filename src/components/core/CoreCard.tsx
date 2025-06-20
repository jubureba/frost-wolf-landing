"use client";

import React, { useState, useEffect } from "react";
import { JogadorCard } from "./JogadorCard";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [core, setCore] = useState<Core | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/core")
      .then((res) => res.json())
      .then((data) => {
        setCore(data);
        setLoading(false);
      });
  }, []);

  if (!core)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 text-lg font-medium">
        Carregando core...
      </div>
    );

  return <CoreCard core={core} loading={loading} />;
}

export function CoreCard({ core, loading }: { core: Core; loading: boolean }) {
  const grouped = agruparPorRole(core.composicaoAtual);

  const totalPlayers = core.composicaoAtual.length;
  const totalMelee = grouped.dps.filter((j) =>
    isMelee(j.classe, j.spec)
  ).length;
  const totalRanged = grouped.dps.filter((j) =>
    isRanged(j.classe, j.spec)
  ).length;

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 sm:p-8 shadow-xl text-white font-nunito space-y-6 transition-all duration-200 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-lime-400">{core.nome}</h2>
          <p className="text-gray-400 mt-1">{core.informacoes}</p>
        </div>

        {core.recrutando && core.linkRecrutamento && (
          <motion.a
            href={core.linkRecrutamento}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 8px rgb(163 230 53)",
            }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-lg border border-lime-500 px-4 py-2 text-lime-400 hover:bg-lime-500 hover:text-neutral-900 transition-colors duration-200 text-sm font-semibold"
          >
            📝 Solicitar entrada
          </motion.a>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-300 border-t border-neutral-800 pt-5">
        <Info label="Dia/Hora" value={core.dias} />
        <Info label="Recrutando" value={core.precisaDe} />
        <Info label="Luta Atual" value={core.bossAtual} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-300 border-t border-neutral-800 pt-5">
        <Info label="Total de Players" value={`${totalPlayers}`} />
        <Info label="DPS Melee" value={`${totalMelee}`} />
        <Info label="DPS Ranged" value={`${totalRanged}`} />
      </div>

      <section className="space-y-10 pt-6">
        <Grupo
          titulo="Tanks"
          cor="cyan"
          jogadores={grouped.tanks}
          loading={loading}
        />
        <Grupo
          titulo="Healers"
          cor="violet"
          jogadores={grouped.healers}
          loading={loading}
        />
        <Grupo
          titulo="DPS Melee"
          cor="pink"
          jogadores={grouped.dps.filter((j) => isMelee(j.classe, j.spec))}
          loading={loading}
        />
        <Grupo
          titulo="DPS Ranged"
          cor="rose"
          jogadores={grouped.dps.filter((j) => isRanged(j.classe, j.spec))}
          loading={loading}
        />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold text-gray-400">{label}:</span>
      <span className="text-white">{value || "-"}</span>
    </div>
  );
}

function agruparPorRole(jogadores: Jogador[]) {
  return jogadores.reduce(
    (acc, jogador) => {
      const role = (jogador.role ?? "").toLowerCase();
      if (role === "tank") acc.tanks.push(jogador);
      else if (role === "healer") acc.healers.push(jogador);
      else acc.dps.push(jogador);
      return acc;
    },
    { tanks: [] as Jogador[], healers: [] as Jogador[], dps: [] as Jogador[] }
  );
}

function isMelee(classe?: string | null, spec?: string | null) {
  const cls = (classe ?? "").toLowerCase();
  const sp = (spec ?? "").toLowerCase();
  return (
    cls === "cavaleiro da morte" ||
    cls === "caçador de demônios" ||
    (cls === "monge" && sp === "andarilho do vento") ||
    (cls === "paladino" && sp === "retribuição") ||
    cls === "ladino" ||
    cls === "guerreiro" ||
    (cls === "xamã" && sp === "aperfeiçoamento") ||
    (cls === "druida" && sp === "feral")
  );
}

function isRanged(classe?: string | null, spec?: string | null) {
  const cls = (classe ?? "").toLowerCase();
  const sp = (spec ?? "").toLowerCase();
  return (
    cls === "mago" ||
    cls === "bruxo" ||
    cls === "caçador" ||
    (cls === "sacerdote" && sp === "sombrio") ||
    (cls === "xamã" && sp === "elemental") ||
    (cls === "druida" && sp === "equilíbrio") ||
    cls === "evocador"
  );
}

function Grupo({
  titulo,
  cor,
  jogadores,
  loading,
}: {
  titulo: string;
  cor: string;
  jogadores: Jogador[];
  loading?: boolean;
}) {
  const corMap: Record<string, string> = {
    cyan: "text-cyan-400",
    violet: "text-violet-400",
    pink: "text-pink-400",
    rose: "text-rose-400",
  };

  const corClasse = corMap[cor] ?? "text-gray-400";

  return (
    <div>
      <h3
        className={`text-lg font-semibold ${corClasse} mb-4 flex items-center gap-3`}
      >
        {titulo}
        {loading ? (
          <div
            className="w-6 h-6 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"
            style={{ borderTopColor: "#38bdf8" }}
            role="status"
            aria-label="Carregando"
          />
        ) : (
          <span className="text-sm text-gray-400">({jogadores.length})</span>
        )}
      </h3>

      <AnimatePresence mode="popLayout">
        {!loading && jogadores.length > 0 ? (
          <motion.ul
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-4"
          >
            {jogadores.map((j) => (
              <JogadorCard
                key={`${j.nome}-${j.realm}`}
                jogador={j}
                loading={!j.avatar || !j.spec || !j.classe || !j.ilvl}
              />
            ))}
          </motion.ul>
        ) : !loading ? (
          <span className="text-xs text-gray-500 italic">(Nenhum jogador)</span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
