import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import querystring from "querystring";

const MERCHANT_ID = "20434";
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

  const amount = items.reduce(
    (total: number, item: any) => total + Number(item.price) * item.quantity,
    0
  );

  const tradeInfo: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    RespondType: "JSON",
    TimeStamp: `${Math.floor(Date.now() / 1000)}`,
    Version: "2.0",
    MerchantOrderNo: `ORDER${Date.now()}`,
    Amt: `${amount}`,
    ItemDesc: encodeURIComponent("虛擬商品訂單"),
    Email: orderInfo.email,
    LoginType: "0",
    ReturnURL: "https://a487-2001-b011-800b-7cfc-9827-5203-54ec-8039.ngrok-free.app/api/newebpay-callback",
    NotifyURL: "https://a487-2001-b011-800b-7cfc-9827-5203-54ec-8039.ngrok-free.app/api/newebpay-notify",
    ClientBackURL: "http://localhost:3000/thank-you", // ✅ 測試階段 OK，正式上線請改為 https
    PaymentMethod: "ALL",
  };

  const tradeInfoStr = querystring.stringify(tradeInfo);
  const encrypted = aesEncrypt(tradeInfoStr, HASH_KEY, HASH_IV);
  const tradeSha = shaEncrypt(encrypted, HASH_KEY, HASH_IV);

  console.log("🧾 原始訂單資料：", tradeInfo);
  console.log("🔗 Encoded：", tradeInfoStr);
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
