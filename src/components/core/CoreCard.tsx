"use client";

import React, { useState, useEffect } from "react";
import { JogadorCard } from "./JogadorCard";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil } from "lucide-react";

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

  return (
    <div className="flex justify-center items-center min-h-[500px] px-4">
      {core || loading ? (
        <CoreCard core={core} loading={loading} />
      ) : (
        <div className="text-gray-400 text-lg font-medium">
          Core não encontrado.
        </div>
      )}
    </div>
  );
}

export function CoreCard({
  core,
  loading,
  onEditClick,
  showEditor,
}: {
  core: Core | null;
  loading: boolean;
  onEditClick?: () => void;
  showEditor?: boolean;
}) {
  const grouped = agruparPorRole(core?.composicaoAtual ?? []);
  const totalPlayers = core?.composicaoAtual.length ?? 0;

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 sm:p-10 shadow-xl text-white font-nunito w-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
        <div className="flex flex-col max-w-xl">
          {loading ? (
            <div className="h-10 w-56 shimmer rounded" />
          ) : (
            <>
              <h2 className="text-4xl font-extrabold text-lime-400 leading-tight font-saira">
                {core?.nome}
              </h2>

              {showEditor && onEditClick && (
                <button
                  onClick={onEditClick}
                  aria-label="Editar Core"
                  className="mt-1 flex items-center gap-1 text-gray-400 hover:text-lime-600 font-saira text-sm transition-colors px-1 py-0 leading-none"
                  type="button"
                >
                  <span>Editar Core</span>
                  <Pencil size={8} />
                </button>
              )}
            </>
          )}
        </div>

        {!loading && core?.recrutando && core?.linkRecrutamento && (
          <motion.a
            href={core.linkRecrutamento}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgb(163 230 53)" }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-lg border border-lime-500 px-5 py-3 text-lime-400 hover:bg-lime-500 hover:text-neutral-900 transition-colors duration-200 text-base font-semibold shadow-sm select-none"
          >
            📝Quero me candidatar
          </motion.a>
        )}
      </header>

      <div className="flex flex-wrap gap-10 text-sm text-gray-300 border-t border-neutral-800 pt-6 ">
        <Info
          label="🗓️ Dia/Hora"
          value={core?.dias}
          loading={loading}
          compact
        />
        <Info
          label="🎯 Recrutando"
          value={core?.precisaDe}
          loading={loading}
          compact
        />
        <Info
          label="⚔️ Luta Atual"
          value={core?.bossAtual}
          loading={loading}
          compact
        />
        <Info
          label="👥 Total de Players"
          value={`${totalPlayers}`}
          loading={loading}
          compact
        />
      </div>

      <section className="space-y-12 pt-10 flex-grow flex flex-col">
        <Grupo
          titulo="Tanks"
          cor="cyan"
          jogadores={grouped.tanks}
          loading={loading}
          icone="Tank-role.png"
        />
        <Grupo
          titulo="Healers"
          cor="violet"
          jogadores={grouped.healers}
          loading={loading}
          icone="Healer-role.png"
        />
        <Grupo
          titulo="DPS Melee"
          cor="pink"
          jogadores={grouped.dps.filter((j) => isMelee(j.classe, j.spec))}
          loading={loading}
          icone="DPS-role.png"
        />
        <Grupo
          titulo="DPS Ranged"
          cor="rose"
          jogadores={grouped.dps.filter((j) => isRanged(j.classe, j.spec))}
          loading={loading}
          icone="DPS-role.png"
        />
      </section>
    </div>
  );
}

function Info({
  label,
  value,
  loading,
  compact,
}: {
  label: string;
  value?: string;
  loading?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col ${compact ? "min-w-[140px]" : "gap-1"}`}>
      <span
        className={`font-semibold text-lime-400  select-none font-saira ${
          compact ? "text-sm" : ""
        }`}
      >
        {label}
      </span>
      {loading ? (
        <div
          className={`${compact ? "h-4 w-24" : "h-5 w-32"} shimmer rounded`}
        />
      ) : (
        <span
          className={`text-gray-400 font-medium font-saira ${
            compact ? "text-sm truncate" : ""
          }`}
        >
          {value || "-"}
        </span>
      )}
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

import { CardSkeleton } from "../layout/CardSkeleton";
import Image from "next/image";

function Grupo({
  titulo,
  cor,
  jogadores,
  loading,
  icone, // nova prop
}: {
  titulo: string;
  cor: string;
  jogadores: Jogador[];
  loading?: boolean;
  icone?: string; // opcional
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
        className={`text-xl font-semibold mb-6 flex items-center gap-3 border-b border-neutral-700 pb-1 font-saira text-lime-400`}
      >
        {icone && (
          <Image
            src={`/assets/images/${icone}`}
            alt={titulo}
            width={24}
            height={24}
            className="object-contain"
          />
        )}
        {titulo}

        {loading ? (
          <div
            className="w-5 h-5 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"
            style={{ borderTopColor: corClasse.split("-")[1] || "#38bdf8" }}
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
            className="flex flex-wrap gap-6"
          >
            {jogadores.map((j) => (
              <JogadorCard
                key={`${j.nome}-${j.realm}`}
                jogador={j}
                loading={!j.avatar || !j.spec || !j.classe || !j.ilvl}
              />
            ))}
          </motion.ul>
        ) : loading ? (
          <div className="flex flex-wrap gap-6 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton
                key={i}
                avatarSize={56}
                lines={2}
                widths={["80%", "50%"]}
                className="rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="border border-neutral-700 rounded-lg p-6 text-center text-gray-500 italic select-none">
            (Nenhum jogador)
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
