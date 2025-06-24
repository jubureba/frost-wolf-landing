"use client";

import React from "react";

const diasSemana = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function DiasHorarioSelector({
  diasSelecionados,
  setDiasSelecionados,
  horaInicio,
  setHoraInicio,
  horaFim,
  setHoraFim,
  disabled,
}: {
  diasSelecionados: string[];
  setDiasSelecionados: (dias: string[]) => void;
  horaInicio: string;
  setHoraInicio: (hora: string) => void;
  horaFim: string;
  setHoraFim: (hora: string) => void;
  disabled?: boolean;
}) {
  const toggleDia = (dia: string) => {
    if (diasSelecionados.includes(dia)) {
      setDiasSelecionados(diasSelecionados.filter((d) => d !== dia));
    } else {
      setDiasSelecionados([...diasSelecionados, dia]);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <label className="block text-sm font-medium text-gray-400 mb-1 font-saira">
        Dias e Horário
      </label>

      {/* Seletor de dias */}
      <div className="flex flex-wrap gap-2 ">
        {diasSemana.map((dia) => {
          const ativo = diasSelecionados.includes(dia);
          return (
            <button
              key={dia}
              type="button"
              onClick={() => !disabled && toggleDia(dia)}
              className={`px-3 py-2 rounded-xl border text-sm transition
                ${
                  ativo
                    ? "bg-lime-500 text-neutral-900 border-lime-500"
                    : "bg-neutral-800 text-gray-400 border-neutral-700 hover:bg-neutral-700"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {dia.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Inputs de horário */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1 font-saira">
            Hora Início
          </label>
          <input
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm
                       focus:ring-2 focus:ring-lime-500 focus:outline-none transition disabled:opacity-60"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1 font-saira">
            Hora Fim
          </label>
          <input
            type="time"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm
                       focus:ring-2 focus:ring-lime-500 focus:outline-none transition disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
