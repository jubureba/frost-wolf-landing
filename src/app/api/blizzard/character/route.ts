import { NextRequest, NextResponse } from "next/server";
import { BlizzardHttpClient } from "@/lib/BlizzardHttpClient";
import { BlizzardApi } from "@/lib/blizzardApi";

const client = new BlizzardHttpClient(
  process.env.BLIZZARD_CLIENT_ID!,
  process.env.BLIZZARD_CLIENT_SECRET!,
  "us"
);

const api = new BlizzardApi(client);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const realm = searchParams.get("realm");
  const name = searchParams.get("name");

  if (!realm || !name) {
    return NextResponse.json(
      { error: "Missing parameters: realm and name are required" },
      { status: 400 }
    );
  }

  try {
    console.log("🔍 Buscando personagem:", realm, name);
    const dados = await api.getCompleteCharacterData(realm, name);
    console.log("✅ Dados recebidos:", dados);
    return NextResponse.json(dados);
  } catch (error) {
    console.error("❌ Erro ao buscar dados da Blizzard:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
