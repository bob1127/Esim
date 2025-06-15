import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const MERCHANT_ID = "MS3788816305"; // 測試帳號
const HASH_KEY = "OVB4Xd2HgieiLJJcj5RMx9W94sMKgHQx";
const HASH_IV = "PKetlaZYZcZvlMmC";

function aesEncrypt(data: string, key: string, iv: string) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "utf8"),
    Buffer.from(iv, "utf8")
  );
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function shaEncrypt(encryptedText: string, key: string, iv: string) {
  const plainText = `HashKey=${key}&${encryptedText}&HashIV=${iv}`;
  return crypto.createHash("sha256").update(plainText).digest("hex").toUpperCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { items, orderInfo } = req.body;

  // ✅ 總金額必須為整數
  const amount = Math.round(
    items.reduce((total: number, item: any) => {
      const subtotal = Number(item.price) * Number(item.quantity);
      return total + subtotal;
    }, 0)
  );

  // ✅ 構建 TradeInfo 原始資料
  const tradeInfoObj = {
    MerchantID: MERCHANT_ID,
    RespondType: "JSON",
    TimeStamp: `${Math.floor(Date.now() / 1000)}`,
    Version: "2.0",
    MerchantOrderNo: `ORDER${Date.now()}`,
    Amt: String(amount),
    ItemDesc: "虛擬商品訂單",
    Email: orderInfo.email || "test@example.com", // 避免空值
    LoginType: "0",
    ReturnURL: "https://esim-beta.vercel.app/api/newebpay-callback",
    NotifyURL: "https://esim-beta.vercel.app/api/newebpay-notify",
    ClientBackURL: "https://esim-beta.vercel.app/thank-you",
    PaymentMethod: "ALL",
  };

  // ✅ 使用 URLSearchParams 處理編碼（正確順序與格式）
  const tradeInfoStr = new URLSearchParams(tradeInfoObj).toString();
  const encrypted = aesEncrypt(tradeInfoStr, HASH_KEY, HASH_IV);
  const tradeSha = shaEncrypt(encrypted, HASH_KEY, HASH_IV);

  console.log("📦 原始 TradeInfo：", tradeInfoObj);
  console.log("🔗 字串化後 TradeInfo：", tradeInfoStr);
  console.log("🔐 Encrypted TradeInfo：", encrypted);
  console.log("🔒 TradeSha：", tradeSha);

  const html = `
    <form id="newebpay-form" method="post" action="https://ccore.newebpay.com/MPG/mpg_gateway">
      <input type="hidden" name="MerchantID" value="${MERCHANT_ID}" />
      <input type="hidden" name="TradeInfo" value="${encrypted}" />
      <input type="hidden" name="TradeSha" value="${tradeSha}" />
      <input type="hidden" name="Version" value="2.0" />
    </form>
    <script>document.getElementById("newebpay-form").submit();</script>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
}
