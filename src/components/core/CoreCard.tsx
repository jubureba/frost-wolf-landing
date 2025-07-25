"use client";

import {
  formatarDias,
  isMelee,
  isRanged,
} from "@/lib/coreUtils";
import { CoreGrupo } from "./CoreGrupo";
import { CoreInfo } from "./CoreInfo";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCalendarAlt, faBullseye, faCrosshairs, faUsers } from '@fortawesome/free-solid-svg-icons';

export function CoreCard({
  core,
  loading,
  onEditClick,
  onRemoveClick,
  showEditor,
  modoReordenacao = false,
}: {
  core: Core | null;
  loading: boolean;
  onEditClick?: () => void;
  onRemoveClick?: (coreId: string) => void;
  showEditor?: boolean;
  modoReordenacao?: boolean;
}) {
  const jogadores = core?.composicaoAtual ?? [];
  console.log("CoreCard - jogadores com funcao:", jogadores.map(j => ({ nome: j.nome, funcao: j.funcao })));


  const algumJogadorIncompleto = jogadores.some(
    (j) => !j.avatar || !j.classe || !j.especializacao || !j.ilvl
  );

  const loadingReal = loading || algumJogadorIncompleto;

  const grouped = {
  tanks: jogadores.filter(j => j.funcao?.toLowerCase() === 'tank'),
  healers: jogadores.filter(j => j.funcao?.toLowerCase() === 'healer'),
  dps: jogadores.filter(j => j.funcao?.toLowerCase() === 'dps'),
};
  //const grouped = agruparPorRole(jogadores);
  const totalPlayers = jogadores.length;

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 sm:p-10 shadow-xl text-white font-nunito w-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 relative">
        <div className="flex flex-col max-w-xl flex-grow">
          {loading ? (
            <div className="h-10 w-56 shimmer rounded" />
          ) : (
            <>
              {modoReordenacao && (
                <div
                  className="drag-handle cursor-move flex items-center gap-1 text-gray-400 select-none mr-4"
                  title="Arraste para reordenar"
                >
                  <span className="text-lg leading-none">☰</span>
                  <span className="text-sm">Segure e Arraste</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <h2 className="text-4xl font-extrabold text-lime-400 leading-tight font-saira">
                  {core?.nome}
                </h2>

                {showEditor && onRemoveClick && core?.id && (
                  <div className="group relative">
                    <button
                      onClick={() => onRemoveClick(core.id)}
                      aria-label="Remover Core"
                      className="text-red-500 hover:text-red-700 p-1 rounded-md transition-colors"
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 text-xs bg-neutral-800 text-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Remover Core
                    </div>
                  </div>
                )}
              </div>
              {showEditor && onEditClick && (
                <button
                  onClick={onEditClick}
                  aria-label="Editar Core"
                  className="mt-1 flex items-center gap-1 text-gray-400 hover:text-lime-600 font-saira text-sm transition-colors px-1 py-0 leading-none"
                  type="button"
                >
                  <span>Editar Core</span>
                  <Pencil size={8} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {!loading && core?.recrutando && core?.linkRecrutamento && (
            <motion.a
              href={core.linkRecrutamento}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 12px rgb(163 230 53)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-lg border border-lime-500 px-5 py-3 text-lime-400 hover:bg-lime-500 hover:text-neutral-900 transition-colors duration-200 text-base font-semibold shadow-sm select-none"
            >
              Inscrever-se
            </motion.a>
          )}
        </div>
      </header>

      <div
        className="grid grid-cols-2 gap-x-10 gap-y-6 text-sm text-gray-300 border border-neutral-700 pt-6 rounded-lg p-4"
        style={{ backgroundColor: "#121212" }}
      >
        <CoreInfo
          label={<><FontAwesomeIcon icon={faInfoCircle} className="mr-1" /> Informações gerais</>}
          value={core?.informacoes}
          loading={loading}
          compact
        />
        <CoreInfo
          label={<><FontAwesomeIcon icon={faCalendarAlt} className="mr-1" /> Dia/Hora</>}
          value={formatarDias(core?.dias)}
          loading={loading}
          compact
        />
        <CoreInfo
          label={<><FontAwesomeIcon icon={faBullseye} className="mr-1" /> Recrutando</>}
          value={core?.precisaDe}
          loading={loading}
          compact
        />
        <CoreInfo
          label={<><FontAwesomeIcon icon={faCrosshairs} className="mr-1" /> Luta Atual</>}
          value={core?.bossAtual}
          loading={loading}
          compact
        />
        <CoreInfo
          label={<><FontAwesomeIcon icon={faUsers} className="mr-1" /> Total de Players</>}
          value={`${totalPlayers}`}
          loading={loading}
          compact
        />
      </div>

      <section className="space-y-12 pt-10 flex-grow flex flex-col">
        

        {/* Grupos normais */}
        <CoreGrupo
          titulo="Tanks"
          cor="cyan"
          jogadores={grouped.tanks}
          loading={loadingReal}
          icone="Tank-role.png"
        />
        <CoreGrupo
          titulo="Healers"
          cor="violet"
          jogadores={grouped.healers}
          loading={loadingReal}
          icone="Healer-role.png"
        />
        <CoreGrupo
          titulo="DPS Melee"
          cor="pink"
          jogadores={grouped.dps.filter((j) => isMelee(j.classe, j.especializacao))}
          loading={loadingReal}
          icone="DPS-role.png"
        />
        <CoreGrupo
          titulo="DPS Ranged"
          cor="rose"
          jogadores={grouped.dps.filter((j) => isRanged(j.classe, j.especializacao))}
          loading={loadingReal}
          icone="DPS-role.png"
        />
      </section>
    </div>
  );
}
