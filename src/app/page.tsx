import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import { BlizzardApi } from '../lib/blizzardApi'

type Jogador = {
  nome: string
  realm: string
  classe: string
  spec: string
  role: 'tank' | 'healer' | 'dps' | string
  level?: number
  avatar?: string | null
}

type Core = {
  nome: string
  informacoes: string
  dias: string
  precisaDe: string
  composicaoAtual: Jogador[]
  bossAtual: string
}

const blizzard = new BlizzardApi(
  process.env.BLIZZARD_CLIENT_ID!,
  process.env.BLIZZARD_CLIENT_SECRET!
)
blizzard.region = 'us'

async function enrichJogador(blizzard: BlizzardApi, jogador: any) {
  try {
    const profile = await blizzard.getCharacterProfile(jogador.realm.toLowerCase(), jogador.nome)
    const avatar = await blizzard.getCharacterAvatar(jogador.realm.toLowerCase(), jogador.nome)

    let role = undefined
    if (profile.active_spec?.key?.href) {
      role = await blizzard.getSpecRole(profile.active_spec.key.href)
    }

    return {
      ...jogador,
      classe: profile.character_class?.name.pt_BR ?? jogador.classe,
      spec: profile.active_spec?.name ?? jogador.spec,
      role: role?.toLowerCase() ?? jogador.role?.toLowerCase() ?? 'dps',
      level: profile.level ?? jogador.level,
      avatar: avatar ?? null,
    }
  } catch {
    return { ...jogador, role: jogador.role?.toLowerCase() ?? 'dps' }
  }
}

export default async function Home() {
  const filePath = path.join(process.cwd(), 'src/app/data/cores.json')
  const jsonData = fs.readFileSync(filePath, 'utf-8')
  const coresRaw: Core[] = JSON.parse(jsonData)

  const cores = await Promise.all(
    coresRaw.map(async (core) => {
      const composicaoAtual = await Promise.all(
        core.composicaoAtual.map(async (jogador) => enrichJogador(blizzard, jogador))
      )
      return { ...core, composicaoAtual }
    })
  )

  return (
    <main className="relative min-h-screen bg-background p-10 font-sans text-foreground">

      <header className="max-w-7xl mx-auto mb-14 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
          Frost Wolf Clan
        </h1>
        <p className="text-xl text-purple-300 max-w-xl mx-auto">
          Composição dos Cores & Status da Guilda — Atualizado em tempo real
        </p>
      </header>

      <section className="max-w-7xl mx-auto grid gap-12 sm:grid-cols-2 lg:grid-cols-3 overflow-visible">
        {cores.map((core) => {
          const grouped = agruparPorRole(core.composicaoAtual)
          return (
            <article
              key={core.nome}
              className="bg-[#1a002e]/80 backdrop-blur-md rounded-2xl border border-purple-600 shadow-xl
          transition-transform hover:scale-[1.02] hover:shadow-purple-800 duration-300"
            >
              <div className="p-7 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-3xl font-bold text-purple-300 drop-shadow-lg">
                    {core.nome}
                  </h2>
                  <button
                    type="button"
                    className="ml-4 px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-sm text-white transition">
                    Quero Entrar
                  </button>
                </div>

                <p className="text-sm text-purple-200 mb-5 line-clamp-3">{core.informacoes}</p>

                <InfoLabel label="Dias" value={core.dias} />
                <InfoLabel label="Precisa de" value={core.precisaDe} />
                <InfoLabel label="Boss Atual" value={core.bossAtual} />

                <div className="mt-7 flex flex-col gap-5 flex-grow">
                  <Grupo titulo="Tanks" cor="cyan" jogadores={grouped.tanks} />
                  <Grupo titulo="Healers" cor="violet" jogadores={grouped.healers} />
                  <Grupo titulo="DPS" cor="pink" jogadores={grouped.dps} />
                </div>
              </div>
            </article>
          )
        })}
      </section>

    </main>

  )
}

function InfoLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-purple-300 mb-1 font-medium">
      <span>{label}:</span>
      <span >{value}</span>
    </div>
  )
}

function agruparPorRole(jogadores: Jogador[]) {
  return jogadores.reduce(
    (acc, jogador) => {
      switch ((jogador.role ?? '').toLowerCase()) {
        case 'tank':
          acc.tanks.push(jogador)
          break
        case 'healer':
          acc.healers.push(jogador)
          break
        case 'dps':
          acc.dps.push(jogador)
          break
      }
      return acc
    },
    { tanks: [] as Jogador[], healers: [] as Jogador[], dps: [] as Jogador[] }
  )
}

function Grupo({ titulo, cor, jogadores }: { titulo: string; cor: string; jogadores: Jogador[] }) {
  const corTitulo =
    cor === 'cyan'
      ? 'text-cyan-400'
      : cor === 'violet'
        ? 'text-violet-400'
        : cor === 'pink'
          ? 'text-pink-400'
          : 'text-gray-400'

  if (jogadores.length === 0) {
    return (
      <div>
        <h3 className={`text-sm font-semibold ${corTitulo} mb-2`}>
          {titulo} <span className="text-xs font-normal text-purple-500">(Nenhum)</span>
        </h3>
      </div>
    )
  }

  return (
    <div>
      <h3 className={`text-sm font-semibold ${corTitulo} mb-4`}>
        {titulo} ({jogadores.length})
      </h3>
      <ul className="flex flex-wrap gap-4">
        {jogadores.map((j) => (
          <JogadorCard key={`${j.nome}-${j.realm}`} jogador={j} />
        ))}
      </ul>
    </div>
  )
}

function JogadorCard({ jogador }: { jogador: Jogador }) {
  return (
    <li className="relative group flex flex-col items-center">
      <div
        className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-600 shadow-md
        cursor-pointer transition-transform hover:scale-40"
      >
        {jogador.avatar ? (
          <Image
            src={jogador.avatar}
            alt={jogador.nome}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-900 text-purple-400 text-xl font-bold">
            ?
          </div>
        )}
      </div>

      <div className="mt-1 text-center w-full max-w-[64px]">
        <p className="text-purple-300 font-semibold text-[11px]">{jogador.nome}</p>
        <p className="text-purple-400 text-[9px]">
          {jogador.spec} - {jogador.classe}
        </p>
      </div>


      <div
        className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3
                    w-56 rounded-xl bg-[#330066cc] backdrop-blur-sm
                    p-4 text-center text-xs text-purple-300 border border-purple-700
                    opacity-0 scale-95
                    group-hover:opacity-100 group-hover:scale-100
                    transition-all duration-200 shadow-lg

                    pointer-events-none
                    group-hover:pointer-events-auto">

        {jogador.avatar && (
          <Image
            src={jogador.avatar}
            alt={jogador.nome}
            width={120}
            height={120}
            className="mx-auto rounded-full mb-3 border border-purple-500"
          />
        )}
        <p className="font-semibold mb-1 text-sm">{jogador.nome}</p>
        <p>
          {jogador.spec} - {jogador.classe}
        </p>
        <p className="mt-1 text-purple-400 text-[10px]">
          Reino: {jogador.realm} | Nível: {jogador.level ?? '?'}
        </p>
        <a
          href={`https://worldofwarcraft.com/pt-br/character/us/${jogador.realm}/${jogador.nome}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 px-3 py-1 bg-purple-700 hover:bg-purple-800 rounded-full text-purple-200 font-semibold transition"
        >
          Ver Armory
        </a>
      </div>
    </li>
  )
}


