// pages/esim-selection.tsx
import React, { useState, useEffect, useMemo } from "react";

// --- 國家設定檔 (擴充自您的篩選邏輯) ---
const COUNTRIES: Record<string, any> = {
  JP: {
    emoji: "🇯🇵",
    name: "日本",
    codes: ["JP"],
    keywords: ["Japan", "Osaka", "Tokyo"],
    nativeKeywords: ["vmobile.jp", "iij", "docomo", "softbank", "kddi"],
  },
  KR: {
    emoji: "🇰🇷",
    name: "韓國",
    codes: ["KR"],
    keywords: ["Korea", "Seoul"],
    nativeKeywords: ["sk telecom", "skt", "kt", "lgu+", "lg u+"],
  },
  TH: {
    emoji: "🇹🇭",
    name: "泰國",
    codes: ["TH"],
    keywords: ["Thailand", "Bangkok"],
    nativeKeywords: ["ais", "dtac", "true", "truemove"],
  },
  CN: {
    emoji: "🇨🇳",
    name: "中國",
    codes: ["CN"],
    keywords: ["China"],
    nativeKeywords: ["china unicom", "china mobile", "china telecom"],
  },
  HK: {
    emoji: "🇭🇰",
    name: "香港",
    codes: ["HK"],
    keywords: ["Hong Kong", "HK"],
    nativeKeywords: ["csl", "smartone", "3hk", "china mobile hk", "cmhk"],
  },
  VN: {
    emoji: "🇻🇳",
    name: "越南",
    codes: ["VN"],
    keywords: ["Vietnam"],
    nativeKeywords: ["viettel", "vinaphone", "mobifone"],
  },
  MY: {
    emoji: "🇲🇾",
    name: "馬來西亞",
    codes: ["MY"],
    keywords: ["Malaysia"],
    nativeKeywords: ["celcom", "maxis", "digi", "umobile"],
  },
};

// --- 匯率設定 ---
const RATES = {
  USD: 33.0,
  HKD: 4.5, // 港幣轉台幣
};

