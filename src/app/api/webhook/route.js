// pages/api/webhook.js (Next.js API Route)
import { transactions } from './_transactions';

export default async function handler(req, res) {
  try {
    // Ambil message dari query GET atau body POST
    let message = req.query?.message || req.body?.message;

    // Jika POST JSON atau form
    if (!message && req.body) {
      if (typeof req.body === 'string') message = req.body;
      else if (req.body.message) message = req.body.message;
    }

    console.log('[WEBHOOK][RAW REQUEST]', { query: req.query, body: req.body });

    if (!message) {
      console.log('[WEBHOOK] message kosong');
      return res.status(400).json({ ok: false, error: 'message kosong' });
    }

    // Regex KHFY
    const RX = /RC=(?<reffid>[a-f0-9-]+)\s+TrxID=(?<trxid>\d+)\s+(?<produk>[A-Z0-9]+)\.(?<tujuan>\d+)\s+(?<status_text>[A-Za-z]+)\s*(?<keterangan>.+?)(?:\s+Saldo[\s\S]*?)?(?:\bresult=(?<status_code>\d+))?\s*>?$/i;

    const match = message.match(RX);
    if (!match || !match.groups) {
      console.log('[WEBHOOK] format tidak dikenali ->', message);
      return res.status(200).json({ ok: false, error: 'format tidak dikenali' });
    }

    const { trxid, reffid, produk, tujuan, status_text } = match.groups;
    const keterangan = (match.groups.keterangan || '').trim();
    let status_code = match.groups.status_code
      ? Number(match.groups.status_code)
      : /sukses/i.test(status_text)
      ? 0
      : /gagal|batal/i.test(status_text)
      ? 1
      : null;

    console.log('==== CALLBACK MASUK ====');
    console.log('RAW        :', message);
    console.log('reffid     :', reffid);
    console.log('trxid      :', trxid);
    console.log('produk     :', produk);
    console.log('tujuan     :', tujuan);
    console.log('status_txt :', status_text);
    console.log('status_code:', status_code);
    console.log('keterangan :', keterangan);
    console.log('=========================');

    // Simpan status transaksi di memori (sementara)
    // transactions adalah array global sederhana (bisa diganti DB)
    transactions.push({
      trxid,
      reffid,
      produk,
      tujuan,
      status_text,
      status_code,
      keterangan,
      timestamp: Date.now(),
    });

    return res.status(200).json({
      ok: true,
      parsed: { trxid, reffid, produk, tujuan, status_text, status_code, keterangan },
    });
  } catch (err) {
    console.log('[WEBHOOK][ERROR]', err?.message || err);
    return res.status(500).json({ ok: false, error: 'internal_error', detail: err?.message || String(err) });
  }
}
