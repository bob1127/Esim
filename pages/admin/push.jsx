"use client";
import { useState } from "react";
import Layout from "../Layout";

export default function AdminPushPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("/");
  const [status, setStatus] = useState("idle");

  const handleSendPush = async (e) => {
    e.preventDefault();

    // 二次確認，避免手滑群發
    if (!confirm("確定要群發推播給所有訂閱用戶嗎？")) return;

    setStatus("sending");

    try {
      // ⚠️ 請確保 WordPress 端的 Code Snippet 已經勾選 "Run snippet everywhere"
      const res = await fetch(
        "https://inf.fjg.mybluehost.me/wp-json/jeko/v1/broadcast-push",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 如果後續有加裝 WP 認證外掛，此處需帶入 Authorization Header
          },
          body: JSON.stringify({
            title: title,
            body: body,
            url: linkUrl,
          }),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        alert(`🎉 ${data.message}`);
        setTitle("");
        setBody("");
      } else {
        setStatus("error");
        // 如果 API 回傳 404 或其他錯誤，直接顯示原因
        const errorMsg = data.message || "未知錯誤";
        const errorCode = data.code || res.status;
        alert(`發送失敗！\n原因：${errorMsg} (${errorCode})`);
        console.error("API Error Response:", data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setStatus("error");
      alert("連線失敗，請檢查網路或 WordPress CORS 設定。");
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📢</span>
          <h1 className="text-3xl font-bold text-[#0F356B]">
            發送 PWA 推播通知
          </h1>
        </div>
        <p className="text-slate-500 mb-8 border-l-4 border-orange-400 pl-4">
          管理員專區：發送後所有「加入主畫面」且「開啟通知」的用戶將立即收到推播。
        </p>

        <form onSubmit={handleSendPush} className="flex flex-col gap-6">
          {/* 推播標題 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              推播標題 (建議 20 字內)
            </label>
            <input
              type="text"
              required
              placeholder="例如：🎉 Jeko eSIM 開站大放送！"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#147AD7] transition-all"
            />
          </div>

          {/* 推播內容 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              推播內容 (Body)
            </label>
            <textarea
              required
              rows={3}
              placeholder="例如：輸入折扣碼 JEKO88 享全站 88 折優惠..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#147AD7] transition-all"
            />
          </div>

          {/* 點擊跳轉網址 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              點擊後跳轉網址 (相對路徑)
            </label>
            <input
              type="text"
              placeholder="例如：/promotions/ (預設為首頁 /)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#147AD7] transition-all"
            />
          </div>

          {/* 發送按鈕 */}
          <button
            type="submit"
            disabled={status === "sending"}
            className={`mt-4 py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-md ${
              status === "sending"
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            }`}
          >
            {status === "sending"
              ? "🚀 正在聯絡伺服器群發中..."
              : "📢 立即執行全球群發推播！"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
