import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// ✅ 測試環境參數（上線前記得改為正式參數）
const MERCHANT_ID = "20434";
const HASH_KEY = "OVB4Xd2HgieiLJJcj5RMx9W94sMKgHQx";
const HASH_IV = "PKetlaZYZcZvlMmC";

// ✅ 加密 TradeInfo
function aesEncrypt(data: string, key: string, iv: string) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// ✅ 生成 TradeSha
function shaEncrypt(encryptedText: string, key: string, iv: string) {
  const plainText = `HashKey=${key}&${encryptedText}&HashIV=${iv}`;
  return crypto.createHash("sha256").update(plainText).digest("hex").toUpperCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { items, orderInfo } = req.body;

  const amount = items.reduce(
    (total: number, item: any) => total + item.price * item.quantity,
    0
  );

  // ✅ 根據前端傳來的 paymentMethod 設定對應藍新參數
  let paymentMethod = "";
  switch (orderInfo.paymentMethod) {
    case "Credit":
      paymentMethod = "CREDIT";
      break;
    case "LinePay":
      paymentMethod = "LINEPAY";
      break;
    case "ATM":
      paymentMethod = "VACC";
      break;
    default:
      paymentMethod = "ALL";
  }

  const tradeInfo: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    RespondType: "JSON",
    TimeStamp: `${Math.floor(Date.now() / 1000)}`,
    Version: "2.0",
    MerchantOrderNo: `ORDER${Date.now()}`,
    Amt: `${amount}`,
    ItemDesc: "網站訂單商品",
    Email: orderInfo.email,
    LoginType: "0",
    ReturnURL: "https://esim-beta.vercel.app/api/newebpay-callback",
    NotifyURL: "https://esim-beta.vercel.app/api/newebpay-notify",
    ClientBackURL: "https://esim-beta.vercel.app/thank-you",
    PaymentMethod: paymentMethod,
  };

  const tradeInfoStr = new URLSearchParams(tradeInfo).toString();
  const encrypted = aesEncrypt(tradeInfoStr, HASH_KEY, HASH_IV);
  const tradeSha = shaEncrypt(encrypted, HASH_KEY, HASH_IV);

  // ✅ 除錯 log
  console.log("🧾 建立藍新金流表單");
  console.log("✅ 送出的原始資料：", tradeInfo);
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
