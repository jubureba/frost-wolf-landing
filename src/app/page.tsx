import { getCores, saveCore } from '../lib/firestoreService';
import { CoreWithEditor } from '../components/core/CoreWithEditor';
import { BlizzardHttpClient } from "../lib/BlizzardHttpClient";
import { BlizzardApi } from "../lib/blizzardApi";
import { Header } from '../components/layout/Header';
import { Filters } from '../components/layout/Filters';
import { FloatingButton } from '../components/layout/FloatingButton';

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
      <Header />
      <Filters />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {coresCompletos.map((core) => (
          <CoreWithEditor key={core.id} core={core} />
        ))}
      </div>

      <FloatingButton action={handleCriarNovoCore}>
        +
      </FloatingButton>
    </main>
  );
}
