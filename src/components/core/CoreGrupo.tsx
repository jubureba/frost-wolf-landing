// components/core/CoreGrupo.tsx
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { JogadorCard } from "./JogadorCard";
import { CardSkeleton } from "../shared/CardSkeleton";

export function CoreGrupo({
  titulo,
  cor,
  jogadores,
  loading,
  icone,
}: {
  titulo: string;
  cor: string;
  jogadores: Jogador[];
  loading?: boolean;
  icone?: string;
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
        className={`text-xl font-semibold mb-6 flex items-center gap-3 border-b border-neutral-700 pb-1 font-saira text-lime-400`}
      >
        {icone && (
          <Image
            src={`/assets/images/${icone}`}
            alt={titulo}
            width={24}
            height={24}
            className="object-contain"
          />
        )}
        {titulo}

        {loading ? (
          <div
            className="w-5 h-5 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"
            style={{
              borderTopColor: corClasse.split("-")[1] || "#38bdf8",
            }}
            role="status"
            aria-label="Carregando"
          />
        ) : (
          <span className="text-sm text-gray-400">({jogadores.length})</span>
        )}
      </h3>

      <AnimatePresence mode="popLayout">
        {!loading && jogadores.length > 0 ? (
          <motion.ul
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-6"
          >
            {jogadores.map((j) => (
              <JogadorCard
                key={`${j.nome}-${j.realm}`}
                jogador={j}
                loading={!j.avatar || !j.spec || !j.classe || !j.ilvl}
              />
            ))}
          </motion.ul>
        ) : loading ? (
          <div className="flex flex-wrap gap-6 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton
                key={i}
                avatarSize={56}
                lines={2}
                widths={["80%", "50%"]}
                className="rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="border border-neutral-700 rounded-lg p-6 text-center text-gray-500 italic select-none">
            (Nenhum jogador)
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
