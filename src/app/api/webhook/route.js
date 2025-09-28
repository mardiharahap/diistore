import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const data = req.body;

  if (!data.produk || !data.tujuan) {
    return res.status(400).json({ ok: false, error: "message kosong" });
  }

  const filePath = path.join(process.cwd(), "pages/api/_transactions.json");
  let transactions = [];

  try {
    transactions = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    transactions = [];
  }

  transactions.push({
    produk: data.produk,
    tujuan: data.tujuan,
    status_code: data.status_code ?? 1, // 0 = sukses, 1 = gagal
    waktu: new Date().toISOString(),
  });

  fs.writeFileSync(filePath, JSON.stringify(transactions, null, 2));

  return res.status(200).json({ ok: true });
}
