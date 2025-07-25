import { NextRequest, NextResponse } from "next/server";
import { BlizzardHttpClient } from "@/lib/BlizzardHttpClient";
import { BlizzardApi } from "@/lib/blizzardApi";
import { BlizzardApiError } from "@/utils/BlizzardApiError";

/* -------------------------------------------------------------------------- */
/*  Instâncias singletons fora do handler                                     */
/* -------------------------------------------------------------------------- */
const client = new BlizzardHttpClient(
  process.env.BLIZZARD_CLIENT_ID!,
  process.env.BLIZZARD_CLIENT_SECRET!,
  "us"
);
const api = new BlizzardApi(client);

/* -------------------------------------------------------------------------- */
/*  GET /api/character?realm=nemesis&name=Thrall                               */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const realm = searchParams.get("realm");
  const name  = searchParams.get("name");

  if (!realm || !name) {
    return NextResponse.json(
      { error: "Parâmetros 'realm' e 'name' são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const dados = await api.obterDadosCompletosPersonagem(realm, name);
    return NextResponse.json(dados, { status: 200 });
  } catch (err) {
    if (err instanceof BlizzardApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
