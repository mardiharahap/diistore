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

  return (
    <main className="p-4 bg-gray-900 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl p-4 md:p-6 rounded-3xl shadow-2xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 backdrop-blur-md transition-all duration-500">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
          📦 DIISTORE Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { key: "stock", label: "📊 Cek Stok" },
            { key: "products", label: "🛒 List Produk" },
            { key: "area", label: "📍 Cek Area" },
            { key: "other", label: "📝 Produk Lainnya" },
            { key: "buy", label: "💳 Beli" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 md:px-6 py-2 rounded-full font-semibold transition-all ${activeTab === tab.key
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-800 text-white border hover:shadow-md"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stok */}
        {activeTab === "stock" && (
          <section className="flex flex-col items-center">
            <button
              onClick={fetchStock}
              className="mb-2 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            >
              🔄 Refresh Stock
            </button>
            <p className="text-yellow-400 text-sm text-center mb-4">
              ⚠️ Restok Bekasan dan Bulanan setiap jam 06:00
            </p>
            {loadingStock ? (
              <p className="text-white">Loading stock...</p>
            ) : (
              <div className="w-full bg-gray-800 rounded-2xl p-2 md:p-4 shadow-inner space-y-2">
                {stock
                  .sort((a, b) => b.sisa_slot - a.sisa_slot)
                  .map((s, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center p-2 md:p-3 rounded-lg ${getBgColor(
                        s.sisa_slot
                      )} transition-transform duration-300 transform hover:scale-105`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm md:text-base capitalize text-white">
                          {s.type}
                        </span>
                        <span className="text-gray-200 text-xs md:text-sm font-medium">
                          {s.nama}
                        </span>
                      </div>
                      <span
                        className={`px-2 md:px-3 py-1 rounded-full text-white text-xs md:text-sm font-semibold ${getBadgeColor(
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

        {/* Produk */}
        {activeTab === "products" && (
          <section>
            {loadingProducts ? (
              <p className="text-white">Loading produk...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-2xl shadow-lg hover:shadow-2xl transition-all bg-gradient-to-br from-gray-700 to-gray-800 text-white"
                  >
                    <h3 className="font-bold text-lg mb-1">
                      {p.nama_produk} ({p.kode_produk})
                    </h3>
                    <p className="text-gray-300 text-sm mb-2">{p.kode_provider}</p>
                    <p className="text-gray-200 mb-2 whitespace-pre-line">{p.deskripsi}</p>
                    <p className="font-bold text-green-400">
                      Rp {(Number(p.harga_final) + 3000).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Produk Lainnya */}
        {activeTab === "other" && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherProductsState.map((p, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-2xl shadow-lg hover:shadow-2xl transition-all bg-gradient-to-br from-gray-700 to-gray-800 text-white"
                >
                  <h3 className="font-bold text-lg mb-1">
                    {p.nama_produk} ({p.kode_produk})
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">{p.kode_provider}</p>
                  <p className="text-gray-200 mb-2 whitespace-pre-line">{p.deskripsi}</p>
                  <p className="font-bold text-green-400">
                    Rp {Number(p.harga_final).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Beli */}
        {activeTab === "buy" && (
          <section className="flex flex-col items-center justify-center mt-6 space-y-4">
            <p className="text-white text-center mb-2 text-lg font-semibold">
              Silahkan transfer sesuai harga produk melalui QRIS berikut:
            </p>

            {/* QRIS Image */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <Image
                src="/qr.png"
                alt="QRIS Pembayaran"
                fill
                className="object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Tombol Download QRIS */}
            <a
              href="/qr.png"
              download="QRIS_DIISTORE.png"
              className="px-6 py-3 bg-blue-500 rounded-xl text-white font-bold hover:bg-blue-600 transition-colors"
            >
              📥 Download QRIS
            </a>

            <p className="text-white text-center text-sm">
              Setelah transfer, hubungi admin untuk konfirmasi pembayaran.
            </p>

            {/* Tombol Hubungi Admin */}
            <a
              href="https://wa.me/6283863622087"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600 transition-colors"
            >
              💬 Hubungi Admin
            </a>
          </section>
        )}

        {/* Area */}
        {activeTab === "area" && (
          <section>
            <input
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              placeholder="Cari provinsi/kabupaten/area..."
              className="w-full p-3 rounded-xl mb-4 text-black"
            />
            {loadingArea ? (
              <p className="text-white">Loading area...</p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredArea.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between p-3 bg-gray-700 rounded-lg text-white"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{highlight(item.provinsi)}</span>
                      <span className="text-gray-300 text-sm">{highlight(item.kabupaten)}</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-600 rounded-full text-sm">
                      {highlight(item.area)}
                    </span>
                  </div>
                ))}
                {filteredArea.length === 0 && (
                  <p className="text-gray-300 text-center">Tidak ada data</p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
