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
  const [refreshing, setRefreshing] = useState(false);

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
    setRefreshing(true);
    try {
      const res = await fetch("/api/cek_stock");
      const data = await res.json();
      setStock(data?.data || []);
    } catch {
      setStock([]);
    } finally {
      setLoadingStock(false);
      setTimeout(() => setRefreshing(false), 600); // efek animasi berhenti
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
    fetchStock();
    fetchProducts();
    fetchAreaData();
    setOtherProductsState(otherProducts);
  }, []);

  useEffect(() => {
    if (!searchArea) {
      setFilteredArea(areaData);
    } else {
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
    if (sisa === 0) return "bg-red-600/30";
    if (sisa < 50) return "bg-yellow-400/30";
    return "bg-green-500/30";
  };

  const getBadgeColor = (sisa) => {
    if (sisa === 0) return "bg-red-600";
    if (sisa < 50) return "bg-yellow-500";
    return "bg-green-600";
  };

  const highlight = (text) => {
    if (!searchArea) return text;
    const regex = new RegExp(`(${searchArea})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-400/70 text-black px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const randomPerak = () => Math.floor(Math.random() * 100) + 1;

  return (
    <main className="p-2 sm:p-4 bg-gray-900 min-h-screen flex justify-center overflow-x-hidden">
      <div className="w-full max-w-4xl p-3 sm:p-6 rounded-3xl shadow-2xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 backdrop-blur-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center text-center mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-full overflow-hidden mb-2 sm:mb-0 sm:mr-4">
            <Image src="/logo.png" alt="DIISTORE Logo" fill className="object-cover" />
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-white">DIISTORE Dashboard</h1>
        </div>

        {/* Tabs - sticky agar tetap di atas */}
        <div className="sticky top-0 z-50 w-full bg-gray-800/90 backdrop-blur-md rounded-2xl py-2 px-2 flex flex-wrap justify-center gap-2 sm:gap-3 shadow-lg">
          {[
            { key: "stock", label: "📊 Stok" },
            { key: "products", label: "🛒 Produk" },
            { key: "area", label: "📍 Area" },
            { key: "other", label: "📝 Lainnya" },
          ].map((tab) => (
            <button
  key={tab.key}
  onClick={() => setActiveTab(tab.key)}
  className={`px-4 py-2 text-sm sm:text-base rounded-full font-semibold 
              transform transition-all duration-150 
              active:scale-95 hover:scale-105
              ${
                activeTab === tab.key
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
>
  {tab.label}
</button>

          ))}
        </div>

        {/* STOCK */}
        {activeTab === "stock" && (
          <section className="mt-4">
            <button
              onClick={fetchStock}
              className={`mb-2 w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-full flex items-center justify-center gap-2 font-semibold hover:bg-green-600 transition-all ${
                refreshing ? "animate-spin-slow" : ""
              }`}
            >
              🔄 {refreshing ? "Merefresh..." : "Refresh Stock"}
            </button>
            <p className="text-yellow-400 text-xs sm:text-sm text-center mb-3">
              ⚠️ Restok setiap jam 06:00 pagi
            </p>
            {loadingStock ? (
              <p className="text-white text-center">Memuat stok...</p>
            ) : (
              <div className="space-y-2">
                {stock
                  .sort((a, b) => b.sisa_slot - a.sisa_slot)
                  .map((s, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center p-2 sm:p-3 rounded-xl ${getBgColor(
                        s.sisa_slot
                      )} hover:scale-[1.02] transition-transform`}
                    >
                      <div>
                        <span className="font-semibold text-white text-sm sm:text-base">{s.type}</span>
                        <div className="text-gray-300 text-xs sm:text-sm">{s.nama}</div>
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
          <section className="mt-4">
            {loadingProducts ? (
              <p className="text-white text-center">Memuat produk...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((p, i) => (
                  <div
                    key={i}
                    className="p-3 sm:p-4 bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all text-white"
                  >
                    <h3 className="font-bold text-base sm:text-lg">
                      {p.nama_produk} ({p.kode_produk})
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">{p.kode_provider}</p>
                    <p className="text-gray-300 text-sm mt-1 whitespace-pre-line">{p.deskripsi}</p>
                    <p className="font-bold text-green-400 mt-2">
                      Rp{" "}
                      {(
                        p.kode_produk === "BPAL1"
                          ? Number(p.harga_final) + 3000
                          : Number(p.harga_final) + 5000
                      ).toLocaleString("id-ID")}
                    </p>
                    <button
                      onClick={() => setSelectedProduct({ ...p, isOther: false })}
                      className="mt-2 w-full bg-blue-500 py-2 rounded-lg font-semibold hover:bg-blue-600"
                    >
                      Beli
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* OTHER PRODUCTS */}
        {activeTab === "other" && (
          <section className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherProductsState.map((p, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-800 rounded-2xl shadow-md text-white hover:shadow-xl transition-all"
                >
                  <h3 className="font-bold text-base sm:text-lg">
                    {p.nama_produk} ({p.kode_produk})
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{p.kode_provider}</p>
                  <p className="text-gray-300 text-sm mt-1 whitespace-pre-line">{p.deskripsi}</p>
                  <p className="font-bold text-green-400 mt-2">
                    Rp {Number(p.harga_final).toLocaleString("id-ID")}
                  </p>
                  <button
                    onClick={() => setSelectedProduct({ ...p, isOther: true })}
                    className="mt-2 w-full bg-blue-500 py-2 rounded-lg font-semibold hover:bg-blue-600"
                  >
                    Beli
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AREA */}
        {activeTab === "area" && (
          <section className="mt-4">
            <input
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              placeholder="Cari provinsi/kabupaten/area..."
              className="w-full p-2 sm:p-3 rounded-xl mb-3 text-black"
            />
            {loadingArea ? (
              <p className="text-white text-center">Memuat area...</p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredArea.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-700 rounded-lg text-white text-sm"
                  >
                    <div>
                      <span className="font-semibold">{highlight(item.provinsi)}</span>
                      <div className="text-gray-300 text-xs">{highlight(item.kabupaten)}</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-600 rounded-full text-xs sm:text-sm">
                      {highlight(item.area)}
                    </span>
                  </div>
                ))}
                {filteredArea.length === 0 && (
                  <p className="text-gray-300 text-center">Tidak ada data ditemukan</p>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-sm relative animate-scaleFade">
            <h2 className="text-white text-lg font-bold mb-1">{selectedProduct.nama_produk}</h2>
            <p className="text-gray-300 text-sm mb-2">{selectedProduct.deskripsi}</p>
            <p className="text-green-400 font-bold text-lg mb-3">
              Rp{" "}
              {selectedProduct.isOther
                ? Number(selectedProduct.harga_final).toLocaleString("id-ID")
                : selectedProduct.kode_produk === "BPAL1"
                ? (Number(selectedProduct.harga_final) + 3000 + randomPerak()).toLocaleString(
                    "id-ID"
                  )
                : (Number(selectedProduct.harga_final) + 5000 + randomPerak()).toLocaleString(
                    "id-ID"
                  )}
            </p>

            <p className="text-yellow-300 text-xs mb-3 leading-relaxed">
              Transfer sesuai harga di atas agar admin tahu itu Anda. Setelah TF, hubungi admin.
              <br />⚠️ Restok jam 06.00 pagi.
            </p>

            <div className="flex flex-col items-center gap-2">
              <Image
                src="/qr.png"
                alt="QRIS"
                width={180}
                height={180}
                className="rounded-xl shadow-md"
              />
              <a
                href="/qr.png"
                download="QRIS_DIISTORE.png"
                className="w-full text-center bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600"
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
                className="w-full text-center bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700"
              >
                🤖 Transaksi via BOT
              </a>
            </div>

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2 right-3 text-white text-2xl hover:text-red-500"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleFade {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleFade {
          animation: scaleFade 0.25s ease-out forwards;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 0.7s linear infinite;
        }
      `}</style>
    </main>
  );
}
