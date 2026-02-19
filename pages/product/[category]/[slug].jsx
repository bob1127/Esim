import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useCart } from "../../../components/context/CartContext";
import Layout from "../../Layout";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

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
      policyDesc: "本方案為原生日網，支援多數日本限定服務。",
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
    {
      label: "訊號覆蓋範圍",
      value: "東京、京都、廣島、關東、長崎、大阪等日本各城市及旅遊目的地。",
    },
    { label: "電信業者", value: "KDDI 5G" },
    { label: "速度", value: "4G / LTE / 5G" },
    { label: "方案類型", value: "僅數據流量" },
    { label: "網路共用／熱點功能", value: "支持" },
    { label: "電話號碼", value: "無" },
    { label: "通話", value: "不支持，只能透過應用程式（網路通話，即 VoIP）。" },
    { label: "簡訊", value: "無" },
    { label: "eKYC (身分驗證)", value: "不需要" },
    {
      label: "交付",
      value: "eSIM 的 QR 碼會在付款完成後的幾分鐘內透過電子郵件發送給您。",
    },
    { label: "數據路由", value: "本地" },
    { label: "充值選項", value: "無" },
    {
      label: "效期政策",
      value:
        "一旦 eSIM 連接到支援的網路並開始產生數據訪問互聯網，有效期限即開始。我們建議您在到達目的地後添加 eSIM。您也可以提前安裝 eSIM，但請記得安裝後立即將其關閉，以避免有效期提前開始。",
      fullWidth: true,
    },
    {
      label: "其他資訊",
      fullWidth: true,
      isHtml: true,
      value: `
        <div class="space-y-4">
          <p>⚠️ <strong>重要:</strong> 一旦刪除，此eSIM無法重新安裝。</p>
          <p>📅 <strong>服務天數:</strong> 以日本時間（UTC +9）計算，從啟動日開始。</p>
          <div>
            <p class="font-bold mb-2">APN設置:</p>
            <p class="mb-2">大多數情況下，APN會自動設置。如果需要手動配置，請按照以下步驟操作：</p>
            <div class="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700">
              APN: uad5gn.au-net.ne.jp<br/>
              用戶名: au@uad5gn.au-net.ne.jp<br/>
              密碼: au<br/>
              身份驗證類型: CHAP
            </div>
            <p class="my-2">或者</p>
            <div class="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700">
              APN: au.5g.au-net.ne.jp<br/>
              用戶名: user@au.5g.au-net.ne.jp<br/>
              密碼: au<br/>
              身份驗證類型: CHAP
            </div>
            <p class="my-2">如果在應用上述設置後仍無法連接數據，請嘗試以下4G專用APN：</p>
            <div class="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700">
              APN: uno.au-net.ne.jp<br/>
              用戶名: 685840734641020@uno.au-net.ne.jp<br/>
              密碼: KpyrR6BP<br/>
              身份驗證類型: CHAP
            </div>
          </div>
          <div class="text-xs text-gray-500 pt-4 border-t border-gray-200 leading-relaxed">
            這個eSIM由當地運營商提供，MicroEsim 作為授權經銷商進行銷售。購買後，該方案是不可取消且不可退款。發行運營商保留在不通知的情況下修改套餐細節的權利，MicroEsim 可能無法及時通知客戶這些變更。感謝您的理解。
          </div>
        </div>
      `,
    },
  ],
  "IIJ Docomo": [
    {
      label: "訊號覆蓋範圍",
      value: "東京、京都、廣島、關東、長崎、大阪等日本各城市及旅遊目的地。",
    },
    { label: "電信業者", value: "IIJ(Docomo) LTE" },
    { label: "速度", value: "4G / LTE" },
    { label: "方案類型", value: "僅數據流量" },
    { label: "網路共用／熱點功能", value: "支持" },
    { label: "電話號碼", value: "無" },
    { label: "通話", value: "不支持，只能透過應用程式（網路通話，即 VoIP）。" },
    { label: "簡訊", value: "無" },
    { label: "eKYC (身分驗證)", value: "不需要" },
    {
      label: "交付",
      value: "eSIM 的 QR 碼會在付款完成後的幾分鐘內透過電子郵件發送給您。",
    },
    { label: "數據路由", value: "本地" },
    { label: "充值選項", value: "無" },
    {
      label: "效期政策",
      value:
        "有效期於eSIM下載到您的裝置後立即開始計算。請在準備好使用時再安裝eSIM。",
      fullWidth: true,
    },
    {
      label: "其他資訊",
      value: `Manually set the APN as "vmobile.jp" to access the internet in Japan.`,
      fullWidth: true,
      isHtml: true,
    },
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
    customContent: (
      <div className="space-y-6 text-slate-700 leading-relaxed">
        <p>
          <strong>本方案由日本主要電信商 au（KDDI）提供</strong>
        </p>
        <p>
          作為日本領先的電信運營商之一，日本 KDDI 的 eSIM
          解決方案特別適合經常前往日本的旅客或短期訪客。包含多種規格可選：
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 my-6 shadow-sm">
          <table className="w-full text-sm text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="p-4 font-bold text-slate-800">方案</th>
                <th className="p-4 font-bold text-slate-800">描述</th>
                <th className="p-4 font-bold text-slate-800">熱點分享</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <tr>
                <td className="p-4 font-bold text-blue-600 whitespace-nowrap">
                  總計 XX GB
                </td>
                <td className="p-4">
                  固定高速數據量，直到數據用完前沒有速度限制。
                </td>
                <td className="p-4">
                  熱點分享將消耗您分配的總GB數據量，沒有其他限制。
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-600 whitespace-nowrap">
                  無限流量10Mbps
                </td>
                <td className="p-4">以10Mbps速度提供無限數據。</td>
                <td
                  className="p-4 align-top border-l border-gray-100 bg-slate-50/50"
                  rowSpan={2}
                >
                  熱點分享可使用的總 GB 數，依所選天數計算，公式為
                  <strong>「天數 - 1」GB</strong>。<br />
                  <br />
                  例如，7 天方案可分享 6 GB。
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-600 whitespace-nowrap">
                  無限流量
                </td>
                <td className="p-4">真正的無限高速數據</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-5">
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
            <li>
              例如，如果您購買了7天的 <strong>[無限流量]</strong> 或{" "}
              <strong>[無限流量10Mbps]</strong> 方案，可供分享的熱點數據為 7天 -
              1 = <strong>6GB</strong>。
            </li>
            <li>
              對於 <strong>[總計 XX GB]</strong>{" "}
              方案，熱點分享沒有限制，您可以根據購買的總數據量自由使用熱點數據，直到用完為止。
            </li>
          </ul>
        </div>

        <p>
          您可以根據自己的需求選擇最適合的方案，所有方案都以實惠的價格提供。
        </p>

        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-4">
          <p>
            遊客只需掃描 QR Code 即可輕鬆啟動日本
            eSIM，並享受高品質的語音和數據服務。此方案直接連接到 KDDI
            的本地訊號塔，確保低延遲。下載 ping 低至 <strong>僅 40ms</strong>
            ，這是一個優異的分數。在 5G 模式下，您還可以體驗高達{" "}
            <strong>500Mbps</strong> 的下載速度。
          </p>
          <p>
            使用日本 eSIM 遊覽日本 13
            個最值得一遊的地方。在整個旅程中保持訊號暢通，不用擔心拍下的美照無法發送到社群媒體或與朋友分享。
          </p>
          <p className="font-bold text-blue-700">
            ✅ 此日本 eSIM 方案支援
            Google、YouTube、Facebook、Instagram、ChatGPT 和 TikTok 等應用程式。
          </p>
        </div>

        <p>
          儘管 5G 覆蓋範圍可能因地而異，但此 eSIM 在日本全境提供可靠的 4G/LTE
          服務。在東京、大阪和京都等主要城市，您將獲得出色的 5G
          速度。如果您在多個城市旅行並想要最穩定、最無縫的網路，我們推薦我們的雙網路日本
          eSIM 5G SoftBank / KDDI。有了它，您可以在 Softbank 和 KDDI
          網路之間切換，以找到最佳訊號。
        </p>
        <p>
          作為日本領先的電信運營商之一，日本 KDDI 的 eSIM
          解決方案特別適合經常前往日本的旅客或短期訪客。
        </p>
        <p>
          遊客只需掃描 QR Code 即可輕鬆啟動日本
          eSIM，並享受高品質的語音和數據服務。
        </p>
      </div>
    ),
  },
  "IIJ Docomo": {
    customContent: (
      <div className="space-y-5 text-slate-700 leading-relaxed">
        <p>
          隆重介紹日本 Docomo eSIM，您在日本輕鬆連結的終極旅伴。此 eSIM 是純數據
          eSIM，具有日本本地 IP 位址，讓您無需設定漫遊即可保持連線。憑藉 Docomo
          提供的超低延遲和可靠的覆蓋範圍，您可以在整個旅程中享受無縫的高速網路存取。多種預付費
          eSIM
          數據套餐可供選擇，無論您探索東京繁華的街道、在社交媒體上分享您的旅行冒險，還是與家人和朋友保持聯繫，日本Docomo
          eSIM 都提供便利和便利，讓您隨時保持連結。
        </p>

        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-sm text-orange-800">
          <p>
            <strong>*注意：</strong>此日本eSIM IIJ NTT
            Docomo套餐需要手動設定APN。您也可以考慮其他日本eSIM。
          </p>
        </div>

        <p>
          此eSIM將在安裝後啟動（開始計算使用有效期），僅限於日本使用。請在安裝有效期內安裝，並在準備使用時進行安裝，因為使用天數將從安裝時開始計算。
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
          <p>
            <strong>注意：</strong>
            根據電信業者，無限流量方案在正常使用下沒有流量限制。然而，有部分客戶反映在高用量情況下可能會被限速，通常約每天10GB左右。每日使用量會重置，以自動解除任何限速。感謝您的理解。
          </p>
        </div>
      </div>
    ),
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
            className={`rounded-xl p-4 text-center mb-4 border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${recommendation.type === "unlimited" ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200" : "bg-white border-gray-200"}`}
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
        <tr className="bg-slate-900 text-white">
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
              <span className="text-3xl">🇯🇵</span>關於 {safeCarrier} 方案
            </h3>
            <div className="mb-10">
              {intro.bullets && intro.bullets.length > 0 && (
                <div className="prose max-w-none text-slate-600 space-y-2">
                  {intro.bullets.map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
              {intro.customContent && intro.customContent}
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>🔍</span> 哪款日本 eSIM 最適合您？
            </h4>
            <ComparisonTable />
          </motion.div>
        )}
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
                  {item.isHtml ? (
                    <div
                      className="text-sm text-slate-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.value }}
                    />
                  ) : (
                    <span className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {item.value}
                    </span>
                  )}
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

// ★★★ 修正點：在這裡將 category 也加入到 params 中 ★★★
export async function getStaticPaths() {
  try {
    const res = await fetch(getWooCommerceUrl("products", { per_page: 100 }));
    const products = await res.json();
    return {
      paths: products.map((p) => {
        // 如果商品有分類，就取第一個分類的 slug，否則給預設值 'uncategorized'
        const categorySlug =
          p.categories && p.categories.length > 0
            ? p.categories[0].slug
            : "uncategorized";

        return {
          params: {
            category: categorySlug, // 解決 "A required parameter (category) was not provided" 的關鍵
            slug: p.slug,
          },
        };
      }),
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

const REVERSE_PARAM_MAP = Object.entries(PARAM_MAP).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {},
);

const encodeParam = (val) => {
  if (!val) return val;
  if (
    typeof val === "string" &&
    val.endsWith("天") &&
    !isNaN(val.replace("天", ""))
  ) {
    return val.replace("天", "");
  }
  return PARAM_MAP[val] || val;
};

const decodeParam = (val, attrName) => {
  if (!val) return val;
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
        const encodedKey = encodeParam(attr.name);
        const urlValue = router.query[encodedKey] || router.query[attr.name];

        if (urlValue) {
          const decodedValue = decodeParam(urlValue, attr.name);
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

  // ★★★ 提取並處理從 functions.php 存入的自訂標籤資料 ★★★
  const customTagsMeta = currentVariation?.meta_data?.find(
    (meta) => meta.key === "_custom_tags",
  );
  const customTagsString = customTagsMeta ? customTagsMeta.value : "";
  const customTagsArray = customTagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  // 動態過濾有效選項
  const getAvailableOptions = (attrName, attrIndex) => {
    if (!variations || variations.length === 0)
      return product.attributes[attrIndex].options;

    const optionsSet = new Set();

    variations.forEach((v) => {
      let matchesHigher = true;

      for (let i = 0; i < attrIndex; i++) {
        const higherAttrName = product.attributes[i].name;
        const selectedValue = selectedAttributes[higherAttrName];

        if (selectedValue) {
          const vAttr = v.attributes.find((a) => a.name === higherAttrName);
          if (vAttr && vAttr.option !== "" && vAttr.option !== selectedValue) {
            matchesHigher = false;
            break;
          }
        }
      }

      if (matchesHigher) {
        const thisAttr = v.attributes.find((a) => a.name === attrName);
        if (thisAttr && thisAttr.option && thisAttr.option !== "") {
          optionsSet.add(thisAttr.option);
        } else {
          product.attributes[attrIndex].options.forEach((opt) =>
            optionsSet.add(opt),
          );
        }
      }
    });

    return Array.from(optionsSet);
  };

  const handleAttributeSelect = (name, option) => {
    const attrIndex = product.attributes.findIndex((a) => a.name === name);

    const newAttributes = {};
    product.attributes.forEach((attr, idx) => {
      if (idx < attrIndex) {
        if (selectedAttributes[attr.name]) {
          newAttributes[attr.name] = selectedAttributes[attr.name];
        }
      } else if (idx === attrIndex) {
        newAttributes[attr.name] = option;
      }
    });

    setSelectedAttributes(newAttributes);

    // ★★★ 注意：這裡也要保留 category 參數，才能讓網址正確切換 ★★★
    const queryParams = {
      category: router.query.category, // 保留當前網址的目錄
      slug: product.slug,
    };

    Object.entries(newAttributes).forEach(([key, val]) => {
      if (val) queryParams[encodeParam(key)] = encodeParam(val);
    });

    router.push({ pathname: router.pathname, query: queryParams }, undefined, {
      shallow: true,
    });
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

      <div className="max-w-6xl mx-auto py-10 px-4 bg-white">
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
              <div className="w-full relative bg-gray-50 rounded-2xl overflow-hidden border aspect-[3/4]">
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
              <div className="flex items-center gap-2 ">
                <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold">
                  優惠
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {marketingConfig.couponText}
                </span>
              </div>
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
              product.attributes.map((attr, index) => {
                const availableOptions = getAvailableOptions(attr.name, index);

                if (availableOptions.length === 0) return null;

                return (
                  <div key={attr.name || index} className="mb-6">
                    <span className="text-xs font-bold text-slate-900 block mb-2">
                      {attr.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((opt) => {
                        if (!availableOptions.includes(opt)) return null;

                        return (
                          <button
                            key={opt}
                            onClick={() =>
                              handleAttributeSelect(attr.name, opt)
                            }
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
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            <div className="border-t border-gray-100 my-4 pt-4">
              {/* ★★★ 動態顯示後台填寫的「變體專屬標籤」 ★★★ */}
              {customTagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {customTagsArray.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {currentVariation?.description && (
                <div className="mb-4 bg-[#147AD7] border border-orange-100 p-4 rounded-xl shadow-sm">
                  <div
                    className="text-sm text-white leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: currentVariation.description,
                    }}
                  />
                </div>
              )}

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
                  className={`flex-1 font-bold rounded-lg transition-all shadow-lg shadow-cyan-100 ${!displayPrice ? "bg-gray-200 text-gray-400" : "bg-slate-900 text-white hover:bg-slate-800"}`}
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
