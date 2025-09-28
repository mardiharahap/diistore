// pages/api/webhook/route.js
import { transactions } from '../_transactions';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let message = searchParams.get('message');

  if (!message) {
    console.log('[WEBHOOK] message kosong (GET)');
    return new Response(JSON.stringify({ ok: false, error: 'message kosong' }), { status: 400 });
  }

  return handleMessage(message);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  let message = body?.message || body;

  if (!message) {
    console.log('[WEBHOOK] message kosong (POST)');
    return new Response(JSON.stringify({ ok: false, error: 'message kosong' }), { status: 400 });
  }

  return handleMessage(message);
}

function handleMessage(message) {
  const RX =
    /RC=(?<reffid>[a-f0-9-]+)\s+TrxID=(?<trxid>\d+)\s+(?<produk>[A-Z0-9]+)\.(?<tujuan>\d+)\s+(?<status_text>[A-Za-z]+)\s*(?<keterangan>.+?)(?:\s+Saldo[\s\S]*?)?(?:\bresult=(?<status_code>\d+))?\s*>?$/i;

  const match = message.match(RX);

  if (!match || !match.groups) {
    console.log('[WEBHOOK] format tidak dikenali ->', message);
    return new Response(JSON.stringify({ ok: false, error: 'format tidak dikenali' }), { status: 200 });
  }

  const { trxid, reffid, produk, tujuan, status_text } = match.groups;
  const keterangan = (match.groups.keterangan || '').trim();
  const status_code = match.groups.status_code
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

  // Simpan di array global sementara
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

  return new Response(
    JSON.stringify({
      ok: true,
      parsed: { trxid, reffid, produk, tujuan, status_text, status_code, keterangan },
    }),
    { status: 200 }
  );
}
