import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔹 Panggil kedua API secara paralel
    const [res1, res2] = await Promise.all([
      fetch("https://panel.khfy-store.com/api_v3/cek_stock_akrab"),
      fetch("https://panel.khfy-store.com/api_v3/cek_stock_akrab_v2"),
    ]);

    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

    // 🔹 Gabungkan hasil data (pastikan formatnya array)
    const combinedData = [
      ...(data1?.data || []),
      ...(data2?.data || []),
    ];

    // 🔹 Kembalikan data gabungan dalam format NextResponse
    return NextResponse.json({
      ok: true,
      source: ["cek_stock_akrab", "cek_stock_akrab_v2"],
      total: combinedData.length,
      data: combinedData,
    });
  } catch (err) {
    console.error("Gagal ambil data stok:", err);
    return NextResponse.json({
      ok: false,
      error: "Gagal mengambil data stok dari server.",
    });
  }
}
