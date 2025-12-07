// pages/api/esim/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import crypto from "crypto";

// --- 💰 定價與匯率設定 (老闆請看這裡) ---
const ACCOUNT = "huangguanlun1";
const SECRET = "470a04580ec9ddg8181gcg2577c5";
const SALT_HEX = "f0aff0d073486c15a9d2c7c5b20d2961";
const BASE_URL = "https://microesim.top";

// 1. 匯率設定 (建議設寬一點，包含手續費風險)
const EXCHANGE_RATE_HKD_TO_TWD = 4.5; 

// 2. 利潤倍數設定 (1.5 代表利潤 50%, 2.0 代表利潤 100%)
const MARGIN_PREMIUM = 2.0;  // 原生卡、真吃到飽 (獨家貨賣貴點)
const MARGIN_STANDARD = 1.5; // 優質漫遊 (標準利潤)

// -------------------------------------------

// 原生 APN 特徵
const NATIVE_APN_HINTS = [
  "vmobile.jp", "spmode", "emov", "au.com", "plus.4g", // 日本
  "kt.freet", "lte.sktelecom.com", "internet.lguplus.co.kr", // 韓國
  "truemove", "ais", "dtac", // 泰國
  "viettel", "vinaphone", // 越南
  "cht", "twmobile", "fet", // 台灣
  "t-mobile", "att", "verizon", // 美國
  "vodafone", "o2", "telekom", "orange" // 歐洲
];

// 封鎖 AI 的地區
const AI_BLOCKED_REGIONS = ["CN", "HK", "MO", "RU", "IR", "KP"];

// --- 核心分析函數 ---
function analyzePlan(plan: any) {
  const apn = (plan.apn || "").toLowerCase();
  const ip = (plan.ip || "").toUpperCase(); 
  const locationCodes = (plan.code || "").split(","); 
  const networkStr = (plan.networks || "");
  const ruleDesc = (plan.rule_desc || "").toLowerCase();

  let type = "ROAMING"; 
  let label = "標準漫遊"; 
  let quality = "Standard";
  let tags: string[] = [];
  let routingInfo = ip ? `${ip} 出口` : "未知出口";
  let fupInfo = "流量用完斷網";
  let isTrueUnlimited = false;

  // 1. 原生判斷
  const isNativeApn = NATIVE_APN_HINTS.some(hint => apn.includes(hint));
  const isLocalIp = locationCodes.length === 1 && locationCodes[0] === ip;

  if (isNativeApn || isLocalIp) {
    type = "NATIVE";
    label = "🔥 當地原生極速";
    quality = "Premium";
    routingInfo = "當地直連 (低延遲)";
    tags.push("不降速(高速區段)");
  } else if (ip === "SG") {
    type = "ROAMING_PREMIUM";
    label = "🚀 優質漫遊 (SG路由)";
    quality = "High";
    routingInfo = "新加坡出口 (低延遲)";
  } else if (ip === "HK") {
    label = "經濟漫遊";
    routingInfo = "香港出口";
    tags.push("CP值高");
  }

  // 2. AI 支援度
  const isBlockedIP = AI_BLOCKED_REGIONS.includes(ip);
  if (!isBlockedIP && (type === "NATIVE" || ["SG", "JP", "US", "KR", "TW", "UK"].includes(ip))) {
    tags.push("ChatGPT✅");
    tags.push("TikTok✅");
  } else {
    tags.push("ChatGPT❌");
  }

  // 3. 流量規則解析
  if (ruleDesc.includes("unlimited")) {
    const speedMatch = ruleDesc.match(/(\d+)\s*(kbps|mbps)/);
    if (speedMatch) {
      const speedVal = speedMatch[1];
      const speedUnit = speedMatch[2];
      fupInfo = `高速用完後，降速至 ${speedVal}${speedUnit} 吃到飽`;
      tags.push("降速吃到飽");
    } else {
      fupInfo = "🔥 全速吃到飽 (無標示降速)";
      isTrueUnlimited = true;
      tags.push("🚀 真·吃到飽");
      quality = "Ultra-Premium";
    }
  } else if (ruleDesc.includes("terminate") || plan.data?.toLowerCase().includes("total")) {
    fupInfo = "固定流量，用完斷網 (全程高速)";
    tags.push("全程不降速");
  }

  if (networkStr.includes(",") || networkStr.includes("|")) {
    tags.push("多訊號切換");
  }

  return { type, label, quality, tags, routingInfo, fupInfo, isTrueUnlimited };
}

