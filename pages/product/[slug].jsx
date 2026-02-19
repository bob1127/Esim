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

// --- Chart.js ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
ChartJS.register(ArcElement, Tooltip, Legend);

// ==========================================
// 0. 靜態資料設定
// ==========================================

// 支援 eSIM 的裝置清單
const COMPATIBLE_DEVICES = [
  {
    category: "支援 eSIM 的蘋果 iPhone",
    items: [
      "iPhone 16 / 16 Plus / 16 Pro / 16 Pro Max",
      "iPhone 15 / 15 Plus / 15 Pro / 15 Pro Max",
      "iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max",
      "iPhone 13 / 13 Mini / 13 Pro / 13 Pro Max",
      "iPhone 12 / 12 Mini / 12 Pro / 12 Pro Max",
      "iPhone 11 / 11 Pro / 11 Pro Max",
      "iPhone XS / XS Max / XR",
      "iPhone SE (2020 / 2022)",
    ],
  },
  {
    category: "相容 eSIM 的 iPad (Wi-Fi + 行動網路)",
    items: [
      "iPad Pro 13 吋 (M4)",
      "iPad Pro 11 吋 (第一代至第四代)",
      "iPad Pro 12.9 吋 (第三代至第六代)",
      "iPad Air (第三代至第六代)",
      "iPad Mini (第五代、第六代)",
      "iPad (第七代至第十代)",
    ],
  },
  {
    category: "Google Pixel 支援 eSIM 的手機",
    items: [
      "Pixel 9 / 9 Pro / 9 Pro XL / 9 Pro Fold",
      "Pixel 8 / 8 Pro / 8a",
      "Pixel 7 / 7 Pro / 7a",
      "Pixel 6 / 6 Pro / 6a",
      "Pixel 5 / 5a",
      "Pixel 4 / 4a / 4 XL",
    ],
  },
  {
    category: "具備 eSIM 功能的三星手機",
    items: [
      "Galaxy S24 / S24+ / S24 Ultra",
      "Galaxy S23 / S23+ / S23 Ultra",
      "Galaxy S22 / S22+ / S22 Ultra",
      "Galaxy S21 / S21+ / S21 Ultra",
      "Galaxy S20 / S20+ / S20 Ultra",
      "Galaxy Z Flip (全系列)",
      "Galaxy Z Fold (全系列)",
    ],
  },
  {
    category: "其他支援 eSIM 的手機裝置",
    items: [
      "Sony Xperia 1 IV / 5 IV / 10 IV",
      "Sony Xperia 1 V / 5 V / 10 V",
      "Sharp Aquos Sense 4 lite / Sense 6",
      "Oppo Find X3 Pro / X5 / X5 Pro",
      "Xiaomi 12T Pro / 13 / 13 Pro",
    ],
  },
];

