import React, { useState, useEffect, useMemo } from "react";

// --- 1. 國家設定檔 ---
const COUNTRIES: Record<string, any> = {
  JP: {
    emoji: "🇯🇵",
    name: "日本",
    codes: ["JP", "JPN", "JAPAN"],
    keywords: [
      "Japan",
      "Osaka",
      "Tokyo",
      "Kyoto",
      "日本",
      "SoftBank",
      "Docomo",
    ],
    nativeKeywords: ["iij", "docomo"],
    nativeApns: ["vmobile.jp", "ppsim.jp", "m-air.jp", "so-net.jp", "plus.4g"],
  },
  KR: {
    emoji: "🇰🇷",
    name: "韓國",
    codes: ["KR", "KOR", "KOREA"],
    keywords: ["Korea", "Seoul", "Jeju", "韓國"],
    nativeKeywords: ["skt", "kt", "lgu"],
    nativeApns: ["lte.sktelecom.com", "alwayson.kt.com"],
  },
  TH: {
    emoji: "🇹🇭",
    name: "泰國",
    codes: ["TH", "THA", "THAILAND"],
    keywords: ["Thailand", "Bangkok", "Phuket", "泰國"],
    nativeKeywords: ["ais", "dtac", "true"],
    nativeApns: ["internet"],
  },
  CN: {
    emoji: "🇨🇳",
    name: "中國",
    codes: ["CN", "CHN", "CHINA"],
    keywords: ["China", "Shanghai", "Beijing", "中國"],
    nativeKeywords: [],
    nativeApns: ["cmnet", "3gnet"],
  },
  HK: {
    emoji: "🇭🇰",
    name: "香港",
    codes: ["HK", "HKG", "HONG KONG"],
    keywords: ["Hong Kong", "HK", "香港"],
    nativeKeywords: ["csl", "smartone", "3hk", "cmhk"],
    nativeApns: ["mobile.three.com.hk", "hkcsl", "smartone"],
  },
};

const RATES = { USD: 33.0, HKD: 4.5 };

// --- 2. 輔助函式：將技術名稱翻譯成「白話文」 ---
const getSimpleDesc = (name: string, day: number) => {
  const n = name.toLowerCase();
  let dataPart = "規格詳見內容";

  // 判斷邏輯：抓取關鍵字與數字
  if (n.includes("total")) {
    // 抓取 Total 後面的數字 (e.g., Total10GB, Total 3GB)
    const match = n.match(/total\s*(\d+\.?\d*[g|m]b)/);
    if (match) {
      dataPart = `總量 ${match[1].toUpperCase()}`;
    } else {
      dataPart = "總量型";
    }
  } else if (n.includes("daily") || n.includes("day")) {
    // 抓取 Daily 後面的數字 (e.g., Daily1GB)
    const match = n.match(/daily\s*(\d+\.?\d*[g|m]b)/);
    if (match) {
      dataPart = `每日 ${match[1].toUpperCase()}`;
    } else {
      dataPart = "每日定量";
    }
  } else if (n.includes("unlimited")) {
    dataPart = "吃到飽";
  }

  return `${dataPart} · ${day}天`;
};

