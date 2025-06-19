"use client";

import { useEffect, useState } from "react";
import { getCores } from "../lib/firestoreService";
import { CoreWithEditor } from "../components/core/CoreWithEditor";
import { Header } from "../components/layout/Header";
import { Filters } from "../components/layout/Filters";
import { FloatingButton } from "../components/layout/FloatingButton";

export default function Home() {
  const [cores, setCores] = useState<Core[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const dados = await getCores();
      console.log("🚀 Dados dos cores:", dados);
      setCores(dados);
    };

    fetch();
  }, []);

  return (
    <main className="min-h-screen bg-[#121212] p-4 sm:p-6">
      <Header />
      <Filters />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cores.map((core) => (
          <CoreWithEditor key={core.id} core={core} />
        ))}
      </div>

      <FloatingButton action={async () => alert("Criar core")}>+</FloatingButton>
    </main>
  );
}
