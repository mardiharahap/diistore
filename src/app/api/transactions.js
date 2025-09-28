import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const filePath = path.join(process.cwd(), "pages/api/_transactions.json");

  let transactions = [];
  try {
    transactions = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    transactions = [];
  }

  res.status(200).json({ ok: true, data: transactions });
}
