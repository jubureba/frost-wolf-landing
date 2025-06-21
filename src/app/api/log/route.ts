import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 🔥 Função para gerar timestamp formatado
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

// 🔥 Função para gerar linha formatada
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

    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    const logContent = formatLog(level, mensagem, dados);
    const logFile = path.join(logDir, `${level}.log`);

    fs.appendFileSync(logFile, logContent);

    // 🔥 Log no terminal, com cor
    const color =
      level === "error"
        ? "\x1b[31m" // Vermelho
        : level === "warn"
        ? "\x1b[33m" // Amarelo
        : "\x1b[32m"; // Verde para info

    console.log(color + logContent + "\x1b[0m");

    return NextResponse.json(
      { status: "Log gravado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao processar log", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
