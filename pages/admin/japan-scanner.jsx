import React, { useState, useEffect } from "react";
import Layout from "../Layout";

export default function JapanPlanScanner() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, IIJ, SOFTBANK, AU

  // 匯率設定
  const EXCHANGE_RATE = 4.5;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/esim/list");
      if (!res.ok) throw new Error(`API 回傳錯誤: ${res.status}`);

      const data = await res.json();
      const allPlans = data.result || [];

      // 1. 初步過濾：只抓日本相關 (加入防呆，避免 name 是 null 時報錯)
      const japanPlans = allPlans.filter((p) => {
        const name = p.name || p.channel_dataplan_name || ""; // 防呆
        const code = p.code || p.location || ""; // 防呆
        return code === "JP" || name.includes("Japan");
      });

      // 2. 數據清洗與標記
      const processed = japanPlans.map((p) => {
        const apn = (p.apn || "").toLowerCase();
        const name = (p.name || p.channel_dataplan_name || "").toLowerCase();
        const costHKD = parseFloat(p.price || 0);
        const costTWD = Math.ceil(costHKD * EXCHANGE_RATE);

        // --- 自動分類邏輯 (關鍵修改) ---
        let typeLabel = "❓ 未知";
        let typeClass = "bg-gray-100 text-gray-500";
        let category = "OTHER";

        // 分類 A: IIJ Docomo (原生)
        if (apn.includes("vmobile.jp") || name.includes("iij")) {
          typeLabel = "🔴 IIJ Docomo (原生)";
          typeClass = "bg-red-100 text-red-800 border-red-200";
          category = "IIJ";
        }
        // 分類 B: SoftBank / KDDI (漫遊/CMHK)
        else if (
          apn.includes("cmhk") ||
          apn.includes("cmiot") ||
          apn.includes("plus.4g") ||
          name.includes("softbank")
        ) {
          typeLabel = "🔵 SoftBank/KDDI (漫遊)";
          typeClass = "bg-blue-100 text-blue-800 border-blue-200";
          category = "SOFTBANK";
        }
        // 分類 C: AU (KDDI) 原生
        else if (apn.includes("au.com") || apn.includes("kddi")) {
          typeLabel = "🟠 AU KDDI (原生)";
          typeClass = "bg-orange-100 text-orange-800 border-orange-200";
          category = "AU";
        }

        // 建議售價邏輯
        const suggestedPrice =
          category === "IIJ" || category === "AU"
            ? Math.ceil((costTWD * 2) / 10) * 10 - 1 // 原生卡賺 100%
            : Math.ceil((costTWD * 1.5) / 10) * 10 - 1; // 漫遊卡賺 50%

        return {
          ...p,
          name: p.name || p.channel_dataplan_name, // 確保有名稱
          apn: apn,
          costHKD,
          costTWD,
          suggestedPrice,
          typeLabel,
          typeClass,
          category,
        };
      });

      // 依照天數排序
      processed.sort((a, b) => (a.day || 0) - (b.day || 0));
      setPlans(processed);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (filterType === "ALL") return true;
    return p.category === filterType;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`已複製 SKU: ${text}`);
  };

  if (loading)
    return (
      <div className="p-10 text-center text-xl font-bold">正在讀取資料...</div>
    );
  if (errorMsg)
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        錯誤：{errorMsg}
        <br />
        請檢查終端機 (Terminal) 的 API 報錯。
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🇯🇵 日本方案選品 (API 掃描器)
          </h1>
          <span className="text-gray-500 text-sm">
            共抓到 {plans.length} 筆日本方案
          </span>
        </div>

        {/* 控制列 */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-3 items-center sticky top-0 z-10 border border-gray-200">
          <span className="font-bold text-gray-700 mr-2">快速篩選：</span>

          <button
            onClick={() => setFilterType("ALL")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "ALL"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            全部顯示
          </button>

          <button
            onClick={() => setFilterType("IIJ")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filterType === "IIJ"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-white border-gray-200 hover:border-red-300 text-gray-600"
            }`}
          >
            🔴 IIJ Docomo ({plans.filter((p) => p.category === "IIJ").length})
          </button>

          <button
            onClick={() => setFilterType("SOFTBANK")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filterType === "SOFTBANK"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-white border-gray-200 hover:border-blue-300 text-gray-600"
            }`}
          >
            🔵 SoftBank/KDDI (
            {plans.filter((p) => p.category === "SOFTBANK").length})
          </button>

          <button
            onClick={() => setFilterType("AU")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filterType === "AU"
                ? "bg-orange-50 border-orange-500 text-orange-700"
                : "bg-white border-gray-200 hover:border-orange-300 text-gray-600"
            }`}
          >
            🟠 AU KDDI ({plans.filter((p) => p.category === "AU").length})
          </button>
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 w-[180px]">電信網絡</th>
                <th className="p-4 w-[100px]">天數</th>
                <th className="p-4">方案名稱 / 流量</th>
                <th className="p-4 w-[200px]">FUP 規則</th>
                <th className="p-4 text-right">HKD 成本</th>
                <th className="p-4 text-right">TWD 成本</th>
                <th className="p-4 text-right bg-yellow-50 text-yellow-900 border-l border-yellow-100">
                  建議售價
                </th>
                <th className="p-4 text-center w-[120px]">SKU</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredPlans.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-b hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-bold border ${plan.typeClass}`}
                    >
                      {plan.typeLabel}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-lg text-gray-900">
                      {plan.day}
                    </span>{" "}
                    <span className="text-xs text-gray-500">天</span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800 text-base">
                      {plan.data}
                    </div>
                    <div className="text-gray-400 text-xs mt-1 font-mono">
                      {plan.name}
                    </div>
                    <div className="text-xs text-gray-300 mt-0.5 group-hover:text-gray-500 transition-colors">
                      APN: {plan.apn}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-medium px-2 py-0.5 rounded ${
                        plan.rule_desc?.toLowerCase().includes("unlimited")
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {plan.rule_desc}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-500">
                    ${plan.costHKD.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-medium text-gray-800">
                    ${plan.costTWD}
                  </td>
                  <td className="p-4 text-right font-bold text-blue-600 text-lg bg-yellow-50 border-l border-yellow-100">
                    ${plan.suggestedPrice}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => copyToClipboard(plan.id)}
                      className="text-gray-400 hover:text-blue-600 font-bold border border-gray-300 hover:border-blue-600 px-3 py-1 rounded transition-all active:scale-95"
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
              此分類下沒有找到相關方案
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
