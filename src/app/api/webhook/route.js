export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get("message");

  if (!message) {
    return new Response(JSON.stringify({ ok: false, error: "message kosong" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Regex untuk parsing pesan Khfy
  const RX =
    /RC=(?<reffid>[a-f0-9-]+)\s+TrxID=(?<trxid>\d+)\s+(?<produk>[A-Z0-9]+)\.(?<tujuan>\d+)\s+(?<status_text>[A-Za-z]+)\s*(?<keterangan>.+?)(?:\s+Saldo[\s\S]*?)?(?:\bresult=(?<status_code>\d+))?\s*>?$/i;

  const match = message.match(RX);

  if (!match || !match.groups) {
    return new Response(JSON.stringify({ ok: false, error: "format tidak dikenali" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { trxid, reffid, produk, tujuan, status_text, status_code: statusCodeRaw } = match.groups;
  const keterangan = (match.groups.keterangan || "").trim();

  let status_code = null;
  if (statusCodeRaw != null) status_code = Number(statusCodeRaw);
  else status_code = /sukses/i.test(status_text) ? 0 : /gagal|batal/i.test(status_text) ? 1 : null;

  console.log("=== WEBHOOK MASUK ===");
  console.log({ trxid, reffid, produk, tujuan, status_text, status_code, keterangan });

  // TODO: simpan ke DB atau state untuk tampil di tab "Pembelian Berhasil"
  if (status_code === 0) {
    console.log("[INFO] Transaksi SUKSES");
    // bisa push ke DB / file JSON / local state
  } else if (status_code === 1) {
    console.log("[INFO] Transaksi GAGAL");
  }

  return new Response(
    JSON.stringify({ ok: true, parsed: { trxid, reffid, produk, tujuan, status_text, status_code, keterangan } }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
