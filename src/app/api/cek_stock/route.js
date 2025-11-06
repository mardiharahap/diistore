import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Ambil dari dua endpoint API
    const [res1, res2] = await Promise.all([
      fetch("https://panel.khfy-store.com/api_v3/cek_stock_akrab"),
      fetch("https://panel.khfy-store.com/api_v3/cek_stock_akrab_v2"),
    ]);

    // Parsing hasil
    const data1 = await res1.json();
    const data2 = await res2.json();

    // Gabungkan data keduanya (jika formatnya sama)
    const mergedData = [
      ...(data1?.data || []),
      ...(data2?.data || []),
    ];

    // Kembalikan response ke frontend
    return NextResponse.json({
      ok: true,
      message: "Gabungan stok berhasil",
      data: mergedData,
    });

  } catch (err) {
    console.error("Gagal ambil stok:", err);
    return NextResponse.json({
      ok: false,
      error: "Gagal ambil stock dari API",
    });
  }
}
