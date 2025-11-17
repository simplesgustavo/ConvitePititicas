import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const csvHeader = "fullName,phone,email,maxCompanions\n";
  const csvExample = "Nome Sobrenome,5511987654321,email@exemplo.com,2\n";

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=modelo_convidados.csv");
  res.status(200).send(csvHeader + csvExample);
}