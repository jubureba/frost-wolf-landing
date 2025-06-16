import { getCores, saveCore } from '../lib/firestoreService';
import { CoreWithEditor } from '../components/CoreWithEditor';
import { BlizzardHttpClient } from "@/lib/BlizzardHttpClient";
import { BlizzardApi } from "@/lib/BlizzardApi";
import { UserStatus } from '../components/UserStatus';

const client = new BlizzardHttpClient(
  process.env.BLIZZARD_CLIENT_ID!,
  process.env.BLIZZARD_CLIENT_SECRET!,
  "us"
);

const api = new BlizzardApi(client);

// ✅ Server Action pra criar novo Core
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
    <main className="min-h-screen bg-gradient-to-br from-black via-[#120026] to-black p-10">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-3 text-purple-300">Frost Wolf Clan</h1>
        <p className="text-purple-400">Status dos Cores — Atualizado em tempo real</p>
        <UserStatus />

        {/* 🔥 Botão de criar novo Core */}
        <form action={handleCriarNovoCore} className="mt-6">
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            + Criar Novo Core
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {coresCompletos.map((core) => (
          <CoreWithEditor key={core.nome} core={core} />
        ))}
      </div>
    </main>
  );
}