export default function GlobalPlanScanner() {
  const [rawPlans, setRawPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // --- 篩選條件 ---
  const [selectedCountry, setSelectedCountry] = useState("JP");
  const [filterIP, setFilterIP] = useState("ALL"); // ALL, NATIVE, ROAMING
  const [filterDay, setFilterDay] = useState("ALL");
  const [filterData, setFilterData] = useState("ALL"); // DAILY, TOTAL, UNLIMITED
  const [filterApp, setFilterApp] = useState("ALL"); // ALL, GPT_TIKTOK
  const [filterUnthrottled, setFilterUnthrottled] = useState(false); // 是否僅顯示不降速
  const [sortBy, setSortBy] = useState("PRICE_ASC");
  const [displayCount, setDisplayCount] = useState(50); // 分頁顯示數量

  // 1. 初始載入 API
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/esim/test-list"); // 使用正式帳號 API
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setRawPlans(data.result || []);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  // 2. 資料清洗與標籤化 (針對 12,000 筆資料的高效處理)
  const processedPlans = useMemo(() => {
    if (rawPlans.length === 0) return [];

    const config = COUNTRIES[selectedCountry] || {
      codes: [selectedCountry],
      keywords: [selectedCountry],
      nativeKeywords: [],
    };

    return rawPlans
      .filter((p) => {
        const name = (p.name || "").toLowerCase();
        const code = (p.code || "").toUpperCase();
        return (
          config.codes.includes(code) ||
          config.keywords.some((k: string) => name.includes(k.toLowerCase()))
        );
      })
      .map((p) => {
        const name = (p.name || "").toLowerCase();
        const apn = (p.apn || "").toLowerCase();
        const rule = (p.rule_desc || "").toLowerCase();
        const tags = p.tags || [];

        // 💰 價格換算
        const rawPrice = parseFloat(p.price || 0);
        let costTWD = 0;
        if (rawPrice > 0 && rawPrice < 20) {
          costTWD = Math.ceil(rawPrice * RATES.USD);
        } else {
          costTWD = Math.ceil(rawPrice * RATES.HKD);
        }

        // 🏷️ 特性判斷
        const isNative = config.nativeKeywords.some(
          (k: string) => apn.includes(k) || name.includes(k),
        );
        const isDaily = name.includes("daily") || name.includes("天");
        const isTotal = name.includes("total") || name.includes("總量");
        const isUnlimited =
          name.includes("unlimited") ||
          rule.includes("unlimited") ||
          rule.includes("吃到飽");

        // ⚡ 不降速判斷：包含吃到飽關鍵字且不包含降速速率
        const isUnthrottled =
          isUnlimited && !rule.includes("kbps") && !name.includes("kbps");

        // 📱 App 支援度 (依照您的邏輯：中國地區原生線路通常不支援)
        let supportChatGPT = true;
        let supportTikTok = true;
        if (selectedCountry === "CN") {
          supportChatGPT = !isNative;
          supportTikTok = !isNative;
        } else {
          // 其他國家優先看標籤，沒標籤預設支援
          if (tags.length > 0) {
            supportChatGPT = tags.includes("ChatGPT✅");
            supportTikTok = tags.includes("TikTok✅");
          }
        }

        const suggestedPrice =
          Math.ceil((costTWD * (isNative ? 1.8 : 1.5)) / 10) * 10 - 1;

        return {
          ...p,
          costTWD,
          suggestedPrice,
          isNative,
          isDaily,
          isTotal,
          isUnlimited,
          isUnthrottled,
          supportChatGPT,
          supportTikTok,
          typeLabel: isNative ? `🔴 ${config.name}原生` : "🔵 漫遊線路",
          typeClass: isNative
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800",
        };
      });
  }, [rawPlans, selectedCountry]);

  // 3. 多維度篩選與排序
  const filteredPlans = useMemo(() => {
    let result = processedPlans;

    if (filterIP === "NATIVE") result = result.filter((p) => p.isNative);
    if (filterIP === "ROAMING") result = result.filter((p) => !p.isNative);

    if (filterDay === "SHORT") result = result.filter((p) => p.day <= 5);
    if (filterDay === "MID")
      result = result.filter((p) => p.day > 5 && p.day <= 10);
    if (filterDay === "LONG") result = result.filter((p) => p.day > 10);

    if (filterData === "DAILY") result = result.filter((p) => p.isDaily);
    if (filterData === "TOTAL") result = result.filter((p) => p.isTotal);
    if (filterData === "UNLIMITED")
      result = result.filter((p) => p.isUnlimited);

    if (filterUnthrottled) result = result.filter((p) => p.isUnthrottled);
    if (filterApp === "GPT_TIKTOK")
      result = result.filter((p) => p.supportChatGPT && p.supportTikTok);

    result.sort((a, b) => {
      if (sortBy === "PRICE_ASC") return a.costTWD - b.costTWD;
      if (sortBy === "DAY_ASC") return a.day - b.day;
      return 0;
    });

    return result;
  }, [
    processedPlans,
    filterIP,
    filterDay,
    filterData,
    filterApp,
    filterUnthrottled,
    sortBy,
  ]);

  if (loading)
    return (
      <div className="p-10 text-center font-bold">
        正在掃描全球 12,000+ 方案...
      </div>
    );
  if (errorMsg)
    return <div className="p-10 text-red-600">連線失敗：{errorMsg}</div>;

  const currentConfig = COUNTRIES[selectedCountry] || {
    emoji: "🌐",
    name: selectedCountry,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>{currentConfig.emoji}</span>
            <span>{currentConfig.name}方案選品神器 PRO</span>
          </div>
          <div className="text-sm font-normal text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border">
            庫存總計: {rawPlans.length.toLocaleString()} | 當前符合:{" "}
            {filteredPlans.length} 筆
          </div>
        </h1>

        {/* --- 國家切換 --- */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {Object.entries(COUNTRIES).map(([key, config]: [string, any]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedCountry(key);
                setDisplayCount(50);
              }}
              className={`flex-shrink-0 px-5 py-2 rounded-full font-bold transition-all ${
                selectedCountry === key
                  ? "bg-black text-white shadow-lg"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
            >
              {config.emoji} {config.name}
            </button>
          ))}
        </div>

        {/* --- 頂部篩選控制區 --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
              線路類型
            </label>
            <select
              value={filterIP}
              onChange={(e) => setFilterIP(e.target.value)}
              className="w-full border rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 ring-blue-500"
            >
              <option value="ALL">全部顯示</option>
              <option value="NATIVE">原生線路 (Native)</option>
              <option value="ROAMING">漫遊線路 (Roaming)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
              旅遊天數
            </label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full border rounded-xl p-2.5 bg-gray-50 outline-none"
            >
              <option value="ALL">全部</option>
              <option value="SHORT">1-5天</option>
              <option value="MID">6-10天</option>
              <option value="LONG">11天以上</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
              流量/不降速
            </label>
            <select
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="w-full border rounded-xl p-2.5 bg-gray-50 outline-none"
            >
              <option value="ALL">所有規格</option>
              <option value="UNLIMITED">真吃到飽/不限速</option>
              <option value="DAILY">每天定量</option>
              <option value="TOTAL">總量型</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
              App 支援度
            </label>
            <select
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              className="w-full border rounded-xl p-2.5 bg-gray-50 outline-none"
            >
              <option value="ALL">不限</option>
              <option value="GPT_TIKTOK">GPT + TikTok ✅</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer bg-amber-50 p-2.5 rounded-xl border border-amber-200 w-full justify-center">
              <input
                type="checkbox"
                checked={filterUnthrottled}
                onChange={(e) => setFilterUnthrottled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-bold text-amber-800">
                ⚡️ 僅看真吃到飽
              </span>
            </label>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
              排序
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded-xl p-2.5 bg-gray-50 outline-none"
            >
              <option value="PRICE_ASC">💰 價格 (低-高)</option>
              <option value="DAY_ASC">📅 天數 (短-長)</option>
            </select>
          </div>
        </div>

        {/* --- 方案清單表格 --- */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase">
                <tr>
                  <th className="p-4 border-b">類型 / ID</th>
                  <th className="p-4 border-b">天數</th>
                  <th className="p-4 border-b">方案名稱與規則</th>
                  <th className="p-4 border-b text-center">App 支援</th>
                  <th className="p-4 border-b text-right">成本 (TWD)</th>
                  <th className="p-4 border-b text-right text-blue-600">
                    建議售價
                  </th>
                  <th className="p-4 border-b text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlans.slice(0, displayCount).map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[10px] font-black mb-1 ${p.typeClass}`}
                      >
                        {p.typeLabel}
                      </span>
                      <div className="text-[10px] text-gray-300 font-mono">
                        {p.id}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xl font-black text-gray-900">
                        {p.day}
                        <span className="text-xs font-normal text-gray-400 ml-1">
                          天
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 mb-1">
                        {p.data || p.name}
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-1 mb-2 italic">
                        {p.rule_desc}
                      </div>
                      <div className="flex gap-2">
                        {p.isUnthrottled && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                            ⚡️ 不降速
                          </span>
                        )}
                        {p.isUnlimited && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                            ♾️ 吃到飽
                          </span>
                        )}
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          APN: {p.apn || "auto"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-[10px] font-bold ${p.supportChatGPT ? "text-green-600" : "text-gray-300"}`}
                        >
                          {p.supportChatGPT ? "✅ ChatGPT" : "❌ ChatGPT"}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${p.supportTikTok ? "text-green-600" : "text-gray-300"}`}
                        >
                          {p.supportTikTok ? "✅ TikTok" : "❌ TikTok"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-gray-600">
                        ${p.costTWD}
                      </div>
                      <div className="text-[9px] text-gray-300">
                        {p.price} {p.rawPrice < 20 ? "USD" : "HKD"}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-2xl font-black text-blue-600">
                        ${p.suggestedPrice}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(p.id);
                          alert("已複製 ID");
                        }}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all shadow-sm active:scale-95"
                      >
                        📋
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPlans.length > displayCount && (
            <div className="p-6 bg-gray-50 text-center">
              <button
                onClick={() => setDisplayCount((c) => c + 50)}
                className="bg-white border-2 border-black text-black px-8 py-2 rounded-xl font-bold hover:bg-black hover:text-white transition-all"
              >
                載入更多符合條件的方案
              </button>
            </div>
          )}

          {filteredPlans.length === 0 && (
            <div className="p-20 text-center text-gray-300 flex flex-col items-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="font-bold">
                找不到符合條件的方案，請嘗試放寬篩選條件
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
