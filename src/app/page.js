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
          return { ...p, stok: Math.max(0, p.stok - reduce) };
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
    if (!searchArea) {
      setFilteredArea(areaData);
    } else {
      const lower = searchArea.toLowerCase();
      setFilteredArea(
        areaData.filter(
          (a) =>
            a.provinsi.toLowerCase().includes(lower) ||
            a.kabupaten.toLowerCase().includes(lower) ||
            a.area.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchArea, areaData]);

  const getBgColor = (sisa) => {
    if (sisa === 0) return "bg-pink-600/30";
    if (sisa < 50) return "bg-yellow-400/30";
    return "bg-purple-600/30";
  };

  const getBadgeColor = (sisa) => {
    if (sisa === 0) return "bg-pink-600";
    if (sisa < 50) return "bg-yellow-400";
    return "bg-purple-500";
  };

  const highlight = (text) => {
    if (!searchArea) return text;
    const regex = new RegExp(`(${searchArea})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-300/80 text-black px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const randomPerak = () => Math.floor(Math.random() * 100) + 1;

  return (
    <main className="p-2 sm:p-4 bg-gradient-to-br from-[#23004b] via-[#3c0071] to-[#6a0dad] min-h-screen flex justify-center">
      <div className="w-full max-w-4xl p-3 sm:p-6 rounded-3xl shadow-2xl bg-gradient-to-br from-[#2b0060] via-[#370070] to-[#4b0082] backdrop-blur-md relative border border-purple-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center text-center mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-full overflow-hidden mb-2 sm:mb-0 sm:mr-4 ring-2 ring-purple-400">
            <Image src="/logo.png" alt="Axis Logo" fill className="object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">
            Kuota Axis XL Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-50 w-full bg-purple-900/70 backdrop-blur-lg rounded-2xl py-2 px-2 flex flex-wrap justify-center gap-2 sm:gap-3 shadow-md border border-purple-700">
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
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                  : "bg-purple-800 text-gray-200 hover:bg-purple-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4 overflow-y-auto max-h-[80vh] pr-1 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-900">
          {/* === STOCK === */}
          {activeTab === "stock" && (
            <section>
              <div className="flex justify-center mb-3">
                <button
                  onClick={fetchStock}
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:scale-105 transition-transform font-bold shadow-md"
                >
                  🔄 Refresh Stock
                </button>
              </div>
              <p className="text-yellow-300 text-xs sm:text-sm text-center mb-3">
                ⚡ Restok setiap jam 06:00 pagi
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
                        )} hover:scale-[1.02] transition-transform border border-purple-700`}
                      >
                        <div>
                          <span className="font-semibold text-white text-sm sm:text-base">
                            {s.type}
                          </span>
                          <div className="text-purple-200 text-xs sm:text-sm">{s.nama}</div>
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

          {/* === PRODUCTS === */}
          {activeTab === "products" && (
            <section>
              {loadingProducts ? (
                <p className="text-white text-center">Memuat produk...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p, i) => (
                    <div
                      key={i}
                      className="p-3 sm:p-4 bg-purple-800/60 rounded-2xl shadow-md hover:shadow-xl transition-all text-white border border-purple-600"
                    >
                      <h3 className="font-bold text-base sm:text-lg">
                        {p.nama_produk} ({p.kode_produk})
                      </h3>
                      <p className="text-purple-200 text-xs sm:text-sm">{p.kode_provider}</p>
                      <p className="text-gray-200 text-sm mt-1 whitespace-pre-line">{p.deskripsi}</p>
                      <p className="font-bold text-green-300 mt-2">
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
                          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-md hover:scale-105 transition-transform font-semibold"
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

          {/* === AREA === */}
          {activeTab === "area" && (
            <section>
              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="Cari provinsi/kabupaten/area..."
                className="w-full p-3 rounded-xl mb-3 text-black outline-purple-600 focus:ring-2 focus:ring-purple-400"
              />
              {loadingArea ? (
                <p className="text-white text-center">Memuat area...</p>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {filteredArea.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-purple-800/50 rounded-lg text-white text-sm border border-purple-700"
                    >
                      <div>
                        <span className="font-semibold">{highlight(item.provinsi)}</span>
                        <div className="text-purple-200 text-xs">{highlight(item.kabupaten)}</div>
                      </div>
                      <span className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-xs sm:text-sm">
                        {highlight(item.area)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* === OTHER PRODUCTS === */}
          {activeTab === "other" && (
            <section>
              <div className="flex justify-center mb-3">
                <button
                  onClick={() => setShowOtherStock(true)}
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:scale-105 transition-transform font-bold shadow-md"
                >
                  🔄 Cek Stok
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherProductsState.map((p, i) => (
                  <div
                    key={i}
                    className="p-3 bg-purple-800/60 rounded-2xl shadow-md text-white hover:shadow-xl transition-all border border-purple-600"
                  >
                    <h3 className="font-bold text-base sm:text-lg">
                      {p.nama_produk} ({p.kode_produk})
                    </h3>
                    <p className="text-purple-200 text-xs sm:text-sm">{p.kode_provider}</p>
                    <p className="text-gray-200 text-sm mt-1 whitespace-pre-line">{p.deskripsi}</p>
                    <p className="font-bold text-green-300 mt-2">
                      Rp {Number(p.harga_final).toLocaleString("id-ID")}
                    </p>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => setSelectedProduct({ ...p, isOther: true })}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-md hover:scale-105 transition-transform font-semibold"
                      >
                        Beli
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showOtherStock && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setShowOtherStock(false);
                  }}
                >
                  <div className="bg-purple-900 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-lg relative animate-scaleFade overflow-y-auto max-h-[80vh] text-white border border-purple-600">
                    <h2 className="text-xl font-bold mb-3 text-center text-pink-300">
                      📦 Stok Produk Lain
                    </h2>
                    {otherProductsState.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-purple-800/70 hover:bg-purple-700 rounded-lg px-3 py-2 transition-all border border-purple-600"
                      >
                        <div>
                          <p className="font-semibold text-sm">{item.nama_produk}</p>
                          <p className="text-purple-300 text-xs">{item.kode_produk}</p>
                        </div>
                        <span className="text-green-300 font-bold text-sm">
                          {item.nama_produk.toLowerCase().includes("bundling")
                            ? "Tersedia (2)"
                            : `${item.stok} unit`}
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowOtherStock(false)}
                      className="absolute top-2 right-3 text-2xl text-white hover:text-pink-400"
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

      {/* MODAL PEMBELIAN */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-purple-900 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-sm relative animate-scaleFade border border-purple-600">
            <h2 className="text-white text-lg font-bold mb-1">{selectedProduct.nama_produk}</h2>
            <p className="text-purple-200 text-sm mb-2">{selectedProduct.deskripsi}</p>
            <p className="text-green-300 font-bold text-lg mb-3">
              Rp{" "}
              {selectedProduct.isOther
                ? Number(selectedProduct.harga_final).toLocaleString("id-ID")
                : selectedProduct.kode_produk === "BPAL1"
                ? (Number(selectedProduct.harga_final) + 3000 + randomPerak()).toLocaleString("id-ID")
                : (Number(selectedProduct.harga_final) + 5000 + randomPerak()).toLocaleString("id-ID")}
            </p>

            <p className="text-yellow-200 text-xs mb-3 leading-relaxed">
              Transfer sesuai harga di atas agar admin tahu itu Anda. Setelah TF, hubungi admin.
              <br />⚠️ Restok jam 06.00 pagi.
            </p>

            <div className="flex flex-col items-center gap-2">
              <Image src="/qr.png" alt="QRIS" width={180} height={180} className="rounded-xl shadow-md" />
              <a
                href="/qr.png"
                download="QRIS_AXIS_XL.png"
                className="w-full text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 rounded-lg hover:scale-105 transition-transform"
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
                className="w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded-lg hover:scale-105 transition-transform"
              >
                🤖 Transaksi via BOT
              </a>
            </div>

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2 right-3 text-white text-2xl hover:text-pink-400"
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
      `}</style>
    </main>
  );
}
