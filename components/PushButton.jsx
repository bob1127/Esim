"use client";
import { useState, useEffect } from "react";

// Web Push 必備的 Base64 轉換工具
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // 檢查瀏覽器是否支援 Service Worker 與 推播功能
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    try {
      // 1. 請求通知權限
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("您拒絕了通知權限，若要接收流量提醒，請至瀏覽器設定開啟。");
        return;
      }

      // 2. 取得推播訂閱憑證
      const registration = await navigator.serviceWorker.ready;
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // ★★★ 3. 修改這裡：把憑證送到您的 WordPress 後端 API ★★★

      // 注意：這裡先寫死 user_id 為 123 當作測試。
      // 實務上，您需要從登入狀態 (例如 context 或 localStorage) 取得真實的會員 ID
      const currentUserId = 123;

      const res = await fetch(
        "https://inf.fjg.mybluehost.me/wp-json/jeko/v1/save-subscription",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: currentUserId,
            subscription: subscription, // 將整包推播憑證丟給 WP
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      // 4. 判斷 WP 是否成功接收
      if (res.ok) {
        setIsSubscribed(true);
        console.log("✅ 推播憑證已成功存入 WordPress 資料庫！");
      } else {
        console.error("儲存憑證到 WordPress 失敗");
        alert("目前伺服器繁忙，請稍後再試。");
      }
    } catch (error) {
      console.error("訂閱過程發生錯誤:", error);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={subscribeUser}
      disabled={isSubscribed}
      className={`px-8 py-3 rounded-full font-bold text-white transition-all shadow-md active:scale-95 ${
        isSubscribed
          ? "bg-slate-400 cursor-not-allowed"
          : "bg-[#147AD7] hover:bg-blue-600"
      }`}
    >
      {isSubscribed ? "🔔 已開啟流量提醒通知" : "開啟流量提醒通知 ✈️"}
    </button>
  );
}
