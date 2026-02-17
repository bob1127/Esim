import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useCart } from "../../components/context/CartContext";
import Layout from "../Layout";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import PLAN_ID_MAP from "../../lib/esim/planMap";

// --- Chart.js 引入與註冊 ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// --- 輔助函式與設定 ---
const getWooCommerceUrl = (endpoint, params = {}) => {
  const baseUrl = process.env.WORDPRESS_URL;
  const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const queryString = new URLSearchParams({
    consumer_key: ck,
    consumer_secret: cs,
    ...params,
  }).toString();
  return `${baseUrl}/wp-json/wc/v3/${endpoint}?${queryString}`;
};

const extractImageFromDescription = (html) => {
  const match = html?.match(/<img[^>]+src="([^">]+)"/);
  return match?.[1] || null;
};

const stripHtml = (html) =>
  html ? html.replace(/<[^>]*>?/gm, "").substring(0, 160) + "..." : "";

// --- 數據估算類別設定 ---
const CATEGORIES = [
  {
    id: "social",
    label: "社群媒體",
    subLabel: "Instagram, Facebook, Threads, LinkedIn",
    rate: 0.45,
    color: "#1E3A8A",
  },
  {
    id: "video",
    label: "影片串流",
    subLabel: "YouTube, Netflix, TikTok, Disney+",
    rate: 1.5,
    color: "#1D4ED8",
  },
  {
    id: "voip",
    label: "視訊通話 (VoIP)",
    subLabel: "WhatsApp, LINE, FaceTime, Zoom",
    rate: 0.8,
    color: "#3B82F6",
  },
  {
    id: "web",
    label: "網頁瀏覽",
    subLabel: "Chrome, Safari, 網購, 瀏覽新聞",
    rate: 0.15,
    color: "#60A5FA",
  },
  {
    id: "maps",
    label: "地圖導航",
    subLabel: "Google Maps, Apple Maps, Waze",
    rate: 0.06,
    color: "#93C5FD",
  },
  {
    id: "music",
    label: "音樂串流",
    subLabel: "Spotify, Apple Music, KKBOX",
    rate: 0.1,
    color: "#BFDBFE",
  },
  {
    id: "work",
    label: "工作與郵件",
    subLabel: "Gmail, Outlook, Slack, Teams",
    rate: 0.05,
    color: "#DBEAFE",
  },
];

// --- Modal 組件 ---
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-5xl",
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={`bg-white w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pointer-events-auto flex flex-col`}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- 相容性檢測 Modal ---
const CompatibilityModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="我的手機支援 eSIM 嗎？"
      maxWidth="max-w-2xl"
    >
      <div className="p-4 text-center text-slate-600">
        <p className="mb-4">
          請撥打 <strong>*#06#</strong> 檢查 EID。若有顯示 EID 則表示支援。
        </p>
        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm text-left">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>iPhone:</strong> XR / XS / 11 / 12 / 13 / 14 / 15 (及
              Pro/Max 系列)
            </li>
            <li>
              <strong>Google Pixel:</strong> Pixel 4 / 5 / 6 / 7 / 8 (及 Pro/a
              系列)
            </li>
            <li>
              <strong>Samsung:</strong> Galaxy S20 / S21 / S22 / S23 / S24 (及
              Ultra/Plus 系列)
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

