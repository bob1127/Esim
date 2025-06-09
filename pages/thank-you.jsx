// pages/thank-you.jsx
import React from "react";
import Layout from "./Layout";
import Link from "next/link";

const ThankYouPage = () => {
  return (
    <Layout>
      <div className="pt-[200px] px-[30px] text-center max-w-[600px] mx-auto">
        <h1 className="text-3xl font-bold text-green-600 mb-6">
          感謝您的訂購！
        </h1>
        <p className="text-lg mb-4">我們已收到您的訂單，系統將盡快為您處理。</p>
        <p className="text-sm text-gray-500 mb-10">
          如有任何問題，歡迎聯絡我們的客服，或至信箱查收訂單通知信件。
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <button className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition">
              返回首頁
            </button>
          </Link>
          <Link href="/shop">
            <button className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
              繼續逛逛
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ThankYouPage;
