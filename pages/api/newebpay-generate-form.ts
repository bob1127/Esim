import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios, { AxiosError } from "axios";

const MERCHANT_ID = "MS3788816305";
const HASH_KEY = "OVB4Xd2HgieiLJJcj5RMx9W94sMKgHQx";
const HASH_IV = "PKetlaZYZcZvlMmC";

const WOOCOMMERCE_API_URL = "https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/wc/v3/orders";
const CONSUMER_KEY = "ck_0ed8acaab9f0bc4cd27c71c2e7ae9ccc3ca45b04";
const CONSUMER_SECRET = "cs_50ad8ba137c027d45615b0f6dc2d2d7ffcf97947";

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

  const amount = Math.round(
    items.reduce((total: number, item: any) => {
      const subtotal = Number(item.price) * Number(item.quantity);
      return total + subtotal;
    }, 0)
  );

  const orderNo = `ORDER${Date.now()}`;

  // ✅ 建立 WooCommerce 訂單
  try {
    await axios.post(
      WOOCOMMERCE_API_URL,
      {
        payment_method: "newebpay",
        payment_method_title: "藍新金流",
        set_paid: false,
        billing: {
          first_name: orderInfo.name,
          email: orderInfo.email,
          phone: orderInfo.phone,
        },
        line_items: items.map((item: any) => {
          const lineItem: any = {
            product_id: item.id,
            quantity: item.quantity,
          };

          if (item.variation_id) lineItem.variation_id = item.variation_id;
          if (item.meta_data) lineItem.meta_data = item.meta_data;

          return lineItem;
        }),
        meta_data: [{ key: "newebpay_order_no", value: orderNo }],
      },
      {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET,
        },
      }
    );
  } catch (error: any) {
    const axiosError = error as AxiosError;
    console.error(
      "❌ Woo 訂單建立失敗",
      axiosError.response?.data || axiosError.message || error
    );
    return res.status(500).json({ error: "WooCommerce 訂單建立失敗" });
  }

  // ✅ 建立藍新付款參數
  const tradeInfoObj = {
    MerchantID: MERCHANT_ID,
    RespondType: "JSON",
    TimeStamp: `${Math.floor(Date.now() / 1000)}`,
    Version: "2.0",
    MerchantOrderNo: orderNo,
    Amt: String(amount),
    ItemDesc: "虛擬商品訂單",
    Email: orderInfo.email || "test@example.com",
    LoginType: "0",
    ReturnURL: "https://esim-beta.vercel.app/api/newebpay-callback",
    NotifyURL: "https://esim-beta.vercel.app/api/newebpay-notify",
    ClientBackURL: "https://esim-beta.vercel.app/thank-you",
    PaymentMethod: "CREDIT",
  };

  const tradeInfoStr = new URLSearchParams(tradeInfoObj).toString();
  const encrypted = aesEncrypt(tradeInfoStr, HASH_KEY, HASH_IV);
  const tradeSha = shaEncrypt(encrypted, HASH_KEY, HASH_IV);

  // ✅ 回傳自動送出的藍新付款表單
  const html = `
    <form id="newebpay-form" method="post" action="https://core.newebpay.com/MPG/mpg_gateway">
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
