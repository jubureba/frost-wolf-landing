import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { BlizzardApi } from '@/lib/blizzardApi'

type Jogador = {
  nome: string
  realm: string
  classe: string
  spec: string
  role: 'tank' | 'healer' | 'dps' | string
  race?: string
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

async function enrichJogador(jogador: Jogador): Promise<Jogador> {
  try {
    const profile = await blizzard.getCharacterProfile(jogador.realm, jogador.nome)
    const avatar = await blizzard.getCharacterAvatar(jogador.realm, jogador.nome)

    return {
      ...jogador,
      classe: profile.character_class?.name.en_US ?? jogador.classe,
      spec: profile.active_spec?.name.en_US ?? jogador.spec,
      role: profile.active_spec?.role ?? jogador.role,
      race: profile.race?.name.en_US ?? jogador.race,
      level: profile.level ?? jogador.level,
      avatar: avatar ?? null,
    }
  } catch (error) {
    console.error(`Erro ao buscar perfil de ${jogador.nome}:`, error)
    return jogador
  }
}

async function enrichCores(coresRaw: Core[]): Promise<Core[]> {
  return Promise.all(
    coresRaw.map(async (core) => {
      const composicaoAtual = await Promise.all(
        core.composicaoAtual.map(async (jogador) => enrichJogador(jogador))
      )
      return { ...core, composicaoAtual }
    })
  )
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/app/data/cores.json')
    const jsonData = fs.readFileSync(filePath, 'utf-8')
    const coresRaw: Core[] = JSON.parse(jsonData)

    const cores = await enrichCores(coresRaw)

    return NextResponse.json(cores)
  } catch (error) {
    console.error('Erro na API /cores:', error)
    return NextResponse.json({ message: 'Erro interno no servidor' }, { status: 500 })
  }
}
