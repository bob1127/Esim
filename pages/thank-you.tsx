import { useEffect, useState } from "react";

export default function ThankYouPage() {
  const [orderInfo, setOrderInfo] = useState<null | Record<string, any>>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("Status");
    const message = urlParams.get("Message");
    const result = urlParams.get("Result");

    let parsed = null;
    try {
      if (result) {
        parsed = JSON.parse(decodeURIComponent(result));
      }
    } catch (err) {
      console.error("解析失敗", err);
    }

    setOrderInfo({ status, message, ...parsed });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-4">感謝您的訂購</h1>
      {orderInfo ? (
        <div className="bg-gray-100 p-6 rounded">
          <p>付款狀態：{orderInfo.status}</p>
          <p>訊息：{orderInfo.message}</p>
          {orderInfo.MerchantOrderNo && (
            <>
              <p>訂單編號：{orderInfo.MerchantOrderNo}</p>
              <p>付款方式：{orderInfo.PaymentType}</p>
              <p>付款時間：{orderInfo.PayTime}</p>
              <p>交易序號：{orderInfo.TradeNo}</p>
            </>
          )}
        </div>
      ) : (
        <p>正在取得訂單資訊...</p>
      )}
    </div>
  );
}
