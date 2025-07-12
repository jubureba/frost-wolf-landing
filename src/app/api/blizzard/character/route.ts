import { NextRequest, NextResponse } from "next/server";
import { BlizzardHttpClient } from "@/lib/BlizzardHttpClient";
import { BlizzardApi } from "@/lib/blizzardApi";
import { BlizzardApiError } from "@/utils/BlizzardApiError";

// Desative cache estático do Vercel para sempre trazer dados frescos
export const dynamic = "force-dynamic";

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
    const dados = await api.getCompleteCharacterData(realm, name);
    return NextResponse.json(dados);
  } catch (error: unknown) {
    // Se foi erro customizado da Blizzard, use o status correto
    if (error instanceof BlizzardApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Fallback genérico
    console.error("Erro inesperado:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
