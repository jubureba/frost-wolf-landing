import Image from "next/image";

interface Jogador {
  nome: string;
  realm: string;
  role?: string;
  avatar?: string | null;
  color?: string;
  classe?: string | null;
  spec?: string | null;
  level?: number | null;
  ilvl?: number | null;
}

interface Core {
  nome: string;
  informacoes: string;
  dias: string;
  precisaDe: string;
  bossAtual: string;
  composicaoAtual: Jogador[];
}

export function CoreCard({ core }: { core: Core }) {
  const grouped = agruparPorRole(core.composicaoAtual);
  return (
    <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl p-8 shadow-lg text-white font-nunito">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">{core.nome}</h2>
      <p className="text-sm text-gray-300 mb-6">{core.informacoes}</p>

      <div className="space-y-2">
        <Info label="Dias" value={core.dias} />
        <Info label="Recrutando" value={core.precisaDe} />
        <Info label="Boss Atual" value={core.bossAtual} />
      </div>

      <div className="mt-8 space-y-8">
        <Grupo titulo="Tanks" cor="cyan" jogadores={grouped.tanks} />
        <Grupo titulo="Healers" cor="violet" jogadores={grouped.healers} />
        <Grupo titulo="DPS" cor="pink" jogadores={grouped.dps} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[#333] pb-1 text-sm text-gray-300">
      <span className="font-medium">{label}:</span>
      <span className="">{value}</span>
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

function Grupo({
  titulo,
  cor,
  jogadores,
}: {
  titulo: string;
  cor: string;
  jogadores: Jogador[];
}) {
  return (
    <div>
      <h3 className={`text-sm font-semibold text-${cor}-400 mb-4`}>
        {titulo} {jogadores.length > 0 ? `(${jogadores.length})` : ""}
      </h3>
      <ul className="flex flex-wrap gap-5 justify-center">
        {jogadores.length > 0 ? (
          jogadores.map((j) => (
            <JogadorCard key={`${j.nome}-${j.realm}`} jogador={j} />
          ))
        ) : (
          <span className="text-xs text-gray-500">(Nenhum)</span>
        )}
      </ul>
    </div>
  );
}

function JogadorCard({ jogador }: { jogador: Jogador }) {
  return (
    <li className="relative group flex flex-col items-center w-16">
      <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#444] cursor-pointer transition-transform hover:scale-105">
        {jogador.avatar ? (
          <Image
            src={jogador.avatar}
            alt={jogador.nome}
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#222] text-[#666] text-2xl">
            ?
          </div>
        )}
      </div>

      <div className="mt-1 text-center w-full max-w-[72px] truncate">
        <p
          className="font-semibold text-[12px] truncate"
          style={{ color: jogador.color ?? "#e2e2e2" }}
          title={jogador.nome}
        >
          {jogador.nome}
        </p>
        <p className="text-[#999] text-[10px] truncate">
          {jogador.classe ?? "??"} - {jogador.spec ?? "??"}
        </p>
      </div>

      <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-4 w-64 rounded-2xl bg-[#202020cc] backdrop-blur-md p-4 text-center text-xs text-[#e2e2e2] border border-[#444] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-lg pointer-events-none group-hover:pointer-events-auto">
        {jogador.avatar && (
          <Image
            src={jogador.avatar}
            alt={jogador.nome}
            width={120}
            height={120}
            className="mx-auto rounded-lg mb-3 border border-[#555]"
          />
        )}
        <p
          className="font-semibold mb-1 text-sm"
          style={{ color: jogador.color ?? "#e2e2e2" }}
        >
          {jogador.nome}
        </p>
        <p className="mb-1">
          {jogador.spec ?? "??"} - {jogador.classe ?? "??"}
        </p>
        <p className="mt-2 text-[#999] text-[12px]">
          Reino: {jogador.realm} | Nível: {jogador.level ?? "??"} | iLvl:{" "}
          {jogador.ilvl ?? "??"}
        </p>
        <a
          href={`https://worldofwarcraft.com/pt-br/character/us/${jogador.realm}/${jogador.nome}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-4 py-1 bg-[#333] hover:bg-[#444] rounded-full text-[#ccc] font-semibold transition"
        >
          Ver Armory
        </a>
      </div>
    </li>
  );
}
