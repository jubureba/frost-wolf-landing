// pages/api/classes/[nome]/specs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { BlizzardHttpClient } from "../../../lib/BlizzardHttpClient";
import { BlizzardApi } from "../../../lib/blizzardApi";

const client = new BlizzardHttpClient(
  process.env.BLIZZARD_CLIENT_ID!,
  process.env.BLIZZARD_CLIENT_SECRET!,
  "us" // pode mudar para 'eu' ou outro se quiser
);

const wowApi = new BlizzardApi(client);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { nome } = req.query;

  if (typeof nome !== "string") {
    return res.status(400).json({ erro: "Parâmetro nome inválido" });
  }

  try {
    // Busca todas as classes para achar o id pelo nome (case insensitive)
    const classes = await wowApi.obterTodasAsClasses();
    const classeEncontrada = classes.find(
      (c) => c.name.toLowerCase() === nome.toLowerCase()
    );

    if (!classeEncontrada) {
      return res.status(404).json({ erro: `Classe '${nome}' não encontrada` });
    }

    // Busca especializações pelo ID da classe encontrada
    const especializacoes = await wowApi.obterEspecializacoesPorClasseId(
      classeEncontrada.id
    );

    return res.status(200).json(especializacoes);
  } catch (erro) {
    console.error("Erro ao buscar especializações:", erro);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
}
