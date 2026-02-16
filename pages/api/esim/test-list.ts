// pages/api/esim/test-list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// --- 正式環境憑證 (由您提供) ---
const BASE_URL = "https://microesim.top"; 
const API_PATH = "/allesim/v1/esimDataplanList"; 
const ACCOUNT = "huangguanlun1";
const SECRET = "470a04580ec9ddg8181gcg2577c5";
const SALT_HEX = "f0aff0d073486c15a9d2c7c5b20d2961";

// 🔐 加密邏輯：PBKDF2 產生密鑰
function pbkdf2ToHex(secret: string, saltHex: string, iterations: number, keyLen: number) {
  const salt = Buffer.from(saltHex, "hex");
  const derivedKey = crypto.pbkdf2Sync(secret, salt, iterations, keyLen, "sha256");
  return derivedKey.toString("hex");
}

// 🔐 加密邏輯：HMAC-SHA256 產生簽名
function hmacWithHexKey(data: string, hexKey: string) {
  return crypto.createHmac("sha256", Buffer.from(hexKey, "utf-8")).update(data).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const nonce = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now().toString();
  const hexKey = pbkdf2ToHex(SECRET, SALT_HEX, 1024, 32);
  const dataToSign = ACCOUNT + nonce + timestamp;
  const signature = hmacWithHexKey(dataToSign, hexKey);

  try {
    const response = await fetch(`${BASE_URL}${API_PATH}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "MICROESIM-ACCOUNT": ACCOUNT,
        "MICROESIM-NONCE": nonce,
        "MICROESIM-TIMESTAMP": timestamp,
        "MICROESIM-SIGN": signature,
      },
    });

    if (!response.ok) throw new Error(`API 伺服器錯誤: ${response.status}`);

    const apiResponse = await response.json();
    const allPlans = apiResponse.result || [];

    // 資料正規化
    const slimPlans = allPlans.map((p: any) => ({
      id: p.channel_dataplan_id || p.id || `temp-${Math.random()}`,
      name: p.channel_dataplan_name || p.name || "未命名方案",
      country: p.location || p.countryCode || "Global",
      price: p.price || 0, // 注意：這是港幣 HKD
      day: p.day || p.duration || 1,
      data: p.data || p.flow || p.volume || "N/A",
      rule_desc: p.rule_desc || "",
      apn: p.apn || "internet",
    }));

    res.status(200).json({ result: slimPlans });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}