// --- 3. 核心解析邏輯 (電信商/原生/App支援) ---
const parsePlanDetails = (
  p: any,
  countryConfig: any,
  targetCountryCode: string,
) => {
  const name = (p.name || "").toLowerCase();
  const desc = (p.rule_desc || "").toLowerCase();
  const apn = (p.apn || "").toLowerCase().trim();

  // --- A. 判斷原生 (Native) vs 漫遊 ---
  let isNative = false;
  if (
    countryConfig?.nativeApns?.some(
      (key: string) => apn === key || apn.includes(key),
    )
  ) {
    isNative = true;
  } else if (
    countryConfig?.nativeKeywords?.some((key: string) => name.includes(key))
  ) {
    isNative = true;
  }
  const roamingApns = [
    "3gnet",
    "globaldata",
    "cuniq",
    "cmhk",
    "mobile.three.com.hk",
    "plus.4g",
    "internet",
    "ctm-mobile",
  ];
  if (!isNative && roamingApns.some((key) => apn === key)) {
    isNative = false;
  }

  // --- B. 解析電信商 (Carrier) ---
  let carrier = "自動切換 (Auto)";

  // 1. 雙網/特殊方案判斷 (最優先)
  if (
    (name.includes("softbank") &&
      (name.includes("kddi") || name.includes("au"))) ||
    (desc.includes("softbank") &&
      (desc.includes("kddi") || desc.includes("au")))
  ) {
    carrier = "📶 SoftBank / KDDI (雙網)";
  } else if (
    name.includes("docomo") &&
    (name.includes("kddi") || name.includes("au"))
  ) {
    carrier = "📶 Docomo / KDDI (雙網)";
  } else if (
    apn.includes("vmobile.jp") ||
    (name.includes("docomo") && isNative)
  ) {
    carrier = "🇯🇵 Docomo (附日本 IP)"; // IIJ 方案
  } else if (name.includes("kddi") && !name.includes("softbank")) {
    carrier = "🇯🇵 KDDI 單網 (含5G)";
  }

  // 2. APN 反推
  else if (apn.includes("lte.sktelecom.com")) carrier = "🇰🇷 SK Telecom (原生)";
  else if (apn.includes("alwayson.kt.com")) carrier = "🇰🇷 KT Olleh (原生)";
  else if (apn.includes("mobile.three.com.hk")) carrier = "📶 3HK 漫遊 (雙網)";
  else if (apn.includes("3gnet")) carrier = "中國聯通 (漫遊)";
  // 3. 單一名稱判斷
  else if (name.includes("docomo")) carrier = "🇯🇵 NTT Docomo";
  else if (name.includes("softbank")) carrier = "📶 SoftBank";
  else if (name.includes("kddi") || name.includes("au"))
    carrier = "🇯🇵 KDDI (au)";
  else if (name.includes("skt")) carrier = "🇰🇷 SK Telecom";
  else if (name.includes("kt") || name.includes("olleh"))
    carrier = "🇰🇷 KT (Olleh)";
  else if (name.includes("ais")) carrier = "🇹🇭 AIS";
  else if (name.includes("dtac")) carrier = "🇹🇭 DTAC";
  else if (name.includes("true")) carrier = "🇹🇭 TrueMove H";

  // --- C. 解析 App 支援度 ---
  let supportChatGPT = true;
  let supportTikTok = true;
  let ipRegion = "當地 IP";

  if (["CN", "HK", "MO"].includes(targetCountryCode)) {
    supportChatGPT = false;
    supportTikTok = false;
    ipRegion = targetCountryCode === "CN" ? "中國 IP" : "香港 IP";
  }
  if (
    apn.includes("mobile.three.com.hk") ||
    apn.includes("cmhk") ||
    apn.includes("3gnet") ||
    carrier.includes("3HK")
  ) {
    supportChatGPT = false;
    supportTikTok = false;
    ipRegion = "🇭🇰 香港 IP (漫遊)";
  }
  if (carrier.includes("日本 IP")) {
    ipRegion = "🇯🇵 日本原生 IP";
  }

  // --- D. 解析降速規則 ---
  let throttle = "未知";
  const speedMatch = desc.match(/(\d+)\s*kbps/i) || name.match(/(\d+)\s*kbps/i);

  if (
    desc.includes("terminate") ||
    desc.includes("stop") ||
    name.includes("斷網")
  ) {
    throttle = "🚫 用完斷網";
  } else if (speedMatch) {
    throttle = `⬇️ 降速至 ${speedMatch[1]}kbps`;
  } else if (
    name.includes("unlimited") ||
    desc.includes("unlimited") ||
    name.includes("吃到飽")
  ) {
    throttle = "♾️ 無限流量 (FUP)";
  }

  return {
    isNative,
    carrier,
    throttle,
    supportChatGPT,
    supportTikTok,
    ipRegion,
  };
};

