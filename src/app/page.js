"use client";
import { useEffect, useState } from "react";
import otherProducts from "../data/other_Products.json";
import Image from "next/image";

export default function Page() {
  const [activeTab, setActiveTab] = useState("stock");
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [filteredArea, setFilteredArea] = useState([]);
  const [otherProductsState, setOtherProductsState] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingArea, setLoadingArea] = useState(false);
  const [searchArea, setSearchArea] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOtherStock, setShowOtherStock] = useState(false);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/list_product");
      const data = await res.json();
      setProducts(data?.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchStock = async () => {
    setLoadingStock(true);
    try {
      const res = await fetch("/api/cek_stock");
      const data = await res.json();
      setStock(data?.data || []);
    } catch {
      setStock([]);
    } finally {
      setLoadingStock(false);
    }
  };

  const fetchAreaData = async () => {
    setLoadingArea(true);
    try {
      const res = await fetch("https://arifr.id/akrab/");
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const table = doc.querySelector("table");
      const rows = table.querySelectorAll("tr");
      const data = Array.from(rows)
        .slice(1)
        .map((row) => {
          const cells = row.querySelectorAll("td");
          return {
            provinsi: cells[0]?.textContent.trim(),
            kabupaten: cells[1]?.textContent.trim(),
            area: cells[2]?.textContent.trim(),
          };
        });
      setAreaData(data);
      setFilteredArea(data);
    } catch {
      setAreaData([]);
      setFilteredArea([]);
    } finally {
      setLoadingArea(false);
    }
  };

  useEffect(() => {
    const initial = otherProducts.map((p) => ({
      ...p,
      stok: p.nama_produk.toLowerCase().includes("bundling")
        ? 2
        : Math.floor(Math.random() * 2000) + 3000,
    }));
    setOtherProductsState(initial);

    const decrease = setInterval(() => {
      setOtherProductsState((prev) =>
        prev.map((p) => {
          if (p.nama_produk.toLowerCase().includes("bundling")) return p;
          const reduce = Math.floor(Math.random() * 5) + 1;
          const newStok = Math.max(0, p.stok - reduce);
          return { ...p, stok: newStok };
        })
      );
    }, 60000);

    const increase = setInterval(() => {
      setOtherProductsState((prev) =>
        prev.map((p) => {
          if (p.nama_produk.toLowerCase().includes("bundling")) return p;
          const add = Math.floor(Math.random() * 900) + 100;
          return { ...p, stok: p.stok + add };
        })
      );
    }, 3600000);

    return () => {
      clearInterval(decrease);
      clearInterval(increase);
    };
  }, []);

  useEffect(() => {
    fetchStock();
    fetchProducts();
    fetchAreaData();
  }, []);

  useEffect(() => {
    if (!searchArea) setFilteredArea(areaData);
    else {
      const lower = searchArea.toLowerCase();
      const filtered = areaData.filter(
        (a) =>
          a.provinsi.toLowerCase().includes(lower) ||
          a.kabupaten.toLowerCase().includes(lower) ||
          a.area.toLowerCase().includes(lower)
      );
      setFilteredArea(filtered);
    }
  }, [searchArea, areaData]);

  const getBgColor = (sisa) => {
    if (sisa === 0) return "bg-red-100 border-red-300";
    if (sisa < 50) return "bg-yellow-100 border-yellow-300";
    return "bg-green-100 border-green-300";
  };

  const getBadgeColor = (sisa) => {
    if (sisa === 0) return "bg-red-500";
    if (sisa < 50) return "bg-yellow-400 text-black";
    return "bg-green-600";
  };

  const highlight = (text) => {
    if (!searchArea) return text;
    const regex = new RegExp(`(${searchArea})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-300 text-black px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const randomPerak = () => Math.floor(Math.random() * 100) + 1;

  return (
    <main className="p-3 sm:p-6 bg-gradient-to-br from-white to-blue-50 min-h-screen flex justify-center text-gray-800">
      <div className="w-full max-w-5xl p-4 sm:p-6 rounded-3xl shadow-2xl bg-white border border-blue-100 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center text-center mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-full overflow-hidden mb-2 sm:mb-0 sm:mr-4 bg-blue-100 flex items-center justify-center">
            <Image src="/logo.png" alt="DIISTORE Logo" fill className="object-cover" />
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-blue-700">DIISTORE Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-50 w-full bg-blue-50/90 backdrop-blur-lg rounded-2xl py-2 px-3 flex flex-wrap justify-center gap-2 sm:gap-3 border border-blue-100 shadow-sm">
          {[
            { key: "stock", label: "📊 Stok" },
            { key: "products", label: "🛒 Produk" },
            { key: "area", label: "📍 Area" },
            { key: "other", label: "📝 Lainnya" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm sm:text-base rounded-full font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Konten */}
        <div className="mt-4 overflow-y-auto max-h-[80vh] pr-1">
          {/* STOCK */}
          {activeTab === "stock" && (
            <section>
              <div className="flex justify-center mb-3">
                <button
                  onClick={fetchStock}
                  className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow"
                >
                  🔄 Refresh Stock
                </button>
              </div>
              <p className="text-blue-500 text-xs sm:text-sm text-center mb-3">
                ⚠️ Restok setiap jam 06:00 pagi
              </p>
              {loadingStock ? (
                <p className="text-center text-gray-500">Memuat stok...</p>
              ) : (
                <div className="space-y-2">
                  {stock
                    .sort((a, b) => b.sisa_slot - a.sisa_slot)
                    .map((s, i) => (
                      <div
                        key={i}
                        className={`flex justify-between items-center p-3 rounded-xl border ${getBgColor(
                          s.sisa_slot
                        )} hover:scale-[1.01] transition-transform`}
                      >
                        <div>
                          <span className="font-semibold">{s.type}</span>
                          <div className="text-gray-500 text-sm">{s.nama}</div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs sm:text-sm rounded-full text-white font-semibold ${getBadgeColor(
                            s.sisa_slot
                          )}`}
                        >
                          {s.sisa_slot} unit
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </section>
          )}

          {/* PRODUCTS */}
          {activeTab === "products" && (
            <section>
              {loadingProducts ? (
                <p className="text-center text-gray-500">Memuat produk...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p, i) => (
                    <div
                      key={i}
                      className="p-4 bg-blue-50 border border-blue-100 rounded-2xl shadow hover:shadow-md transition"
                    >
                      <h3 className="font-bold text-blue-800">
                        {p.nama_produk} ({p.kode_produk})
                      </h3>
                      <p className="text-gray-500 text-sm">{p.kode_provider}</p>
                      <p className="text-gray-600 text-sm mt-1">{p.deskripsi}</p>
                      <p className="font-bold text-blue-700 mt-2">
                        Rp{" "}
                        {(
                          p.kode_produk === "BPAL1"
                            ? Number(p.harga_final) + 3000
                            : Number(p.harga_final) + 5000
                        ).toLocaleString("id-ID")}
                      </p>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => setSelectedProduct({ ...p, isOther: false })}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow-sm"
                        >
                          Beli
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* AREA */}
          {activeTab === "area" && (
            <section>
              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="Cari provinsi/kabupaten/area..."
                className="w-full p-2 sm:p-3 rounded-xl mb-3 border border-blue-200"
              />
              {loadingArea ? (
                <p className="text-center text-gray-500">Memuat area...</p>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {filteredArea.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-blue-50 border border-blue-100 rounded-lg text-sm"
                    >
                      <div>
                        <span className="font-semibold text-blue-800">
                          {highlight(item.provinsi)}
                        </span>
                        <div className="text-gray-600 text-xs">
                          {highlight(item.kabupaten)}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs sm:text-sm">
                        {highlight(item.area)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* OTHER PRODUCTS */}
          {activeTab === "other" && (
            <section>
              <div className="flex justify-center mb-3">
                <button
                  onClick={() => setShowOtherStock(true)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow transition"
                >
                  🔄 Cek Stok
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherProductsState.map((p, i) => (
                  <div
                    key={i}
                    className="p-3 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition"
                  >
                    <h3 className="font-bold text-blue-800">
                      {p.nama_produk} ({p.kode_produk})
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm">{p.kode_provider}</p>
                    <p className="text-gray-600 text-sm mt-1">{p.deskripsi}</p>
                    <p className="font-bold text-blue-700 mt-2">
                      Rp {Number(p.harga_final).toLocaleString("id-ID")}
                    </p>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => setSelectedProduct({ ...p, isOther: true })}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 font-semibold shadow-sm"
                      >
                        Beli
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Modal beli */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white p-5 rounded-2xl shadow-xl w-full max-w-sm border border-blue-100 animate-scaleFade relative">
            <h2 className="text-lg font-bold text-blue-700 mb-2">
              {selectedProduct.nama_produk}
            </h2>
            <p className="text-gray-600 text-sm mb-3">{selectedProduct.deskripsi}</p>
            <p className="text-blue-600 font-bold text-lg mb-3">
              Rp{" "}
              {selectedProduct.isOther
                ? Number(selectedProduct.harga_final).toLocaleString("id-ID")
                : selectedProduct.kode_produk === "BPAL1"
                ? (Number(selectedProduct.harga_final) + 3000 + randomPerak()).toLocaleString("id-ID")
                : (Number(selectedProduct.harga_final) + 5000 + randomPerak()).toLocaleString("id-ID")}
            </p>

            <div className="flex flex-col items-center gap-2">
              <Image src="/qr.png" alt="QRIS" width={180} height={180} className="rounded-xl border border-blue-200" />
              <a
                href="/qr.png"
                download="QRIS_DIISTORE.png"
                className="w-full text-center bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700"
              >
                📥 Download QRIS
              </a>
              <a
                href="https://wa.me/6283863622087"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600"
              >
                💬 Hubungi Admin
              </a>
              <a
                href="https://wa.me/6283867191746?text=menu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600"
              >
                🤖 Transaksi via BOT
              </a>
            </div>

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2 right-3 text-gray-400 text-2xl hover:text-blue-500"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleFade {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleFade {
          animation: scaleFade 0.25s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