// 電信商基本資訊 (上方行銷區塊用)
const CARRIER_INFO_MAP = {
  "SoftBank / KDDI": {
    badges: [
      { text: "KDDI", type: "5G" },
      { text: "SoftBank", type: "5G" },
    ],
    marketingBox: {
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
      couponText: "這款 eSIM 加碼 5% 折扣！使用折扣碼：Hello26",
      policyTitle: "公平使用政策 (FUP):",
      policyDesc:
        "每日高速數據用完後，降速至 5Mbps 吃到飽 (高速數據每24小時重置)。",
      note: "注意：我們建議您抵達當地後再安裝 eSIM。",
      specialRules: {
        無限流量: {
          policyDesc: "無限流量，平均速度8~20Mbps。",
          note: "注意: 我們建議您抵達後再新增 eSIM。查看啟用政策。",
        },
      },
    },
    summaryPrefix: "SoftBank / KDDI",
  },
  "AU(KDDI)": {
    badges: [{ text: "KDDI", type: "5G" }],
    marketingBox: {
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
      couponText: "這款 eSIM 加碼 5% 折扣！使用折扣碼：Hello26",
      policyTitle: "公平使用政策 (FUP):",
      policyDesc: "無限流量，平均速度8~20Mbps。",
      note: "注意：我們建議您抵達後再新增 eSIM。查看啟用政策。",
      specialRules: {
        無限流量: {
          policyDesc: "無限高速數據。具體速度取決於您的位置和本地網絡。",
        },
        無限流量10Mbps: {
          policyDesc: "無限流量，平均速度8~20Mbps。",
        },
      },
    },
    summaryPrefix: "AU(KDDI)",
  },
  "IIJ Docomo": {
    badges: [{ text: "Docomo", type: "4G/LTE" }],
    marketingBox: {
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      couponText: "支援 TikTok / Netflix 跨區解鎖",
      policyTitle: "流量規範:",
      policyDesc: "總量型方案，用完斷網。",
      note: "注意：此線路為日本 IP。",
    },
    summaryPrefix: "IIJ Docomo",
  },
  default: {
    badges: [],
    marketingBox: {
      bgColor: "bg-gray-50",
      borderColor: "border-gray-100",
      couponText: "請選擇電信商以查看詳細規格",
      policyTitle: "說明:",
      policyDesc: "不同電信商擁有不同的流量公平使用原則 (FUP)。",
      note: "",
    },
    summaryPrefix: "eSIM",
  },
};

// ★★★ 3. 詳細規格參數 (Tab 內容) ★★★
const CARRIER_SPECS_DATA = {
  "SoftBank / KDDI": [
    {
      label: "訊號覆蓋範圍",
      value: "東京、京都、廣島、關東、長崎、大阪等日本各城市及旅遊目的地。",
    },
    { label: "電信業者", value: "KDDI (5G) / Softbank (5G)" },
    { label: "速度", value: "4G / LTE / 5G" },
    { label: "方案類型", value: "僅數據流量" },
    { label: "網路共用 / 熱點功能", value: "支持" },
    { label: "電話號碼", value: "無" },
    { label: "通話", value: "不支持，只能透過應用程式（網路通話，即 VoIP）。" },
    { label: "簡訊", value: "無" },
    { label: "eKYC (身分驗證)", value: "不需要" },
    {
      label: "交付",
      value: "eSIM 的 QR 碼會在付款完成後的幾分鐘內透過電子郵件發送給您。",
    },
    { label: "數據路由", value: "漫遊" },
    { label: "充值選項", value: "無" },
    {
      label: "效期政策",
      value:
        "一旦 eSIM 連接到支援的網路並開始產生數據訪問互聯網，有效期即開始。我們建議您在到達目的地後添加 eSIM。您可以提前安裝 eSIM，但請記得安裝後立即將其關閉，以避免有效期提前開始。",
      fullWidth: true,
    },
  ],
  "AU(KDDI)": [
    { label: "訊號覆蓋範圍", value: "全日本覆蓋，偏遠地區信號優良。" },
    { label: "電信業者", value: "AU KDDI (5G)" },
    { label: "速度", value: "5G / 4G LTE" },
    { label: "方案類型", value: "僅數據流量" },
    { label: "網路共用 / 熱點功能", value: "支持 (無限流量方案公平使用)" },
    { label: "eKYC (身分驗證)", value: "不需要" },
    { label: "交付", value: "Email 即時發送" },
    { label: "數據路由", value: "日本原生 IP (低延遲)" },
    { label: "效期政策", value: "插卡即啟用，以自然日計算。", fullWidth: true },
  ],
  default: [
    {
      label: "說明",
      value: "請選擇上方的電信商以查看詳細技術規格。",
      fullWidth: true,
    },
  ],
};

