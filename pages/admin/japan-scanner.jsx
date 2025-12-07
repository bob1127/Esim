import React, { useState, useEffect, useMemo } from "react";
import Layout from "../Layout";

export default function JapanPlanScanner() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // --- 篩選條件 State ---
  const [filterIP, setFilterIP] = useState("ALL"); // ALL, NATIVE, ROAMING
  const [filterDay, setFilterDay] = useState("ALL"); // ALL, SHORT, MID, LONG
  const [filterData, setFilterData] = useState("ALL"); // ALL, DAILY, TOTAL, UNLIMITED
  const [sortBy, setSortBy] = useState("PRICE_ASC"); // PRICE_ASC, DAY_ASC

  // 匯率設定
  const EXCHANGE_RATE = 4.5;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/esim/list");
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      const allPlans = data.result || [];

      // 1. 初步過濾日本方案
      const japanPlans = allPlans.filter((p) => {
        const name = p.name || p.channel_dataplan_name || "";
        const code = p.code || p.location || "";
        return code === "JP" || name.includes("Japan");
      });

      // 2. 資料清洗
      const processed = japanPlans.map((p) => {
        const apn = (p.apn || "").toLowerCase();
        const name = (p.name || p.channel_dataplan_name || "").toLowerCase();
        const rule = (p.rule_desc || "").toLowerCase();
        const tags = p.tags || [];
        const costHKD = parseFloat(p.price || 0);
        const costTWD = Math.ceil(costHKD * EXCHANGE_RATE);

        // 分類判斷
        let isNative =
          apn.includes("vmobile.jp") ||
          name.includes("iij") ||
          apn.includes("docomo");
        let isDaily = name.includes("daily");
        let isTotal = name.includes("total");
        let isUnlimited = rule.includes("unlimited high speed");

        // APP 支援度
        const supportChatGPT = tags.includes("ChatGPT✅") || isNative;
        const supportTikTok = tags.includes("TikTok✅") || isNative;

        // 類型標籤
        let typeLabel = isNative ? "🔴 IIJ 原生" : "🔵 漫遊 (HK/SG)";
        let typeClass = isNative
          ? "bg-red-100 text-red-800"
          : "bg-blue-100 text-blue-800";

        // 建議售價
        const margin = isNative ? 2.0 : 1.5;
        const suggestedPrice = Math.ceil((costTWD * margin) / 10) * 10 - 1;

        return {
          ...p,
          name: p.name || p.channel_dataplan_name,
          apn,
          costTWD,
          suggestedPrice,
          isNative,
          isDaily,
          isTotal,
          isUnlimited,
          supportChatGPT,
          supportTikTok,
          typeLabel,
          typeClass,
        };
      });

      setPlans(processed);
      setLoading(false);
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  // --- 核心篩選邏輯 (useMemo 優化效能) ---
  const filteredPlans = useMemo(() => {
    let result = plans;

    // 1. IP 篩選
    if (filterIP === "NATIVE") result = result.filter((p) => p.isNative);
    if (filterIP === "ROAMING") result = result.filter((p) => !p.isNative);

    // 2. 天數篩選
    if (filterDay === "SHORT") result = result.filter((p) => p.day <= 7);
    if (filterDay === "MID")
      result = result.filter((p) => p.day > 7 && p.day <= 15);
    if (filterDay === "LONG") result = result.filter((p) => p.day > 15);

    // 3. 流量篩選
    if (filterData === "DAILY") result = result.filter((p) => p.isDaily);
    if (filterData === "TOTAL") result = result.filter((p) => p.isTotal);
    if (filterData === "UNLIMITED")
      result = result.filter((p) => p.isUnlimited);

    // 4. 排序
    result.sort((a, b) => {
      if (sortBy === "PRICE_ASC") return a.costTWD - b.costTWD;
      if (sortBy === "DAY_ASC") return a.day - b.day;
      return 0;
    });

    return result;
  }, [plans, filterIP, filterDay, filterData, sortBy]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`已複製 SKU: ${text}`);
  };

  if (loading)
    return <div className="p-10 text-center font-bold">載入中...</div>;
  if (errorMsg)
    return <div className="p-10 text-red-600">錯誤：{errorMsg}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🇯🇵 日本方案選品神器
        </h1>

        {/* --- 篩選控制區 (Filter Bar) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 1. IP 篩選 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              IP 線路類型
            </label>
            <select
              value={filterIP}
              onChange={(e) => setFilterIP(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">全部顯示</option>
              <option value="NATIVE">🇯🇵 原生 (IIJ/Docomo)</option>
              <option value="ROAMING">🌍 漫遊 (SoftBank/KDDI)</option>
            </select>
          </div>

          {/* 2. 天數篩選 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              旅遊天數
            </label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">全部天數</option>
              <option value="SHORT">短期 (3-7天)</option>
              <option value="MID">中期 (8-15天)</option>
              <option value="LONG">長期 (16-30天)</option>
            </select>
          </div>

          {/* 3. 流量篩選 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              流量規則
            </label>
            <select
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">全部規格</option>
              <option value="DAILY">每天定量 (Daily)</option>
              <option value="TOTAL">總量型 (Total)</option>
              <option value="UNLIMITED">🔥 真吃到飽 (Unlimited)</option>
            </select>
          </div>

          {/* 4. 排序 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              排序方式
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="PRICE_ASC">💰 價格 (低 - 高)</option>
              <option value="DAY_ASC">📅 天數 (短 - 長)</option>
            </select>
          </div>
        </div>

        {/* --- 結果表格 --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 text-sm text-gray-500 flex justify-between">
            <span>搜尋結果：共 {filteredPlans.length} 筆</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                <th className="p-4">類型</th>
                <th className="p-4">天數</th>
                <th className="p-4">方案名稱 / 流量</th>
                <th className="p-4">支援度</th>
                <th className="p-4 text-right">成本 (TWD)</th>
                <th className="p-4 text-right text-blue-600">建議售價</th>
                <th className="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredPlans.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-yellow-50 transition-colors"
                >
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${p.typeClass}`}
                    >
                      {p.typeLabel}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-lg text-gray-900">
                    {p.day} 天
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{p.data}</div>
                    <div className="text-xs text-gray-400 mt-1">{p.name}</div>
                    <div
                      className={`text-xs mt-1 ${
                        p.isUnlimited
                          ? "text-green-600 font-bold"
                          : "text-gray-500"
                      }`}
                    >
                      {p.rule_desc}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 text-xs">
                      <span
                        className={
                          p.supportChatGPT ? "text-green-700" : "text-gray-400"
                        }
                      >
                        {p.supportChatGPT ? "✅ GPT" : "❌ GPT"}
                      </span>
                      <span
                        className={
                          p.supportTikTok ? "text-green-700" : "text-gray-400"
                        }
                      >
                        {p.supportTikTok ? "✅ TikTok" : "❌ TikTok"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-gray-600">
                    ${p.costTWD}
                  </td>
                  <td className="p-4 text-right font-bold text-lg text-blue-600 bg-blue-50">
                    ${p.suggestedPrice}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => copyToClipboard(p.id)}
                      className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 transition"
                    >
                      複製
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPlans.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              沒有符合條件的方案
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
