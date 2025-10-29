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

  // Popup state for Other Products stok
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

  // --- Random stock logic for other products ---
  useEffect(() => {
    // set stok acak awal 3000-5000
    const initial = otherProducts.map((p) => ({
      ...p,
      stok: p.nama_produk.toLowerCase().includes("bundling")
        ? 2
        : Math.floor(Math.random() * 2000) + 3000,
    }));
    setOtherProductsState(initial);

    // tiap menit kurangi acak 1-5
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

    // tiap jam tambah stok acak lagi 100–1000
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
    <main className="p-2 sm:p-4 bg-gray-900 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl p-3 sm:p-6 rounded-3xl shadow-2xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 backdrop-blur-md relative">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center text-center mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-full overflow-hidden mb-2 sm:mb-0 sm:mr-4">
            <Image src="/logo.png" alt="DIISTORE Logo" fill className="object-cover" />
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-white">DIISTORE Dashboard</h1>
        </div>

        {/* Sticky Tabs */}
        <div className="sticky top-0 z-50 w-full bg-gray-800/90 backdrop-blur-lg rounded-2xl py-2 px-2 flex flex-wrap justify-center gap-2 sm:gap-3 shadow-lg border border-gray-700">
          {[
            { key: "stock", label: "📊 Stok" },
            { key: "products", label: "🛒 Produk" },
            { key: "area", label: "📍 Area" },
            { key: "other", label: "📝 XL Only" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm sm:text-base rounded-full font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4 overflow-y-auto max-h-[80vh] pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          
          {/* STOCK */}
          {activeTab === "stock" && (
            <section>
              <div className="flex justify-center mb-2">
                <button
                  onClick={fetchStock}
                  className="px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                >
                  🔄 Refresh Stock
                </button>
              </div>
              <p className="text-yellow-400 text-xs sm:text-sm text-center mb-3">
                ⚠️ Restok setiap hari
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
  <section>
    {loadingProducts ? (
      <p className="text-white text-center">Memuat produk...</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products
          // 🔹 Filter: hapus produk dengan kode BPA & XLB
          .filter(
            (p) =>
              !p.kode_produk?.startsWith("BPA") &&
              !p.kode_produk?.startsWith("XLB")
          )
          .map((p, i) => {
            let hargaTambahan = 0;

            if (p.kode_produk?.startsWith("XLA")) hargaTambahan = 10000;
            else if (p.kode_produk?.startsWith("XDA")) hargaTambahan = 7000;
            else if (p.kode_produk?.startsWith("FMX")) hargaTambahan = 3000;

            const hargaFinal = Number(p.harga_final) + hargaTambahan;

            return (
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
                  Rp {hargaFinal.toLocaleString("id-ID")}
                </p>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => setSelectedProduct({ ...p, isOther: false })}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 font-semibold shadow-sm"
                  >
                    Beli
                  </button>
                </div>
              </div>
            );
          })}
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

         {/* OTHER PRODUCTS */}
          {activeTab === "other" && (
            <section>
              {/* tombol cek stok other product (popup) */}
              <div className="flex justify-center mb-3">
                <button
                  onClick={() => setShowOtherStock(true)}
                  className="px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                >
                  🔄 Cek Stok
                </button>
              </div>

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
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => setSelectedProduct({ ...p, isOther: true })}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 font-semibold shadow-sm"
                      >
                        Beli
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* POPUP STOK OTHER PRODUCTS */}
              {showOtherStock && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setShowOtherStock(false);
                  }}
                >
                  <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-lg relative animate-scaleFade overflow-y-auto max-h-[80vh] text-white">
                    <h2 className="text-xl font-bold mb-3 text-center">📦 Stok Lainnya</h2>
                    {otherProductsState.length === 0 ? (
                      <p className="text-gray-300 text-center">Tidak ada data stok.</p>
                    ) : (
                      <div className="space-y-2">
                        {otherProductsState.map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-gray-700/50 hover:bg-gray-700 rounded-lg px-3 py-2 transition-all"
                          >
                            <div>
                              <p className="font-semibold text-sm">{item.nama_produk}</p>
                              <p className="text-gray-400 text-xs">{item.kode_produk}</p>
                            </div>
                            <span className="text-green-400 font-bold text-sm">
                              {item.nama_produk.toLowerCase().includes("bundling")
                                ? "0 unit"
                                : `${item.stok} unit`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setShowOtherStock(false)}
                      className="absolute top-2 right-3 text-2xl text-white hover:text-red-500"
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

      {/* MODAL */}
{selectedProduct && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-sm relative animate-scaleFade">
      {/* Judul Produk */}
      <h2 className="text-white text-lg font-bold mb-1">{selectedProduct.nama_produk}</h2>
      <p className="text-gray-300 text-sm mb-2">{selectedProduct.deskripsi}</p>

      {/* Harga Produk */}
      <p className="text-green-400 font-bold text-lg mb-3">
        Rp {Number(selectedProduct.harga_final).toLocaleString("id-ID")}
      </p>

      {/* Catatan / Keterangan */}
      <p className="text-yellow-300 text-xs mb-3 leading-relaxed">
        Transfer sesuai harga di atas agar admin tahu itu Anda.
        Setelah transfer, hubungi admin.
        <br />⚠️ Restok jam 06.00 pagi.
      </p>

      {/* QRIS + Tombol Aksi */}
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

      {/* Tombol Tutup */}
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
`}</style>

    </main>
  );
}
