import Image from "next/image";
import { Popover } from "@headlessui/react";

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
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#444] cursor-pointer transition-transform duration-200 hover:scale-105 bg-[#121212]">
            {jogador.avatar ? (
              <Image
                src={jogador.avatar}
                alt={jogador.nome}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-start text-[#666] text-xl font-bold">
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
                    absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-4 w-52
                    rounded-2xl bg-[#202020cc] backdrop-blur-md
                    border border-[#444] shadow-xl
                    overflow-hidden
                    p-4
                    flex flex-col items-center
                  "
        >
          <div className="relative w-52 h-[220px] perspective flex-grow">
            <div
              className="
                        relative
                        w-full h-full
                        duration-700
                        transform-style-preserve-3d
                        transition-transform
                        cursor-pointer
                        hover:rotate-x-180
                      "
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Frente: Foto + nome */}
              <div
                className="
          absolute
          w-full h-full
          rounded-2xl
          backface-hidden
          select-none
          overflow-hidden
          flex flex-col justify-end
          bg-black
        "
                style={{ backfaceVisibility: "hidden" }}
              >
                {jogador.avatar ? (
                  <Image
                    src={jogador.avatar}
                    alt={jogador.nome}
                    width={288}
                    height={288}
                    className="object-cover w-full h-full absolute top-0 left-0"
                    style={{ zIndex: 0 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#666] text-xl font-bold absolute top-0 left-0 z-0">
                    ?
                  </div>
                )}

                {/* Nome sempre visível na frente, sobre a imagem */}
                <p
                  className="relative z-10 bg-black bg-opacity-70 text-center text-[#e2e2e2] font-semibold py-1"
                  style={{ color: jogador.color ?? "#e2e2e2" }}
                >
                  {jogador.nome}
                </p>
              </div>

              {/* Verso: Informações */}
              <div
                className="
          absolute
          w-full h-full
          rounded-2xl
          bg-[#202020cc]
          backdrop-blur-md
          border border-[#444]
          text-[#e2e2e2]
          p-6
          flex flex-col justify-center
          backface-hidden
          rotate-x-180
          font-sans
          text-sm
          overflow-auto
        "
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                }}
              >
                {/* Nome sempre visível no verso também */}
                <p
                  className="font-semibold text-lg mb-4 text-center"
                  style={{ color: jogador.color ?? "#e2e2e2" }}
                >
                  {jogador.nome}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <InfoLabel
                    label="Nível"
                    value={jogador.level?.toString() ?? "??"}
                  />
                  <InfoLabel
                    label="iLvl"
                    value={jogador.ilvl?.toString() ?? "??"}
                  />
                  <InfoLabel label="Classe" value={jogador.classe ?? "??"} />
                  <InfoLabel label="Spec" value={jogador.spec ?? "??"} />
                  <InfoLabel label="Reino" value={jogador.realm} />
                  <InfoLabel label="Role" value={jogador.role ?? "??"} />
                </div>
              </div>
            </div>
          </div>

          {/* Botão do Armory sempre visível, abaixo do card */}
          <a
            href={`https://worldofwarcraft.com/pt-br/character/us/${jogador.realm}/${jogador.nome}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
      block
      mt-4
      w-full
      bg-[#333]
      hover:bg-[#444]
      text-[#ccc]
      font-semibold
      py-2
      text-center
      rounded-2xl
      transition
    "
          >
            Ver no Armory
          </a>
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
