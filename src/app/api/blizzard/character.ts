import type { NextApiRequest, NextApiResponse } from "next";
import { BlizzardHttpClient } from "../../../lib/BlizzardHttpClient";
import { BlizzardApi } from "../../../lib/blizzardApi";

const client = new BlizzardHttpClient(
  process.env.BLIZZARD_CLIENT_ID!,
  process.env.BLIZZARD_CLIENT_SECRET!,
  "us"
);

const api = new BlizzardApi(client);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { realm, name } = req.query;

  if (typeof realm !== "string" || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  try {
    console.log("Buscando personagem:", realm, name);
    const dados = await api.getCompleteCharacterData(realm, name);
    console.log("Dados recebidos:", dados);
    res.status(200).json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados Blizzard:", error);
    res.status(500).json({ error: "Erro interno" });
  }
}
