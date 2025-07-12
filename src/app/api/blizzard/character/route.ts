import { NextRequest, NextResponse } from "next/server";
import { BlizzardHttpClient } from "@/lib/BlizzardHttpClient";
import { BlizzardApi } from "@/lib/blizzardApi";
import { BlizzardApiError } from "@/utils/BlizzardApiError";

// Cliente Blizzard
const client = new BlizzardHttpClient(
  process.env.BLIZZARD_CLIENT_ID!,
  process.env.BLIZZARD_CLIENT_SECRET!,
  "us"
);

const api = new BlizzardApi(client);

// Cache em memória
const cache = new Map<string, { data: unknown; expiry: number }>();

// TTL em milissegundos (5 minutos)
const TTL = 5 * 60 * 1000;

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

  const cacheKey = `${realm.toLowerCase()}-${name.toLowerCase()}`;
  const now = Date.now();

  // Verifica se o dado está em cache e não expirou
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > now) {
    return NextResponse.json(cached.data);
  }

  try {
    // Faz a requisição à API da Blizzard
    const dados = await api.getCompleteCharacterData(realm, name);

    // Armazena no cache com o TTL
    cache.set(cacheKey, { data: dados, expiry: now + TTL });

    return NextResponse.json(dados);
  } catch (error: unknown) {
    if (error instanceof BlizzardApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Erro inesperado:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
