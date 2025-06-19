import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { CoreCard } from "./CoreCard";
import { CoreEditor } from "./CoreEditor";
import { saveCore } from "../../lib/firestoreService";

export function CoreWithEditor({ core: coreOriginal }: { core: Core }) {
  const { user, loading: authLoading, role } = useAuth();
  const showEditor = !authLoading && user && role === "RL";

  const [core, setCore] = useState(coreOriginal);
  const [loading, setLoading] = useState(true); // <-- controla loading aqui

  useEffect(() => {
    async function fetchAndCache() {
      setLoading(true); // começa loading

      const needsUpdate = core.composicaoAtual.some(
        (j) => !j.avatar || !j.spec || !j.classe || !j.ilvl
      );

      if (needsUpdate) {
        const composicaoAtualizada = await Promise.all(
          core.composicaoAtual.map(async (jogador) => {
            if (jogador.avatar && jogador.spec && jogador.classe && jogador.ilvl) {
              return jogador;
            }

            // Chama sua API interna do Next.js
            const res = await fetch(
              `/api/blizzard/character?realm=${encodeURIComponent(jogador.realm)}&name=${encodeURIComponent(jogador.nome)}`
            );
            if (!res.ok) {
              console.error("Falha ao buscar dados do personagem", jogador.nome);
              return jogador; // fallback: retorna os dados originais
            }
            const dados = await res.json();
            return { ...jogador, ...dados };
          })
        );

        const coreAtualizado = {
          ...core,
          composicaoAtual: composicaoAtualizada,
        };

        setCore(coreAtualizado);
        await saveCore(coreAtualizado);
      }

      setLoading(false); // termina loading
    }

    fetchAndCache();
  }, [coreOriginal]);

  return (
    <div className="space-y-4">
      <CoreCard core={core} loading={loading} /> {/* <-- aqui passa loading */}
      {showEditor && <CoreEditor core={core} />}
    </div>
  );
}
