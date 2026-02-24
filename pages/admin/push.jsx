"use client";
import { useState } from "react";
import Layout from "../Layout"; // 根據您的路徑調整

export default function AdminPushPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("/");
  const [status, setStatus] = useState("idle"); // idle, sending, success, error

  const handleSendPush = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      // 呼叫剛剛在 WordPress Code Snippets 寫的群發 API
      const res = await fetch(
        "https://inf.fjg.mybluehost.me/wp-json/jeko/v1/broadcast-push",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        alert(data.message); // 會顯示成功發給幾個人
        setTitle("");
        setBody("");
      } else {
        setStatus("error");
        alert("發送失敗，請檢查 API。");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
        <h1 className="text-3xl font-bold text-[#0F356B] mb-2">
          📢 發送 PWA 推播通知
        </h1>
        <p className="text-slate-500 mb-8">
          此頁面僅限管理員操作。發送後所有訂閱用戶將立即收到手機通知。
        </p>

        <form onSubmit={handleSendPush} className="flex flex-col gap-6">
          {/* 推播標題 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              推播標題 (Title)
            </label>
            <input
              type="text"
              required
              placeholder="例如：🎉 日本秋季賞楓 eSIM 買一送一！"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#147AD7]"
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
              placeholder="例如：結帳輸入折扣碼『AUTUMN』立即折抵 $100，限量 500 組，手刀搶購！"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#147AD7]"
            />
          </div>

          {/* 點擊跳轉網址 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              點擊後跳轉網址 (URL)
            </label>
            <input
              type="text"
              placeholder="例如：/category/japan-esim/ (預設為首頁 /)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#147AD7]"
            />
          </div>

          {/* 發送按鈕 */}
          <button
            type="submit"
            disabled={status === "sending"}
            className={`mt-4 py-4 rounded-xl font-bold text-white transition-all ${
              status === "sending"
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-[#e46e2a] hover:bg-[#d05c18] shadow-md hover:shadow-lg"
            }`}
          >
            {status === "sending"
              ? "🚀 發射中..."
              : "📢 立即群發推播給所有會員！"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
