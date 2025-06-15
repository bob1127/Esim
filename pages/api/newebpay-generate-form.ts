import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import querystring from "querystring";

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

  // ✅ 驗證商品金額與數量是否正確
  console.log("🛒 購物車內容：", items);
  const amount = items.reduce(
    (total: number, item: any) => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      console.log(`🧮 ${item.name}: ${item.price} x ${item.quantity} = ${itemTotal}`);
      return total + itemTotal;
    },
    0
  );
  console.log("💰 計算後總金額 Amt：", amount);

  const itemDesc = encodeURIComponent("虛擬商品訂單");
  console.log("📦 ItemDesc（編碼後）：", itemDesc);

  const tradeInfo: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    RespondType: "JSON",
    TimeStamp: `${Math.floor(Date.now() / 1000)}`,
    Version: "2.0",
    MerchantOrderNo: `ORDER${Date.now()}`,
    Amt: `${amount}`,
    ItemDesc: itemDesc,
    Email: orderInfo.email,
    LoginType: "0",
    ReturnURL: "https://esim-beta.vercel.app/api/newebpay-callback",
    NotifyURL: "https://esim-beta.vercel.app/api/newebpay-notify",
    ClientBackURL: "https://esim-beta.vercel.app/thank-you",
    PaymentMethod: "ALL",
  };

  const tradeInfoStr = querystring.stringify(tradeInfo);
  const encrypted = aesEncrypt(tradeInfoStr, HASH_KEY, HASH_IV);
  const tradeSha = shaEncrypt(encrypted, HASH_KEY, HASH_IV);

  // ✅ 印出所有加密流程中間結果
  console.log("🔗 TradeInfo 原始資料（encoded）：", tradeInfoStr);
  console.log("🔐 Encrypted TradeInfo（AES）：", encrypted);
  console.log("🔒 TradeSha（SHA256）：", tradeSha);

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
