import { getCores, saveCore } from '../lib/firestoreService';
import { CoreWithEditor } from '../components/CoreWithEditor';
import { BlizzardHttpClient } from "../lib/BlizzardHttpClient";
import { BlizzardApi } from "../lib/blizzardApi";
import { UserStatus } from '../components/UserStatus';
import Image from 'next/image';

const client = new BlizzardHttpClient(
  process.env.BLIZZARD_CLIENT_ID!,
  process.env.BLIZZARD_CLIENT_SECRET!,
  "us"
);

const api = new BlizzardApi(client);

async function handleCriarNovoCore() {
  "use server";

  const novoCore = {
    id: `core-${Date.now()}`,
    nome: `Novo Core ${Date.now()}`,
    informacoes: "",
    dias: "",
    precisaDe: "",
    bossAtual: "",
    composicaoAtual: [],
  };

  await saveCore(novoCore);
}

export default async function Home() {
  const cores = await getCores();

  const coresCompletos = await Promise.all(
    cores.map(async (core) => {
      const composicaoAtual = await Promise.all(
        core.composicaoAtual.map(async (p) => {
          const data = await api.getCompleteCharacterData(p.realm, p.nome);

          return {
            nome: data.nome,
            realm: data.realm,
            classe: data.classe,
            spec: data.spec ?? 'Desconhecido',
            role: data.role?.toLowerCase() ?? 'dps',
            avatar: data.avatar,
            color: data.classeColor,
            level: data.level ?? '?',
            ilvl: data.ilvl,
          };
        })
      );

      return { ...core, composicaoAtual };
    })
  );

  return (
    <main className="min-h-screen bg-[#121212] p-4 sm:p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Image
            src="/img/logo.png"
            alt="Logo Frost Wolf"
            width={52}
            height={52}
            className="rounded-md"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Frost Wolf Clan</h1>
            <p className="text-xs sm:text-sm text-gray-400">Cores de progressão</p>
          </div>
        </div>
        <UserStatus />
      </header>

      {/* Filtros */}
      <div className="flex gap-6 mb-6 border-b border-[#2a2a2a]">
        <button className="pb-2 border-b-2 border-purple-600 text-purple-400 font-medium">
          Cores
        </button>
        <button className="pb-2 text-gray-400 hover:text-purple-400 hover:border-b-2 hover:border-purple-600">
          ...
        </button>
      </div>

      {/* Cards dos Cores */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {coresCompletos.map((core) => (
          <CoreWithEditor key={core.id} core={core} />
        ))}
      </div>

      {/* Botão flutuante */}
      <form action={handleCriarNovoCore}>
        <button
          type="submit"
          className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 text-3xl shadow-lg"
          title="Criar novo Core"
        >
          +
        </button>
      </form>
    </main>
  );
}
