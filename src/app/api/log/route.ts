import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

function getTimestamp() {
  return new Date().toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { level, mensagem, dados } = body;

    if (!mensagem || !level || typeof mensagem !== "string" || typeof level !== "string") {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    if (dados && JSON.stringify(dados).length > 10000) {
      return NextResponse.json({ error: "Dados muito grandes para log" }, { status: 413 });
    }

    // Cria referência da coleção
    const logsRef = collection(db, "logs");

    // Adiciona documento na coleção
    await addDoc(logsRef, {
      level: level.toLowerCase(),
      mensagem,
      dados: dados ?? null,
      timestamp: getTimestamp(),
    });

    return NextResponse.json({ status: "Log salvo com sucesso" }, { status: 200 });
  } catch (err) {
    console.error("Erro ao salvar log", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
