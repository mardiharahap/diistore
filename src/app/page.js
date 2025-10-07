"use client";
import { useEffect, useState } from "react";
import otherProducts from "../data/other_Products.json";
import Image from "next/image";

export default function Page() {
  const [activeTab, setActiveTab] = useState("stock");
  const [products, setProducts] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [filteredArea, setFilteredArea] = useState([]);
  const [searchArea, setSearchArea] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOtherStock, setShowOtherStock] = useState(false);
  const [otherProductsState, setOtherProductsState] = useState([]);

  // Fetch API Produk + Tambah stok manual
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/list_product");
      const data = await res.json();
      const list = (data?.data || []).map((p) => ({
        ...p,
        stok: Math.floor(Math.random() * 200) + 50, // stok manual 50–250
      }));
      setProducts(list);
    } catch {
      setProducts([]);
    }
  };

  // Fetch Area
  const fetchAreaData = async () => {
    try {
      const res = await fetch("https://arifr.id/akrab/");
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const rows = doc.querySelectorAll("table tr");
      const data = Array.from(rows)
        .slice(1)
        .map((r) => {
          const t = r.querySelectorAll("td");
          return {
            provinsi: t[0]?.textContent.trim(),
            kabupaten: t[1]?.textContent.trim(),
            area: t[2]?.textContent.trim(),
          };
        });
      setAreaData(data);
      setFilteredArea(data);
    } catch {
      setAreaData([]);
    }
  };

  // Random stok untuk Other Products
  useEffect(() => {
    const init = otherProducts.map((p) => ({
      ...p,
      stok: p.nama_produk.toLowerCase().includes("bundling")
        ? 2
        : Math.floor(Math.random() * 2000) + 3000,
    }));
    setOtherProductsState(init);

    const dec = setInterval(() => {
      setOtherProductsState((prev) =>
        prev.map((p) =>
          p.nama_produk.toLowerCase().includes("bundling")
            ? p
            : { ...p, stok: Math.max(0, p.stok - (Math.floor(Math.random() * 5) + 1)) }
        )
      );
    }, 60000);

    const inc = setInterval(() => {
      setOtherProductsState((prev) =>
        prev.map((p) =>
          p.nama_produk.toLowerCase().includes("bundling")
            ? p
            : { ...p, stok: p.stok + (Math.floor(Math.random() * 900) + 100) }
        )
      );
    }, 3600000);

    return () => {
      clearInterval(dec);
      clearInterval(inc);
    };
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchAreaData();
  }, []);

  useEffect(() => {
    const s = searchArea.toLowerCase();
    setFilteredArea(
      !s
        ? areaData
        : areaData.filter(
            (a) =>
              a.provinsi.toLowerCase().includes(s) ||
              a.kabupaten.toLowerCase().includes(s) ||
              a.area.toLowerCase().includes(s)
          )
    );
  }, [searchArea, areaData]);

  const getBg = (s) => (s === 0 ? "bg-red-600/30" : s < 50 ? "bg-yellow-400/30" : "bg-green-500/30");
  const getBadge = (s) => (s === 0 ? "bg-red-600" : s < 50 ? "bg-yellow-500" : "bg-green-600");

  return (
    <main className="p-2 sm:p-4 bg-gray-900 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl p-4 rounded-3xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-3">
          <Image src="/logo.png" alt="logo" width={60} height={60} className="mx-auto mb-2 rounded-full" />
          <h1 className="text-white text-2xl font-bold">DIISTORE Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-10 flex justify-center flex-wrap gap-2 bg-gray-800/90 rounded-2xl py-2">
          {[
            { key: "stock", label: "📊 Stok" },
            { key: "products", label: "🛒 Produk" },
            { key: "area", label: "📍 Area" },
            { key: "other", label: "📝 Lainnya" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full font-semibold ${
                activeTab === t.key ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-[80vh] overflow-y-auto space-y-3">
          {/* STOK */}
          {activeTab === "stock" && (
            <section>
              <h2 className="text-center text-white font-bold mb-2">📦 Daftar Stok</h2>
              <div className="space-y-2">
                {products.map((s, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center p-3 rounded-xl ${getBg(s.stok)}`}
                  >
                    <span className="text-white">{s.nama_produk}</span>
                    <span className={`px-3 py-1 rounded-full text-white font-bold ${getBadge(s.stok)}`}>
                      {s.stok} unit
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PRODUK */}
          {activeTab === "products" && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((p, i) => (
                  <div key={i} className="bg-gray-800 p-3 rounded-2xl text-white">
                    <h3 className="font-bold">{p.nama_produk}</h3>
                    <p className="text-gray-400 text-sm">{p.kode_produk}</p>
                    <p className="text-green-400 font-bold mt-2">
                      Rp {(Number(p.harga_final) + 3000).toLocaleString("id-ID")}
                    </p>
                    <div className="text-xs text-gray-300">Stok: {p.stok}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AREA */}
          {activeTab === "area" && (
            <section>
              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="Cari area..."
                className="w-full p-2 rounded-lg mb-2"
              />
              <div className="space-y-2">
                {filteredArea.map((a, i) => (
                  <div key={i} className="p-2 bg-gray-700 rounded text-white text-sm">
                    <div className="font-semibold">{a.provinsi}</div>
                    <div className="text-gray-300">{a.kabupaten}</div>
                    <div className="text-blue-400">{a.area}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* OTHER */}
          {activeTab === "other" && (
            <section>
              <div className="text-center mb-3">
                <button
                  onClick={() => setShowOtherStock(true)}
                  className="px-5 py-2 bg-green-500 text-white rounded-full"
                >
                  🔄 Cek Stok Other Products
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherProductsState.map((p, i) => (
                  <div key={i} className="bg-gray-800 p-3 rounded-2xl text-white">
                    <h3 className="font-bold">{p.nama_produk}</h3>
                    <p className="text-gray-400 text-sm">{p.kode_produk}</p>
                    <p className="text-green-400 font-bold mt-2">
                      Rp {Number(p.harga_final).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-300">
                      Stok:{" "}
                      {p.nama_produk.toLowerCase().includes("bundling")
                        ? "Tersedia (2)"
                        : `${p.stok} unit`}
                    </p>
                  </div>
                ))}
              </div>

              {showOtherStock && (
                <div
                  className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50"
                  onClick={(e) => e.target === e.currentTarget && setShowOtherStock(false)}
                >
                  <div className="bg-gray-800 p-4 rounded-2xl max-w-lg w-full text-white overflow-y-auto max-h-[80vh]">
                    <h2 className="text-center font-bold text-lg mb-3">📦 Stok Other Products</h2>
                    {otherProductsState.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between p-2 bg-gray-700 rounded mb-1 text-sm"
                      >
                        <span>{p.nama_produk}</span>
                        <span className="text-green-400">
                          {p.nama_produk.toLowerCase().includes("bundling")
                            ? "Tersedia (2)"
                            : `${p.stok} unit`}
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowOtherStock(false)}
                      className="absolute top-2 right-3 text-white text-2xl hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
