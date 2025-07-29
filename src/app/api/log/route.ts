import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const lastLogs = new Map<string, number>();
const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function getTimestamp() {
  const now = new Date();
  return now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatLog(level: string, mensagem: string, dados?: unknown) {
  const separator = "==============================";
  const timestamp = getTimestamp();
  const dadosFormatados = dados ? JSON.stringify(dados, null, 2) : "";
  return `
${separator}
[${timestamp}] [${level.toUpperCase()}]
Mensagem: ${mensagem}
${dados ? `Dados:\n${dadosFormatados}` : ""}
${separator}
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, mensagem, dados } = body;

    if (!mensagem || !level) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const chave = `${ip}:${level}:${mensagem}`;
    const agora = Date.now();
    const ultima = lastLogs.get(chave);

    if (ultima && agora - ultima < 5000) {
      return NextResponse.json(
        { warning: "Repetido, ignorado (5s cooldown)" },
        { status: 429 }
      );
    }

    lastLogs.set(chave, agora);

    const logContent = formatLog(level, mensagem, dados);
    const logFile = path.join(logDir, `${level}.log`);

    await fs.promises.appendFile(logFile, logContent);

    return NextResponse.json(
      { status: "Log salvo com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao salvar log:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
