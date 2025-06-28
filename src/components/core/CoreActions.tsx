interface Props {
  modoReordenacao: boolean;
  setModoReordenacao: React.Dispatch<React.SetStateAction<boolean>>;
  salvarOrdem: () => Promise<boolean>;
  loadingRemocao: boolean;
}

export function CoreActions({
  modoReordenacao,
  setModoReordenacao,
  salvarOrdem,
  loadingRemocao,
}: Props) {
  return (
    <div className="flex gap-2 items-center mb-6">
      {modoReordenacao && (
        <button
          onClick={async () => {
            const sucesso = await salvarOrdem();
            alert(sucesso ? "Ordem salva com sucesso!" : "Erro ao salvar ordem.");
            if (sucesso) setModoReordenacao(false);
          }}
          disabled={loadingRemocao}
          className="rounded-xl border border-lime-500 text-lime-400 hover:bg-lime-500 hover:text-black px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Salvar Ordem
        </button>
      )}
      <button
        onClick={() => setModoReordenacao((prev: boolean) => !prev)}
        disabled={loadingRemocao}
        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          modoReordenacao
            ? "border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            : "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-lime-400"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {modoReordenacao ? "Cancelar" : "Reordenar Cores"}
      </button>
    </div>
  );
}
