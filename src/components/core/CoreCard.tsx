import Image from "next/image";
import { Popover } from "@headlessui/react";
import { LinkButton } from "../ui/LinkButton";

export function CoreCard({ core }: { core: Core }) {
  const grouped = agruparPorRole(core.composicaoAtual);

  const totalPlayers = core.composicaoAtual.length;
  const totalMelee = grouped.dps.filter((j) =>
    isMelee(j.classe, j.spec)
  ).length;
  const totalRanged = grouped.dps.filter((j) =>
    isRanged(j.classe, j.spec)
  ).length;

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
        <Grupo titulo="Tanks" cor="cyan" jogadores={grouped.tanks} />
        <Grupo titulo="Healers" cor="violet" jogadores={grouped.healers} />
        <Grupo
          titulo="DPS Melee"
          cor="pink"
          jogadores={grouped.dps.filter((j) => isMelee(j.classe, j.spec))}
        />
        <Grupo
          titulo="DPS Ranged"
          cor="rose"
          jogadores={grouped.dps.filter((j) => isRanged(j.classe, j.spec))}
        />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-gray-400">{label}:</span>
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

function isMelee(classe?: string | null, spec?: string | null) {
  const cls = (classe ?? "").toLowerCase();
  const sp = (spec ?? "").toLowerCase();

  if (cls === "cavaleiro da morte") return true;
  if (cls === "caçador de demônios") return true;
  if (cls === "monge" && sp === "andarilho do vento") return true;
  if (cls === "paladino" && sp === "retribuição") return true;
  if (cls === "ladino") return true;
  if (cls === "guerreiro") return true;
  if (cls === "xamã" && sp === "aperfeiçoamento") return true;
  if (cls === "druida" && sp === "feral") return true;

  return false;
}

function isRanged(classe?: string | null, spec?: string | null) {
  const cls = (classe ?? "").toLowerCase();
  const sp = (spec ?? "").toLowerCase();

  if (cls === "mago") return true;
  if (cls === "bruxo") return true;
  if (cls === "caçador") return true;
  if (cls === "sacerdote" && sp === "sombrio") return true;
  if (cls === "xamã" && sp === "elemental") return true;
  if (cls === "druida" && sp === "equilíbrio") return true;
  if (cls === "evocador") return true;

  return false;
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
      <h3 className={`text-sm font-semibold text-${cor}-400 mb-3`}>
        {titulo} {jogadores.length > 0 ? `(${jogadores.length})` : "(0)"}
      </h3>
      <ul className="flex flex-wrap gap-4 justify-start sm:justify-start">
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

export function JogadorCard({ jogador }: { jogador: Jogador }) {
  return (
    <li className="relative flex flex-col items-start w-16">
      <Popover className="relative">
        <Popover.Button className="focus:outline-none">
          <div
            className="w-14 h-14 rounded-full overflow-hidden border border-[#444]
                      cursor-pointer transition-transform duration-200 hover:scale-105 bg-[#121212]"
          >
            {jogador.avatar ? (
              <Image
                src={jogador.avatar}
                alt={jogador.nome}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#666] text-xl font-bold">
                ?
              </div>
            )}
          </div>
        </Popover.Button>

        <div className="mt-1 text-left w-full max-w-[72px]">
          <p
            className="font-semibold text-[12px] truncate"
            style={{ color: jogador.color ?? "#e2e2e2" }}
            title={jogador.nome}
          >
            {jogador.nome}
          </p>
          <p className="text-[#999] text-[9px] truncate">
            {jogador.classe ?? "??"}
          </p>
          <p className="text-[#999] text-[9px] truncate">
            {jogador.spec ?? "??"}
          </p>
        </div>

        <Popover.Panel
          className="
    absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-4 w-64
    rounded-2xl bg-[#202020cc] backdrop-blur-md
    border border-[#444] shadow-xl
    overflow-hidden p-4
    flex flex-col gap-4
  "
        >
          <div className="flex flex-col gap-1 text-center">
            <p
              className="font-semibold text-lg"
              style={{ color: jogador.color ?? "#e2e2e2" }}
            >
              {jogador.nome}
            </p>
            <p className="text-xs text-gray-400">
              {jogador.spec} - {jogador.classe}
            </p>
            <p className="text-xs text-gray-400">{jogador.realm}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <InfoLabel
              label="Nível"
              value={jogador.level?.toString() ?? "??"}
            />
            <InfoLabel label="iLvl" value={jogador.ilvl?.toString() ?? "??"} />
            <InfoLabel label="Role" value={jogador.role ?? "??"} />
            <InfoLabel label="Spec" value={jogador.spec ?? "??"} />
          </div>

          {jogador.discord && (
            <div className="flex items-center gap-2 text-sm text-[#5865F2]">
              <Image
                src="/assets/icons/discord.png"
                alt="Discord"
                width={4}
                height={4}
                className="w-4 h-4"
              />
              <span className="truncate">{jogador.discord}</span>
            </div>
          )}

          {jogador.battletag && (
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <Image
                src="/assets/icons/battlenet.png"
                alt="Battle.net"
                width={4}
                height={4}
                className="w-4 h-4"
              />
              <span className="truncate">{jogador.battletag}</span>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <a
                href={`https://worldofwarcraft.com/pt-br/character/us/${jogador.realm}/${jogador.nome}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] transition"
              >
                <Image
                  src="/assets/icons/armory.png"
                  alt="Armory"
                  width={20}
                  height={20}
                />
              </a>
              <span className="text-[10px] text-gray-400">Armory</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <a
                href={`https://www.warcraftlogs.com/character/us/${jogador.realm}/${jogador.nome}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] transition"
              >
                <Image
                  src="/assets/icons/warcraftlogs.png"
                  alt="Warcraft Logs"
                  width={20}
                  height={20}
                />
              </a>
              <span className="text-[10px] text-gray-400">WCL</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <a
                href={`https://raider.io/characters/us/${jogador.realm}/${jogador.nome}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] transition"
              >
                <Image
                  src="/assets/icons/raiderio.png"
                  alt="Raider.io"
                  width={20}
                  height={20}
                />
              </a>
              <span className="text-[10px] text-gray-400">Raider.io</span>
            </div>
          </div>
        </Popover.Panel>
      </Popover>
    </li>
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