// --- 流量估算器 Modal ---
const DataEstimatorModal = ({ isOpen, onClose }) => {
  const [days, setDays] = useState(5);
  const [hours, setHours] = useState(
    CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {}),
  );

  const calculateCategoryUsage = (categoryId) => {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    return days * hours[categoryId] * category.rate;
  };

  const totalUsage = CATEGORIES.reduce(
    (acc, cat) => acc + calculateCategoryUsage(cat.id),
    0,
  );

  const chartData = useMemo(() => {
    const dataValues = CATEGORIES.map((cat) => calculateCategoryUsage(cat.id));
    const isZero = totalUsage === 0;

    return {
      labels: CATEGORIES.map((cat) => cat.label),
      datasets: [
        {
          data: isZero ? [1] : dataValues,
          backgroundColor: isZero
            ? ["#F1F5F9"]
            : CATEGORIES.map((cat) => cat.color),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  }, [hours, days, totalUsage]);

  const chartOptions = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: totalUsage > 0,
        callbacks: {
          label: (context) =>
            ` ${context.label}: ${context.parsed.toFixed(2)} GB`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const handleSliderChange = (id, value) => {
    setHours((prev) => ({ ...prev, [id]: parseFloat(value) }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="估算您的數據用量">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex items-center justify-between">
            <label className="font-bold text-slate-700">
              您的行程總共幾天？
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-8 h-8 rounded-full bg-white shadow text-blue-600 font-bold hover:bg-blue-50"
              >
                -
              </button>
              <span className="text-xl font-bold w-8 text-center text-slate-800">
                {days}
              </span>
              <button
                onClick={() => setDays(days + 1)}
                className="w-8 h-8 rounded-full bg-white shadow text-blue-600 font-bold hover:bg-blue-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {CATEGORIES.map((cat) => {
              const currentGB = calculateCategoryUsage(cat.id).toFixed(2);
              return (
                <div
                  key={cat.id}
                  className="pb-4 border-b border-slate-100 last:border-0"
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        {cat.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {cat.subLabel}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-blue-600">
                        {currentGB} GB
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={hours[cat.id]}
                    onChange={(e) => handleSliderChange(cat.id, e.target.value)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                    <span>0h</span>
                    <span
                      className={
                        hours[cat.id] > 0 ? "text-blue-600 font-bold" : ""
                      }
                    >
                      {hours[cat.id]} 小時/天
                    </span>
                    <span>12h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-[320px] shrink-0 flex flex-col">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl sticky top-0">
            <h4 className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
              預估分佈
            </h4>
            <div className="relative w-48 h-48 mx-auto mb-6">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400">總計</span>
                <span className="text-3xl font-extrabold text-slate-800">
                  {totalUsage.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-500">GB</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-500">行程天數</span>
                <span className="font-bold text-slate-800">{days} 天</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-500">每日平均</span>
                <span className="font-bold text-slate-800">
                  {(totalUsage / days).toFixed(2)} GB
                </span>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 mt-4 text-center">
                <p className="text-xs text-blue-600 mb-1">建議方案</p>
                <p className="font-bold text-blue-900 text-lg">
                  {Math.ceil(totalUsage)} GB{" "}
                  <span className="text-sm font-normal">或</span> 吃到飽
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-2 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition"
              >
                確認並選購
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// --- 產品比較表格 ---
const ComparisonTable = () => {
  const products = [
    {
      name: "日本 eSIM AU (KDDI) - 無限",
      operator: "KDDI 單一網絡",
      features: ["支援 5G", "日本 IP", "無限流量"],
      bestFor: ["串流愛好者", "遊戲玩家", "大量數據用戶"],
      pros: [
        "連接到本地的 KDDI (au) 網絡，以獲得快速穩定的日本 IP 連接。",
        "享受無限、高速的 5G/4G 數據，沒有數據上限或限速。",
        "相容於 TikTok、ChatGPT 和 Google 等應用程式，以及日本獨有的應用程式（例如 TVer、U-NEXT）。",
      ],
      note: "ℹ️ 在極少數情況下，可能需要手動 APN 設定。",
      highlight: false,
    },
    {
      name: "日本 eSIM 5G SoftBank / KDDI",
      operator: "SoftBank / KDDI 雙重網絡",
      features: ["多城市旅行", "網絡穩定性優先"],
      bestFor: ["多城市旅行", "需要網絡穩定性的用戶"],
      pros: [
        "覆蓋日本全境的最廣泛 LTE/5G 網絡。",
        "雙重網絡切換，以實現最大信號穩定性。",
        "適合長期使用 — 最多支援 60 天。",
      ],
      note: "❌ 無法訪問 TikTok、ChatGPT 以及日本獨有應用程式（例如 TVer、U-NEXT）。",
      highlight: true,
    },
    {
      name: "日本 eSIM IIJ NTT Docomo",
      operator: "Docomo 附日本 IP",
      features: ["訪問日本獨有內容"],
      bestFor: ["訪問日本獨有內容"],
      pros: [
        "包含一個具有低延遲的真實日本 IP。",
        "完全訪問 TikTok、ChatGPT 和日本獨有的應用程式，如 TVer、U-NEXT。",
        "無限數據，全速上網。",
      ],
      note: "❌ 僅限於 4G/LTE 網絡；不支援 5G。",
      highlight: false,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm">
      <table className="w-full text-sm text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-4 font-bold text-base w-1/4">產品</th>
            <th className="p-4 font-bold text-base w-1/6">運營商</th>
            <th className="p-4 font-bold text-base w-1/6">最適合</th>
            <th className="p-4 font-bold text-base w-5/12">優點與注意事項</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-blue-50">
          {products.map((p, idx) => (
            <tr
              key={idx}
              className={`hover:bg-blue-50/50 transition-colors ${p.highlight ? "bg-blue-50/30" : ""}`}
            >
              <td className="p-4 align-top">
                <div className="font-bold text-slate-800 text-base mb-1">
                  {p.name}
                </div>
                {p.highlight && (
                  <span className="inline-block px-2 py-0.5 bg-red-500 text-white text-xs rounded font-bold mb-2">
                    HOT 🔥
                  </span>
                )}
                <div className="flex flex-wrap gap-1">
                  {p.features.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4 align-top text-slate-700 font-medium">
                {p.operator}
              </td>
              <td className="p-4 align-top">
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  {p.bestFor.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </td>
              <td className="p-4 align-top">
                <ul className="space-y-2 mb-3">
                  {p.pros.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-slate-700 leading-relaxed"
                    >
                      <span className="shrink-0 text-blue-500">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-xs bg-slate-50 border border-slate-100 p-2 rounded text-slate-500 leading-relaxed">
                  {p.note}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- ProductTabs 組件 ---
const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("desc");
  const tabs = [
    { id: "desc", label: "產品介紹" },
    { id: "specs", label: "套餐參數" },
    { id: "install", label: "安裝/激活" },
  ];

  return (
    <div className="mt-16">
      <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all duration-300 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-8 min-h-[300px]">
        {activeTab === "desc" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="prose prose-lg prose-slate max-w-none mb-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                在這裡尋找最佳日本旅遊 eSIM，為您的奇妙旅程帶來便利。
              </h3>
              <p className="text-slate-600 leading-loose">
                我們的日本 eSIM 支援<strong>無限數據</strong>
                ，覆蓋大部分城市，並讓您在流暢的網絡下設置熱點，與朋友或家人分享。
                這張日本 eSIM 卡即時透過電子郵件發送，並在幾秒鐘內透過 QR
                碼激活。在 iPhone 和 Android 上設置日本 eSIM 卡就像 ABC
                一樣簡單。
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                <p className="text-blue-900 m-0">
                  <strong>注意：</strong> 此日本 eSIM 方案支援
                  Google、YouTube、Facebook、Instagram 和 WhatsApp 等應用程式，
                  <span className="text-red-600 font-bold">
                    但不支援 TikTok
                  </span>
                  。 如果您是 TikTok 的忠實用戶，請考慮下表中的{" "}
                  <strong>IIJ NTT Docomo</strong> 方案。
                </p>
              </div>
            </div>

            <div className="text-center mb-8">
              <h4 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
                <span className="text-2xl">🔍</span> 哪款日本 eSIM 最適合您？
              </h4>
            </div>

            <ComparisonTable />

            <div className="mt-12 pt-8 border-t border-gray-100">
              {product && product.description && (
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  className="prose prose-sm max-w-none text-slate-500 opacity-80"
                />
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "specs" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-slate-600"
          >
            <p>規格內容...</p>
          </motion.div>
        )}

        {activeTab === "install" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h4 className="text-lg font-bold mb-4">安裝步驟說明</h4>
            <p className="text-slate-600">這裡放置安裝教學...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- 主頁面 ---
export async function getStaticPaths() {
  try {
    const apiUrl = getWooCommerceUrl("products", { per_page: 100 });
    const res = await fetch(apiUrl);
    const products = await res.json();
    if (!Array.isArray(products)) return { paths: [], fallback: "blocking" };
    return {
      paths: products.map((product) => ({ params: { slug: product.slug } })),
      fallback: "blocking",
    };
  } catch (err) {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      getWooCommerceUrl("products", { slug: params.slug }),
    );
    const data = await res.json();
    if (!data || data.length === 0) return { notFound: true };
    const product = data[0];

    let variations = [];
    if (product.type === "variable") {
      const varRes = await fetch(
        getWooCommerceUrl(`products/${product.id}/variations`, {
          per_page: 50,
        }),
      );
      if (varRes.ok) variations = await varRes.json();
    }

    console.log(`✅ [ISR Update] 商品已更新: ${product.name}`);
    return { props: { product, variations }, revalidate: 10 };
  } catch (err) {
    return { notFound: true };
  }
}

export default function ProductPage({ product, variations = [] }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentVariation, setCurrentVariation] = useState(null);
  const [displayPrice, setDisplayPrice] = useState(product?.price);

  const [isCompatOpen, setIsCompatOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);

  useEffect(() => {
    if (product?.type === "variable" && variations.length > 0) {
      const allSelected = product.attributes.every(
        (attr) => selectedAttributes[attr.name],
      );
      if (allSelected) {
        const match = variations.find((v) =>
          v.attributes.every(
            (vAttr) => vAttr.option === selectedAttributes[vAttr.name],
          ),
        );
        if (match) {
          setCurrentVariation(match);
          setDisplayPrice(match.price);
        }
      }
    }
  }, [selectedAttributes, product, variations]);

  const handleAttributeSelect = (attributeName, option) => {
    setSelectedAttributes((prev) => ({ ...prev, [attributeName]: option }));
  };

  const handleAddToCart = () => {
    if (product.type === "variable" && !currentVariation) {
      alert("請先選擇商品規格");
      return;
    }
    const finalProduct = currentVariation || product;
    const image =
      finalProduct.image?.src ||
      product.images?.[0]?.src ||
      extractImageFromDescription(product.description) ||
      "/default-image.jpg";
    const cleanedSku = (finalProduct.sku || "").trim().replace(/\u200B/g, "");
    const planId =
      PLAN_ID_MAP[cleanedSku] ||
      finalProduct.meta_data?.find((m) => m.key === "esim_plan_id")?.value ||
      null;
    let cartItemName = product.name;
    if (currentVariation) {
      cartItemName = `${product.name} - ${currentVariation.attributes
        .map((a) => a.option)
        .join(" / ")}`;
    }

    addToCart({
      id: finalProduct.id,
      parentId: product.id,
      name: cartItemName,
      price: finalProduct.price,
      sku: cleanedSku,
      planId,
      image,
      quantity,
      slug: product.slug,
    });

    setTimeout(() => {
      const event = new Event("open-cart-sidebar");
      window.dispatchEvent(event);
    }, 500);
  };

  if (router.isFallback) return <Layout>載入中...</Layout>;

  // ★★★ 安全檢查：防止 product 為 undefined 時崩潰 ★★★
  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          找不到商品資訊
        </div>
      </Layout>
    );
  }

  // Images 處理 (使用 Optional Chaining 防止崩潰)
  const seoImage = product.images?.[0]?.src || "/default-image.jpg";
  const images = product.images?.length
    ? product.images
    : [{ src: seoImage, alt: product.name }];

  return (
    <Layout>
      <Head>
        <title>{product.name} | FeGo eSIM</title>
        <meta
          name="description"
          content={stripHtml(product.short_description || "")}
        />
      </Head>

      <CompatibilityModal
        isOpen={isCompatOpen}
        onClose={() => setIsCompatOpen(false)}
      />
      <DataEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
      />

      <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 bg-white">
        <div className="flex flex-col lg:flex-row pt-10 gap-12 mb-20">
          {/* 左側圖片區 */}
          <div className="w-full lg:w-3/5 flex lg:flex-row flex-col-reverse gap-4 items-start h-[500px]">
            <div className="hidden lg:flex flex-col items-center gap-3 w-[80px] shrink-0 h-full">
              <button
                onClick={() => mainSwiper?.slidePrev()}
                className="w-full h-8 flex items-center justify-center hover:bg-gray-50 text-gray-400"
              >
                ▲
              </button>
              <Swiper
                onSwiper={setThumbsSwiper}
                direction="vertical"
                spaceBetween={12}
                slidesPerView="auto"
                modules={[FreeMode, Thumbs]}
                className="w-full flex-1"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx} className="!h-[80px]">
                    <div className="w-full h-full relative border border-gray-200 rounded cursor-pointer overflow-hidden hover:border-black transition-all">
                      <Image
                        src={img.src}
                        alt="thumb"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                onClick={() => mainSwiper?.slideNext()}
                className="w-full h-8 flex items-center justify-center hover:bg-gray-50 text-gray-400"
              >
                ▼
              </button>
            </div>
            <div className="w-full h-full relative border border-gray-100 bg-gray-50 rounded-lg overflow-hidden flex-1">
              <Swiper
                onSwiper={setMainSwiper}
                loop={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="w-full h-full"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="w-full h-full relative flex items-center justify-center bg-gray-50">
                      <Image
                        src={img.src}
                        alt="main"
                        fill
                        className="object-contain"
                        priority={idx === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* 右側資訊區 */}
          <div className="w-full lg:w-2/5 flex flex-col justify-start relative">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsCompatOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                檢查手機相容性
              </button>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl text-blue-600 font-bold mb-6">
              NT${displayPrice || product.price}
            </p>

            {product.short_description && (
              <div
                className="text-sm text-slate-600 mb-6 leading-relaxed border-b border-gray-100 pb-6"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {product.type === "variable" && product.attributes && (
              <div className="mb-6 space-y-5">
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="flex flex-col">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {attr.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((option) => (
                        <button
                          key={option}
                          onClick={() =>
                            handleAttributeSelect(attr.name, option)
                          }
                          className={`px-4 py-2 border text-sm transition-all ${
                            selectedAttributes[attr.name] === option
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 mb-4">
              <div className="flex items-center border border-gray-300 h-[48px] w-[120px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full hover:bg-gray-50"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.type === "variable" && !currentVariation}
                className={`flex-1 h-[48px] text-sm font-bold uppercase tracking-widest transition-all ${
                  product.type === "variable" && !currentVariation
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {product.type === "variable" && !currentVariation
                  ? "請選擇規格"
                  : "加入購物車"}
              </button>
            </div>

            <button
              onClick={() => setIsEstimatorOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-200 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              估算我的數據用量
            </button>
          </div>
        </div>

        {/* 底部內容：產品介紹 Tabs + 表格 */}
        <ProductTabs product={product} />
      </div>
    </Layout>
  );
}