// ★★★ 4. 產品介紹文字 (Tab 內容) ★★★
const CARRIER_INTRO_DATA = {
  "SoftBank / KDDI": {
    bullets: [
      "在這裡尋找最佳日本旅遊 eSIM，為您的奇妙旅程帶來便利。",
      "我們的日本 eSIM 支援無限數據，覆蓋大部分城市，並讓您在流暢的網絡下設置熱點，與朋友或家人分享。",
      "這張日本 eSIM 卡即時透過電子郵件發送，並在幾秒鐘內透過 QR 碼激活。在 iPhone 和 Android 上設置日本 eSIM 卡就像 ABC 一樣簡單。",
      "此日本 eSIM 方案支援 Google、YouTube、Facebook、Instagram 和 WhatsApp 等應用程式，但不支援 TikTok。如果您是 TikTok 的忠實用戶，請考慮 IIJ NTT Docomo 方案。",
    ],
  },
  "AU(KDDI)": {
    bullets: [
      "連接到本地的 KDDI (au) 網絡，以獲得快速穩定的日本 IP 連接。",
      "享受無限、高速的 5G/4G 數據，沒有數據上限或限速 (視方案而定)。",
      "相容於 TikTok、ChatGPT 和 Google 等應用程式，以及日本獨有的應用程式（例如 TVer、U-NEXT）。",
      "在極少數情況下，可能需要手動 APN 設定。",
    ],
  },
  default: {
    bullets: ["請選擇電信商以查看介紹。"],
  },
};

// --- 輔助函式 ---
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