function signHeaders() {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(6).toString("hex");
  const hexKey = crypto.pbkdf2Sync(
    SECRET,
    Buffer.from(SALT_HEX, "hex"),
    1024,
    32,
    "sha256"
  ).toString("hex");
  const dataToSign = ACCOUNT + nonce + timestamp;
  const signature = crypto
    .createHmac("sha256", Buffer.from(hexKey, "utf8"))
    .update(dataToSign)
    .digest("hex");
  return { timestamp, nonce, signature };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { timestamp, nonce, signature } = signHeaders();
  const headers = {
    "Content-Type": "application/json",
    "MICROESIM-ACCOUNT": ACCOUNT,
    "MICROESIM-NONCE": nonce,
    "MICROESIM-TIMESTAMP": timestamp,
    "MICROESIM-SIGN": signature,
  };

  try {
    const response = await axios.get(`${BASE_URL}/allesim/v1/esimDataplanList`, {
      headers,
      timeout: 15000,
    });

    const rawPlans = response.data?.result || [];

    const processedPlans = rawPlans.reduce((acc: any[], plan: any) => {
      const analysis = analyzePlan(plan);

      // 過濾條件：保留 原生 / 真吃到飽 / 優質漫遊
      if (analysis.type === 'NATIVE' || analysis.isTrueUnlimited || analysis.type === 'ROAMING_PREMIUM') {
        
        // --- 💰 價格計算邏輯 ---
        
        // 1. 取得港幣成本
        const costHKD = parseFloat(plan.price);
        
        // 2. 決定利潤倍數
        let margin = MARGIN_STANDARD;
        if (analysis.quality === "Ultra-Premium" || analysis.type === "NATIVE") {
            margin = MARGIN_PREMIUM; // 好貨賣貴點
        }

        // 3. 計算台幣初步售價 (成本 * 匯率 * 利潤)
        let rawPriceTWD = costHKD * EXCHANGE_RATE_HKD_TO_TWD * margin;

        // 4. 價格美容 (Pricing Psychology)
        // 策略：無條件進位到十位數，再減 1 (變成 9 結尾)
        // 例: 281 -> 290 -> 289
        // 例: 592 -> 600 -> 599
        let finalPriceTWD = Math.ceil(rawPriceTWD / 10) * 10 - 1;

        // 安全檢查：確保沒變負數或過低
        if (finalPriceTWD < (costHKD * EXCHANGE_RATE_HKD_TO_TWD)) {
             finalPriceTWD += 10;
        }

        acc.push({
          id: plan.channel_dataplan_id,
          name: plan.channel_dataplan_name,
          
          // ⚠️ 重要：這裡是計算後的台幣售價
          price: finalPriceTWD, 
          currency: "TWD", 
          
          // 選用：保留原始成本資訊 (僅供你在 Vercel Log 查看，前端不會顯示)
          _debug_cost_hkd: plan.price, 

          data: plan.data,
          day: plan.day,
          location: plan.code,
          rule_desc: plan.rule_desc, 
          apn: plan.apn,
          ...analysis,
        });
      }
      return acc;
    }, []);

    // 偵錯用：印出一個來看看價格對不對
    if (processedPlans.length > 0) {
        const p = processedPlans[0];
        console.log(`[定價測試] 方案: ${p.name}`);
        console.log(`成本: HKD ${p._debug_cost_hkd} -> 售價: TWD ${p.price}`);
        console.log(`標籤: ${p.label}`);
    }

    res.status(200).json({ 
        success: true, 
        count: processedPlans.length,
        result: processedPlans 
    });

  } catch (err: any) {
    console.error("API Error:", err.message);
    res.status(500).json({ error: "List Fetch Failed", detail: err.message });
  }
}