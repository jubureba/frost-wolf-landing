"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { JogadorCard } from "./JogadorCard";

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

  if (!core) return <div>Carregando core...</div>;

  return <CoreCard core={core} loading={loading} />;
}

export function CoreCard({ core, loading }: { core: Core; loading: boolean }) {
  const grouped = agruparPorRole(core.composicaoAtual);

  const totalPlayers = core.composicaoAtual.length;
  const totalMelee = grouped.dps.filter((j) => isMelee(j.classe, j.spec)).length;
  const totalRanged = grouped.dps.filter((j) => isRanged(j.classe, j.spec)).length;

  return (
    <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 shadow-xl text-white font-nunito space-y-6 transition-all duration-200">
      <header>
        <h2 className="text-2xl sm:text-3xl font-bold">{core.nome}</h2>
        <p className="text-sm text-gray-300 mt-1">{core.informacoes}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-300 border-t border-[#333] pt-4">
        <Info label="Dias" value={core.dias} />
        <Info label="Recrutando" value={core.precisaDe} />
        <Info label="Boss Atual" value={core.bossAtual} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-300 border-t border-[#333] pt-4">
        <Info label="Total de Players" value={`${totalPlayers}`} />
        <Info label="DPS Melee" value={`${totalMelee}`} />
        <Info label="DPS Ranged" value={`${totalRanged}`} />
      </div>

      <section className="space-y-8 pt-4">
        <Grupo titulo="Tanks" cor="cyan" jogadores={grouped.tanks} loading={loading} />
        <Grupo titulo="Healers" cor="violet" jogadores={grouped.healers} loading={loading} />
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
      <span className="font-medium text-gray-400">{label}:</span>
      <span>{value}</span>
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
        className={`text-sm font-semibold ${corClasse} mb-3 flex items-center gap-2`}
      >
        {titulo}{" "}
        {loading ? (
          <span className="flex items-center gap-2 text-xs text-gray-400 ml-2">
            <div
              className="w-6 h-6 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"
              style={{ borderTopColor: "#38bdf8", marginTop: "2px" }}
            ></div>
            <span>Carregando...</span>
          </span>
        ) : jogadores.length > 0 ? (
          `(${jogadores.length})`
        ) : (
          "(0)"
        )}
      </h3>

      {loading ? null : jogadores.length > 0 ? (
        <ul className="flex flex-wrap gap-4">
          {jogadores.map((j) => (
            <JogadorCard
              key={`${j.nome}-${j.realm}`}
              jogador={j}
              loading={!j.avatar || !j.spec || !j.classe || !j.ilvl}
            />
          ))}
        </ul>
      ) : (
        <span className="text-xs text-gray-500">(Nenhum)</span>
      )}
    </div>
  );
}

function InfoLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
