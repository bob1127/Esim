// pages/api/newebpay-notify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const HASH_KEY = "OVB4Xd2HgieiLJJcj5RMx9W94sMKgHQx";
const HASH_IV = "PKetlaZYZcZvlMmC";

function aesDecrypt(encryptedText: string, key: string, iv: string) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  decipher.setAutoPadding(true);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { TradeInfo } = req.body;

  try {
    const decrypted = aesDecrypt(TradeInfo, HASH_KEY, HASH_IV);
    const parsed = new URLSearchParams(decrypted);
    const data: Record<string, string> = {};

    parsed.forEach((value, key) => {
      data[key] = value;
    });

    console.log("🔐 藍新付款通知解密成功：", data);

    // ✅ 這裡可以擴充：寫入 DB、寄信、發 LINE 通知等
    // if (data.Status === "SUCCESS" && data.OrderStatus === "SUCCESS") { ... }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ 解密失敗", error);
    res.status(400).send("FAIL");
  }
}
