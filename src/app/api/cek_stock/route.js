import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [res1, res2] = await Promise.all([
            fetch("https://panel.khfy-store.com/api_v3/cek_stock_akrab"),
            fetch("https://panel.khfy-store.com/api_v3/cek_stock_akrab_v2")
        ]);

        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

        // Gabungkan hasil dari kedua API
        const combined = {
            ok: true,
            sumber1: data1,
            sumber2: data2
        };

        return NextResponse.json(combined);
    } catch (err) {
        console.error("Error:", err);
        return NextResponse.json({ ok: false, error: "Gagal ambil stock" });
    }
}