export default function GlobalPlanScanner() {
  const [rawPlans, setRawPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedCountry, setSelectedCountry] = useState("JP");
  const [filterIP, setFilterIP] = useState("ALL");
  const [filterDay, setFilterDay] = useState("ALL");
  const [sortBy, setSortBy] = useState("PRICE_ASC");
  const [displayCount, setDisplayCount] = useState(50);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/esim/test-list");
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setRawPlans(data.result || []);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const processedPlans = useMemo(() => {
    if (!rawPlans || rawPlans.length === 0) return [];

    const config = COUNTRIES[selectedCountry] || {
      codes: [selectedCountry],
      keywords: [],
    };

    return rawPlans
      .filter((p) => {
        const pCode = (p.code || p.location || "").toUpperCase();
        const pName = (p.name || "").toUpperCase();

        const matchCode = config.codes
          ? config.codes.some((c: string) => pCode.includes(c))
          : pCode === selectedCountry;
        const matchKeyword = config.keywords
          ? config.keywords.some(
              (k: string) =>
                pName.includes(k.toUpperCase()) ||
                pCode.includes(k.toUpperCase()),
            )
          : false;

        return matchCode || matchKeyword;
      })
      .map((p) => {
        const details = parsePlanDetails(p, config, selectedCountry);

        // ★★★ 呼叫白話文翻譯機 ★★★
        const simpleDesc = getSimpleDesc(p.name, p.day);

        const rawPrice = parseFloat(p.price || 0);
        let costTWD =
          rawPrice < 20
            ? Math.ceil(rawPrice * RATES.USD)
            : Math.ceil(rawPrice * RATES.HKD);
        const margin = details.isNative ? 1.6 : 1.4;
        const suggestedPrice = Math.ceil((costTWD * margin) / 10) * 10 - 1;

        return {
          ...p,
          ...details,
          simpleDesc, // 加入翻譯後的欄位
          costTWD,
          suggestedPrice,
          typeLabel: details.isNative ? `🔴 ${config.name}原生` : "🔵 漫遊線路",
          typeClass: details.isNative
            ? "bg-red-50 text-red-700 border border-red-100"
            : "bg-blue-50 text-blue-700 border border-blue-100",
        };
      });
  }, [rawPlans, selectedCountry]);

  const filteredPlans = useMemo(() => {
    let result = processedPlans;
    if (filterIP === "NATIVE") result = result.filter((p) => p.isNative);
    if (filterIP === "ROAMING") result = result.filter((p) => !p.isNative);
    if (filterDay === "SHORT") result = result.filter((p) => p.day <= 5);
    if (filterDay === "MID")
      result = result.filter((p) => p.day > 5 && p.day <= 10);
    if (filterDay === "LONG") result = result.filter((p) => p.day > 10);

    result.sort((a, b) => {
      if (sortBy === "PRICE_ASC") return a.costTWD - b.costTWD;
      if (sortBy === "DAY_ASC") return a.day - b.day;
      return 0;
    });
    return result;
  }, [processedPlans, filterIP, filterDay, sortBy]);

  if (loading)
    return <div className="p-10 text-center text-gray-500">掃描中...</div>;
  if (errorMsg)
    return <div className="p-10 text-center text-red-500">{errorMsg}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-sm">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          eSIM 選品神器 (Pro版)
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          資料庫: {rawPlans.length} | 符合: {filteredPlans.length}
        </p>

        {/* 篩選區 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto">
            {Object.keys(COUNTRIES).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${selectedCountry === c ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {COUNTRIES[c].emoji} {COUNTRIES[c].name}
              </button>
            ))}
          </div>
          <select
            value={filterIP}
            onChange={(e) => setFilterIP(e.target.value)}
            className="border p-2 rounded-lg bg-white font-bold"
          >
            <option value="ALL">全部線路 (含漫遊)</option>
            <option value="NATIVE">🔴 原生線路</option>
            <option value="ROAMING">🔵 漫遊線路</option>
          </select>
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="border p-2 rounded-lg bg-white"
          >
            <option value="ALL">所有天數</option>
            <option value="SHORT">短 (1-5天)</option>
            <option value="MID">中 (6-10天)</option>
            <option value="LONG">長 (11天+)</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded-lg bg-white"
          >
            <option value="PRICE_ASC">💰 成本低→高</option>
            <option value="DAY_ASC">📅 天數短→長</option>
          </select>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4 w-28">類型 / 天數</th>
                <th className="p-4 w-48">電信商 (Carrier)</th>
                <th className="p-4 w-24">APP 支援</th>
                <th className="p-4 w-1/5">方案名稱 (ID)</th>
                {/* ★★★ 新增欄位 ★★★ */}
                <th className="p-4 w-32 bg-yellow-50 text-yellow-800">
                  方案說明 (白話)
                </th>
                <th className="p-4 w-32">降速規則</th>
                <th className="p-4 w-32">APN / IP</th>
                <th className="p-4 w-20 text-right">成本</th>
                <th className="p-4 w-24 text-right">售價</th>
                <th className="p-4 w-16 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPlans.slice(0, displayCount).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  {/* 類型/天數 */}
                  <td className="p-4 align-top">
                    <span
                      className={`inline-block px-2 py-1 rounded text-[10px] font-bold mb-1 ${p.typeClass}`}
                    >
                      {p.typeLabel}
                    </span>
                    <div className="text-lg font-bold text-gray-900">
                      {p.day}
                      <span className="text-xs font-normal">天</span>
                    </div>
                  </td>

                  {/* 電信商 */}
                  <td className="p-4 align-top">
                    <div className="font-bold text-sm text-gray-800">
                      {p.carrier}
                    </div>
                    {p.carrier.includes("雙網") && (
                      <div className="text-[10px] text-blue-500 mt-1">
                        ✨ 訊號自動切換
                      </div>
                    )}
                  </td>

                  {/* App 支援 */}
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-1 text-[10px] font-bold">
                      <span
                        className={
                          p.supportChatGPT ? "text-green-600" : "text-red-400"
                        }
                      >
                        {p.supportChatGPT ? "✅ GPT" : "❌ GPT"}
                      </span>
                      <span
                        className={
                          p.supportTikTok ? "text-green-600" : "text-red-400"
                        }
                      >
                        {p.supportTikTok ? "✅ TikTok" : "❌ TikTok"}
                      </span>
                    </div>
                  </td>

                  {/* 方案名稱 (原始) */}
                  <td className="p-4 align-top">
                    <div className="font-medium text-xs text-gray-900 mb-1 break-all">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {p.id}
                    </div>
                  </td>

                  {/* ★★★ 方案說明 (白話文) ★★★ */}
                  <td className="p-4 align-top bg-yellow-50/30">
                    <div className="text-sm font-bold text-yellow-900">
                      {p.simpleDesc}
                    </div>
                  </td>

                  {/* 降速規則 */}
                  <td className="p-4 align-top">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${p.throttle.includes("斷網") ? "bg-red-100 text-red-700" : "bg-yellow-50 text-yellow-700"}`}
                    >
                      {p.throttle}
                    </span>
                  </td>

                  {/* APN / IP */}
                  <td className="p-4 align-top">
                    <div className="text-xs text-gray-500 font-mono mb-1">
                      {p.apn || "Manual"}
                    </div>
                    <div className="text-[10px] text-gray-400 border border-gray-100 px-1 rounded inline-block">
                      {p.ipRegion}
                    </div>
                  </td>

                  {/* 價格 */}
                  <td className="p-4 align-top text-right font-bold text-gray-600">
                    ${p.costTWD}
                  </td>
                  <td className="p-4 align-top text-right text-xl font-bold text-blue-600">
                    ${p.suggestedPrice}
                  </td>

                  {/* 操作 */}
                  <td className="p-4 align-top text-center">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(p.id);
                        alert("ID Copied");
                      }}
                      className="text-gray-400 hover:text-black"
                    >
                      📋
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPlans.length === 0 && (
            <div className="p-10 text-center text-gray-400">無符合資料</div>
          )}
          {filteredPlans.length > displayCount && (
            <button
              onClick={() => setDisplayCount((c) => c + 50)}
              className="w-full py-4 text-center text-sm font-bold text-gray-500 hover:bg-gray-50"
            >
              載入更多...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