// --- 數據估算設定 ---
const CATEGORIES = [
  {
    id: "social",
    label: "社群媒體",
    subLabel: "IG, FB, Threads",
    rate: 0.45,
    color: "#1E3A8A",
  },
  {
    id: "video",
    label: "影片串流",
    subLabel: "YouTube, Netflix, TikTok",
    rate: 1.5,
    color: "#1D4ED8",
  },
  {
    id: "voip",
    label: "視訊通話",
    subLabel: "WhatsApp, LINE, Zoom",
    rate: 0.8,
    color: "#3B82F6",
  },
  {
    id: "web",
    label: "網頁瀏覽",
    subLabel: "Chrome, Safari, 網購",
    rate: 0.15,
    color: "#60A5FA",
  },
  {
    id: "maps",
    label: "地圖導航",
    subLabel: "Google Maps",
    rate: 0.06,
    color: "#93C5FD",
  },
  {
    id: "music",
    label: "音樂串流",
    subLabel: "Spotify, Apple Music",
    rate: 0.1,
    color: "#BFDBFE",
  },
  {
    id: "work",
    label: "工作與郵件",
    subLabel: "Gmail, Slack, Teams",
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
            className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
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
                  ✕
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

const CompatibilityModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const filteredDevices = useMemo(() => {
    if (!searchTerm) return COMPATIBLE_DEVICES;
    return COMPATIBLE_DEVICES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm) {
      const allOpen = {};
      filteredDevices.forEach((_, idx) => (allOpen[idx] = true));
      setOpenSections(allOpen);
    } else {
      setOpenSections({});
    }
  }, [searchTerm, filteredDevices]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="我的手機支援日本 eSIM 嗎？"
      maxWidth="max-w-3xl"
    >
      <div className="text-slate-700 space-y-6">
        <div className="bg-slate-50 p-4 rounded-xl text-sm leading-relaxed border border-gray-100">
          <p className="font-bold mb-2">若要使用 FeGo eSIM，請確保您的裝置：</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <strong>電信商已解鎖：</strong>{" "}
              手機未鎖定特定電信業者（Sim-Free）。
            </li>
            <li>
              <strong>支援 eSIM：</strong>
              <span className="block mt-1 ml-2 text-blue-600 font-bold">
                1. 撥打 *#06# 獲取 EID 碼。
              </span>
              <span className="block ml-2">2. 在下方列表中搜尋您的型號。</span>
              <span className="block ml-2">3. 若不確定，請諮詢製造商。</span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-slate-400 italic">
            註：部分地區型號（如中國大陸、中國香港舊版 iPhone）可能不支援 eSIM。
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="輸入設備型號 (例如：iPhone 14)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          {filteredDevices.length > 0 ? (
            filteredDevices.map((category, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(idx)}
                  className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-slate-800">
                    {category.category}
                  </span>
                  <span
                    className={`text-blue-500 font-bold text-xl transition-transform duration-200 ${openSections[idx] ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence>
                  {openSections[idx] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-50 border-t border-gray-100"
                    >
                      <ul className="p-4 space-y-2 text-sm text-slate-600">
                        {category.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              沒有找到符合 "{searchTerm}" 的裝置
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const DataEstimatorModal = ({ isOpen, onClose }) => {
  const [days, setDays] = useState(5);
  const [hours, setHours] = useState(
    CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {}),
  );
  const totalUsage = CATEGORIES.reduce(
    (acc, cat) => acc + days * hours[cat.id] * cat.rate,
    0,
  );

  const chartData = {
    labels: CATEGORIES.map((c) => c.label),
    datasets: [
      {
        data:
          totalUsage === 0
            ? [1]
            : CATEGORIES.map((c) => days * hours[c.id] * c.rate),
        backgroundColor:
          totalUsage === 0 ? ["#F1F5F9"] : CATEGORIES.map((c) => c.color),
        borderWidth: 2,
      },
    ],
  };

  const getRecommendation = () => {
    const dailyAvg = totalUsage / days;
    if (totalUsage > 20 || dailyAvg > 2)
      return { text: "無限流量 (吃到飽)", type: "unlimited" };
    if (totalUsage > 10) return { text: "總量 20GB 或 每日 2GB", type: "high" };
    return { text: "總量 10GB 或 每日 1GB", type: "normal" };
  };
  const recommendation = getRecommendation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="估算您的數據用量">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border flex items-center justify-between">
            <label className="font-bold text-slate-700">
              您的行程總共幾天？
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-8 h-8 rounded-full bg-white shadow font-bold text-blue-600 hover:bg-blue-50"
              >
                -
              </button>
              <span className="text-xl font-bold w-8 text-center">{days}</span>
              <button
                onClick={() => setDays(days + 1)}
                className="w-8 h-8 rounded-full bg-white shadow font-bold text-blue-600 hover:bg-blue-50"
              >
                +
              </button>
            </div>
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="pb-4 border-b border-slate-100 last:border-0"
            >
              <div className="flex justify-between mb-1">
                <span className="text-sm font-bold text-slate-700">
                  {cat.label}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {(days * hours[cat.id] * cat.rate).toFixed(2)} GB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={hours[cat.id]}
                onChange={(e) =>
                  setHours({ ...hours, [cat.id]: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          ))}
        </div>
        <div className="w-full lg:w-[320px] bg-white border border-slate-100 p-6 rounded-2xl shadow-xl flex flex-col">
          <h4 className="text-center text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
            預估總用量
          </h4>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <Doughnut
              data={chartData}
              options={{
                cutout: "75%",
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">
                {totalUsage.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-500">GB</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-center mb-4 border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">建議購買</p>
            <p className="font-bold text-slate-900 text-lg">
              {Math.ceil(totalUsage)} GB{" "}
              <span className="text-sm font-normal">以上方案</span>
            </p>
          </div>

          <div
            className={`rounded-xl p-4 text-center mb-4 border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95
              ${recommendation.type === "unlimited" ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200" : "bg-white border-gray-200"}`}
            onClick={onClose}
          >
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              系統推薦
            </span>
            <p className="font-black text-blue-900 text-lg">
              {recommendation.text}
            </p>
            <span className="text-xs text-blue-400">點擊去選購 ➔</span>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-auto bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            確認並返回
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ComparisonTable = () => (
  <div className="overflow-x-auto rounded-xl border shadow-sm my-8">
    <table className="w-full text-sm text-left border-collapse min-w-[700px]">
      <thead>
        <tr className="bg-[#147AD7] text-white">
          <th className="p-4 w-1/4">產品</th>
          <th className="p-4 w-1/6">運營商</th>
          <th className="p-4 w-1/6">最適合</th>
          <th className="p-4 w-5/12">優點與注意事項</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y">
        <tr>
          <td className="p-4 font-bold align-top">日本 eSIM AU (KDDI)</td>
          <td className="p-4 align-top">KDDI 單一網絡</td>
          <td className="p-4 align-top">串流愛好者、遊戲玩家</td>
          <td className="p-4 align-top text-xs leading-relaxed">
            <p>✅ 連接到本地 KDDI 網絡，日本 IP。</p>
            <p>✅ 享受無限高速 5G/4G 數據。</p>
            <p>ℹ️ 支援 TikTok, ChatGPT。</p>
          </td>
        </tr>
        <tr className="bg-slate-50">
          <td className="p-4 font-bold align-top">
            SoftBank / KDDI 雙網{" "}
            <span className="text-red-500 font-bold">HOT</span>
          </td>
          <td className="p-4 align-top">SoftBank / KDDI</td>
          <td className="p-4 align-top">多城市旅行者</td>
          <td className="p-4 align-top text-xs leading-relaxed">
            <p>✅ 覆蓋日本全境，雙網自動切換。</p>
            <p>❌ 無法訪問 TikTok / ChatGPT。</p>
          </td>
        </tr>
        <tr>
          <td className="p-4 font-bold align-top">IIJ NTT Docomo</td>
          <td className="p-4 align-top">Docomo</td>
          <td className="p-4 align-top">特定 APP 用戶</td>
          <td className="p-4 align-top text-xs leading-relaxed">
            <p>✅ 日本真實 IP，完整支援 TikTok。</p>
            <p>❌ 僅限 4G/LTE。</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

// ★★★ 修改處：ProductTabs 接收 selectedCarrier 參數，並動態渲染內容 ★★★
const ProductTabs = ({ product, selectedCarrier }) => {
  const [activeTab, setActiveTab] = useState("desc");
  const tabs = [
    { id: "desc", label: "產品介紹" },
    { id: "specs", label: "套餐參數" },
    { id: "install", label: "安裝/激活" },
  ];

  // 取得當前電信商的數據 (如果沒選，使用 SoftBank 或 Default)
  const safeCarrier = selectedCarrier || "SoftBank / KDDI";
  const specs =
    CARRIER_SPECS_DATA[safeCarrier] || CARRIER_SPECS_DATA["default"];
  const intro =
    CARRIER_INTRO_DATA[safeCarrier] || CARRIER_INTRO_DATA["default"];

  return (
    <div className="mt-16">
      <div className="flex justify-center border-b mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-[200px]">
        {activeTab === "desc" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              關於 {safeCarrier} 方案
            </h3>

            <div className="prose max-w-none mb-10 text-slate-600 space-y-2">
              {intro.bullets.map((point, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              哪款日本 eSIM 最適合您？
            </h4>
            <ComparisonTable />
          </motion.div>
        )}

        {/* ★★★ 參數 Tab：卡片式網格設計 ★★★ */}
        {activeTab === "specs" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-50 rounded-2xl p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              {specs.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${item.fullWidth ? "md:col-span-2" : ""}`}
                >
                  <span className="text-sm font-bold text-slate-900 mb-1">
                    {item.label}
                  </span>
                  <span className="text-sm text-slate-600 leading-relaxed">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "install" && (
          <div className="text-center py-10 text-gray-500">
            <h4 className="text-lg font-bold mb-4 text-slate-800">安裝步驟</h4>
            <p>1. 下單後檢查 Email 收取 QR Code。</p>
            <p>2. 前往手機「設定」 「行動服務」 「加入 eSIM」。</p>
            <p>3. 掃描 QR Code 並依照指示完成設定。</p>
            <p className="mt-4 text-xs bg-yellow-50 inline-block px-3 py-1 rounded text-yellow-700">
              建議：抵達目的地機場後再開啟 eSIM 漫遊功能。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Logic ---
export async function getStaticPaths() {
  try {
    const res = await fetch(getWooCommerceUrl("products", { per_page: 100 }));
    const products = await res.json();
    return {
      paths: products.map((p) => ({ params: { slug: p.slug } })),
      fallback: "blocking",
    };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      getWooCommerceUrl("products", { slug: params.slug }),
    );
    const data = await res.json();
    const product = data[0];
    let variations = [];
    if (product.type === "variable") {
      const varRes = await fetch(
        getWooCommerceUrl(`products/${product.id}/variations`, {
          per_page: 100,
        }),
      );
      if (varRes.ok) variations = await varRes.json();
    }
    return { props: { product, variations }, revalidate: 10 };
  } catch {
    return { notFound: true };
  }
}

// ==========================================
// ★★★ URL 參數轉換字典與輔助函式 ★★★
// ==========================================
const PARAM_MAP = {
  電信商: "carrier",
  天數: "days",
  數據: "data",
  "SoftBank / KDDI": "softbank",
  "AU(KDDI)": "au",
  "IIJ Docomo": "docomo",
  無限流量: "unlimited",
  無限流量10Mbps: "unlimited-10mbps",
  無限流量5Mbps: "unlimited-5mbps",
  "每天 500MB": "500mb-daily",
  "每天 1GB": "1gb-daily",
  "每天 2GB": "2gb-daily",
  "每天 3GB": "3gb-daily",
  "總計 12GB": "12gb-total",
  "總計 21GB": "21gb-total",
  "總計 30GB": "30gb-total",
};

// 產生反向對照表 (從英文找回中文)
const REVERSE_PARAM_MAP = Object.entries(PARAM_MAP).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {},
);

// 編碼：中文 -> 英文短網址
const encodeParam = (val) => {
  if (!val) return val;
  // 動態處理 "X天" 變成 "X"
  if (
    typeof val === "string" &&
    val.endsWith("天") &&
    !isNaN(val.replace("天", ""))
  ) {
    return val.replace("天", "");
  }
  return PARAM_MAP[val] || val;
};

// 解碼：英文短網址 -> 中文
const decodeParam = (val, attrName) => {
  if (!val) return val;
  // 動態處理 "X" 變回 "X天"
  if (attrName === "天數" && !isNaN(val)) {
    return `${val}天`;
  }
  return REVERSE_PARAM_MAP[val] || val;
};

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

  // 1. 初始化：從網址讀取參數並設定初始規格
  useEffect(() => {
    if (router.isReady && product?.type === "variable") {
      const initialAttributes = {};
      let hasUrlParams = false;

      product.attributes.forEach((attr) => {
        // 先取得網址中對應的「英文 Key」，如果沒有則嘗試原來的「中文 Key」做備用
        const encodedKey = encodeParam(attr.name);
        const urlValue = router.query[encodedKey] || router.query[attr.name];

        if (urlValue) {
          // 將網址裡的英文值轉換回中文
          const decodedValue = decodeParam(urlValue, attr.name);

          // 檢查這個轉換回來的值，是否真的存在於商品的選項中
          if (attr.options.includes(decodedValue)) {
            initialAttributes[attr.name] = decodedValue;
            hasUrlParams = true;
          }
        }
      });

      if (hasUrlParams) {
        setSelectedAttributes(initialAttributes);
      }
    }
  }, [router.isReady, product]);

  // 2. 匹配變體邏輯
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
        if (match && match.price) {
          setCurrentVariation(match);
          setDisplayPrice(match.price);
        } else {
          setCurrentVariation(null);
          setDisplayPrice(null);
        }
      } else {
        setCurrentVariation(null);
        setDisplayPrice(null);
      }
    }
  }, [selectedAttributes, product, variations]);

  // 3. 更新規格時，同步更新網址 (Shallow Routing)
  const handleAttributeSelect = (name, option) => {
    // 更新狀態
    const newAttributes = { ...selectedAttributes, [name]: option };
    setSelectedAttributes(newAttributes);

    // 準備要推送到 URL 的參數
    const queryParams = { slug: product.slug };
    Object.entries(newAttributes).forEach(([key, val]) => {
      const encodedKey = encodeParam(key);
      const encodedVal = encodeParam(val);
      queryParams[encodedKey] = encodedVal;
    });

    // 僅更新網址參數，不重新整理頁面
    router.push(
      {
        pathname: router.pathname,
        query: queryParams,
      },
      undefined,
      { shallow: true },
    );
  };

  const carrierName = selectedAttributes["電信商"] || "default";
  const currentData = selectedAttributes["數據"] || "";
  const currentDay = selectedAttributes["天數"] || "";

  const activeCarrierInfo =
    CARRIER_INFO_MAP[carrierName] ||
    CARRIER_INFO_MAP["SoftBank / KDDI"] ||
    CARRIER_INFO_MAP["default"];
  const marketingConfig = activeCarrierInfo.marketingBox;

  const specialRule = marketingConfig.specialRules?.[currentData];
  const displayPolicyDesc =
    specialRule?.policyDesc || marketingConfig.policyDesc;
  const displayNote = specialRule?.note || marketingConfig.note;

  const getAttributeBadge = (attrName, option) => {
    if (attrName === "電信商") {
      if (option.includes("SoftBank") || option.includes("AU")) {
        return (
          <span className="absolute -top-2.5 -right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full z-10 font-bold shadow-sm animate-pulse">
            HOT
          </span>
        );
      }
    }
    if (attrName === "數據" && option === "無限流量") {
      if (selectedAttributes["電信商"]?.includes("AU")) {
        return (
          <span className="absolute -top-3 -right-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] px-2 py-0.5 rounded-l-full rounded-tr-full z-10 font-bold shadow-sm transform scale-90">
            極速推薦
          </span>
        );
      }
    }
    return null;
  };

  const handleAddToCart = () => {
    if (product.type === "variable" && !currentVariation)
      return alert("請選擇有效規格");
    const final = currentVariation || product;
    addToCart({
      id: final.id,
      parentId: product.id,
      name: product.name,
      price: final.price,
      sku: final.sku,
      image: product.images?.[0]?.src,
      quantity,
      slug: product.slug,
    });
    window.dispatchEvent(new Event("open-cart-sidebar"));
  };

  if (router.isFallback || !product) return <Layout>載入中...</Layout>;

  const seoImage = product.images?.[0]?.src || "/default.jpg";
  const images = product.images?.length
    ? product.images
    : [{ src: seoImage, alt: product.name }];

  // ★★★ 產生供 SEO 使用的標準網址 (Canonical URL) ★★★
  // 請根據您實際的網域替換 https://www.fegoesim.com
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.fegoesim.com";
  const canonicalUrl = `${baseUrl}/product/${product?.slug}`;

  return (
    <Layout>
      <Head>
        <title>{product.name} | FeGo eSIM</title>
        <meta
          name="description"
          content={stripHtml(product.short_description || "")}
        />
        {/* ★★★ 加入 Canonical 標籤保護 SEO ★★★ */}
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <CompatibilityModal
        isOpen={isCompatOpen}
        onClose={() => setIsCompatOpen(false)}
      />
      <DataEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
      />

      <div className="max-w-6xl mx-auto pt-[120px] pb-20 px-4 bg-white">
        <div className="text-xs text-gray-400 mb-6">
          首頁 / 日本 eSIM / {product.name}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          <div className="w-full lg:w-3/5 flex flex-col gap-6">
            <div className="flex gap-4 items-stretch">
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
                  spaceBetween={10}
                  slidesPerView="auto"
                  modules={[FreeMode, Thumbs]}
                  className="w-full flex-1"
                >
                  {images.map((img, idx) => (
                    <SwiperSlide
                      key={idx}
                      className="!h-[80px] border rounded overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={img.src}
                        alt="thumb"
                        fill
                        className="object-cover"
                      />
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
              <div className="w-full relative bg-gray-50 overflow-hidden   aspect-[4/3]">
                <Swiper
                  onSwiper={setMainSwiper}
                  loop={true}
                  thumbs={{ swiper: thumbsSwiper }}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="w-full h-full"
                >
                  {images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="w-full h-full relative">
                        <Image
                          src={img.src}
                          alt="main"
                          fill
                          className="object-contain p-4"
                          priority
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            <div
              className={`p-5 rounded-xl border ${marketingConfig.bgColor} ${marketingConfig.borderColor} transition-colors duration-300`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold">
                  優惠
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {marketingConfig.couponText}
                </span>
              </div>
              <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4">
                <li>
                  <strong>{marketingConfig.policyTitle}</strong>{" "}
                  {displayPolicyDesc}
                </li>
                <li className="text-slate-500">
                  {displayNote}
                  {displayNote.includes("查看啟用政策") && (
                    <span className="ml-1 text-blue-500 underline cursor-pointer">
                      查看政策
                    </span>
                  )}
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {activeCarrierInfo.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium"
                >
                  {badge.type === "5G" ? "📶" : "📡"} {badge.text}
                  <span className="bg-gray-200 px-1 rounded text-[10px]">
                    {badge.type}
                  </span>
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <p
                className={`text-3xl font-bold ${displayPrice ? "text-cyan-500" : "text-gray-300"}`}
              >
                {displayPrice ? `NT$${displayPrice}` : "請選擇規格"}
              </p>
              <button
                onClick={() => setIsCompatOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
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
                檢查相容性
              </button>
            </div>

            {product.type === "variable" &&
              product.attributes.map((attr, index) => (
                <div key={attr.name || index} className="mb-6">
                  <span className="text-xs font-bold text-slate-900 block mb-2">
                    {attr.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAttributeSelect(attr.name, opt)}
                        className={`px-4 py-2 text-sm rounded-lg border transition-all relative overflow-visible
                        ${
                          selectedAttributes[attr.name] === opt
                            ? "border-cyan-500 text-cyan-600 bg-cyan-50 font-bold shadow-sm"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                        }`}
                      >
                        {opt}
                        {getAttributeBadge(attr.name, opt)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            <div className="border-t border-gray-100 my-4 pt-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    {activeCarrierInfo.summaryPrefix}
                  </div>
                  <div className="font-bold text-slate-800">
                    {currentDay ? `${currentDay}天` : ""}{" "}
                    {currentData ? `· ${currentData}` : ""}
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  Total: ${displayPrice || 0}
                </div>
              </div>

              <div className="flex gap-3 h-[50px]">
                <div className="flex items-center border rounded-lg px-3 w-[100px] justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-400 hover:text-black"
                  >
                    -
                  </button>
                  <span className="font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-400 hover:text-black"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!displayPrice}
                  className={`flex-1 font-bold rounded-lg transition-all shadow-lg shadow-cyan-100 
                        ${!displayPrice ? "bg-gray-200 text-gray-400" : "bg-[#147AD7] text-white hover:bg-slate-800"}`}
                >
                  {displayPrice ? "加入購物車" : "請選擇規格"}
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsEstimatorOpen(true)}
              className="w-full mt-3 py-3 border border-gray-200 text-gray-500 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              📊 估算我的數據用量
            </button>
          </div>
        </div>

        <ProductTabs product={product} selectedCarrier={carrierName} />
      </div>
    </Layout>
  );
}
