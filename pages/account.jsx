"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "./Layout";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ========== 小工具 ========== */
const formatNTDNoDecimals = (val) => {
  if (val == null) return "0";
  const n = Number(String(val).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("zh-TW");
};

const statusLabel = (status) => {
  const map = {
    processing: "已付款完成",
    pending: "待付款",
    completed: "已完成",
    cancelled: "已取消",
    "on-hold": "待付款",
    refunded: "已退款",
    failed: "付款失敗",
  };
  return map[String(status || "").toLowerCase()] || status;
};

/**
 * 從訂單 meta_data 裡抓 eSIM QR Code 圖片網址
 *  meta_data 格式：
 *  value: '[{"name":"柬埔寨3GB #1","src":"https://microesim.top/files/9000025110852679"}]'
 */
const getEsimQRCodes = (order) => {
  const results = [];

  if (!order || !order.meta_data) return results;

  const meta = order.meta_data.find((m) => m.key === "esim_qrcodes");

  if (!meta || !meta.value) return results;

  try {
    const parsed = JSON.parse(meta.value); // value 是 JSON 字串
    if (Array.isArray(parsed)) {
      parsed.forEach((item) => {
        if (item && item.src) {
          results.push(item.src);
        }
      });
    }
  } catch (e) {
    console.error("❌ 無法解析 esim_qrcodes JSON：", meta.value);
  }

  // 去重
  return Array.from(new Set(results));
};

/* Shimmer skeleton */
const OrderSkeletonGrid = () => (
  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <li
        key={i}
        className="border border-white/70 rounded-2xl bg-white/60 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.25)] backdrop-blur-sm"
      >
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="h-24 bg-slate-100 rounded-xl" />
        </div>
      </li>
    ))}
  </ul>
);

/* ========== 主頁面 ========== */
export default function AccountPage() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);

  const [editingEmail, setEditingEmail] = useState("");
  const [editingPhone, setEditingPhone] = useState("");
  const [editingName, setEditingName] = useState("");

  /* ====== 抓訂單 API ====== */
  const fetchOrders = useCallback(async (u) => {
    if (!u) return [];
    const qs = new URLSearchParams({
      ...(u.id ? { userId: String(u.id) } : {}),
      ...(u.email ? { email: String(u.email) } : {}),
    }).toString();

    const res = await fetch(`/api/get-orders?${qs}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, []);

  const loadOrders = useCallback(
    async (u) => {
      if (!u) return;
      setOrdersLoading(true);
      const list = await fetchOrders(u);
      setOrders(list);
      setOrdersLoaded(true);
      setOrdersLoading(false);
    },
    [fetchOrders]
  );

  // 若要 debug 可以保留這段
  // useEffect(() => {
  //   if (orders.length > 0) {
  //     console.log("🔍 一筆訂單完整資料：", orders[0]);
  //     console.log("🔍 這筆訂單的 meta_data：", orders[0].meta_data);
  //   }
  // }, [orders]);

  /* ====== 初始化：讀會員 & 讀訂單 ====== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!token && !storedUser) {
      router.push("/login");
      return;
    }

    const loadUser = async () => {
      let user = storedUser;

      if (token) {
        try {
          const res = await fetch(
            "https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/wp/v2/users/me",
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.ok) {
            user = await res.json();
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch {
          // 若失敗就沿用 localStorage 的 user
        }
      }

      if (!user) {
        router.push("/login");
        return;
      }

      setUserInfo(user);
      setEditingEmail(user.email || "");
      setEditingPhone(user.meta?.billing_phone || "");
      setEditingName(user.name || "");
      loadOrders(user);
    };

    loadUser();

    const fav = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(fav);
  }, [router, loadOrders]);

  /* ====== 更新會員資訊 ====== */
  const handleProfileUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userInfo?.id) return;

    const res = await fetch(
      `https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/wp/v2/users/${userInfo.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingName,
          email: editingEmail,
          meta: { billing_phone: editingPhone },
        }),
      }
    );

    const data = await res.json();
    if (!data.code) {
      setUserInfo(data);
      localStorage.setItem("user", JSON.stringify(data));
      setEditMode(false);
      alert("會員資料更新成功！");
    } else {
      alert("更新失敗：" + data.message);
    }
  };

  if (!userInfo) {
    return (
      <Layout>
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F2FF] via-[#F8FBFF] to-[#FFE5F7] text-slate-700 text-lg">
          讀取中...
        </div>
      </Layout>
    );
  }

  /* ================================================================
     UI：玻璃感 Dashboard 風格
  ================================================================= */
  return (
    <Layout>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F2FF] via-[#F8FBFF] to-[#FFE5F7] flex items-center justify-center px-3 sm:px-6 py-8 sm:py-14">
        <div
          className="
            w-full max-w-[1320px]
            rounded-[32px] border border-white/70
            bg-white/60
            shadow-[0_28px_80px_rgba(15,23,42,0.20)]
            backdrop-blur-2xl
            px-4 sm:px-8 py-6 sm:py-8
            flex flex-col lg:flex-row gap-6 sm:gap-8
          "
        >
          {/* ================= 左側 Sidebar ================= */}
          <aside className="w-full lg:w-[260px]">
            <div className="mb-6">
              <p className="text-xs text-slate-500">Home &raquo; My account</p>
              <h1 className="mt-2 text-3xl sm:text-[32px] font-black tracking-wide text-slate-800">
                Dashboard
              </h1>
            </div>

            <div className="rounded-2xl bg-white/90 border border-white shadow-[0_18px_40px_rgba(148,163,184,0.35)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-500">
                  Menu
                </p>
              </div>

              <nav className="py-3">
                {[
                  { id: "info", label: "Dashboard / 會員資料" },
                  { id: "qrcode", label: "訂單與 QR Code" },
                  { id: "remit", label: "匯款資訊" },
                ].map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2 px-5 py-3 text-sm transition relative
                        ${
                          active
                            ? "text-[#0F172A] font-semibold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      {/* 左側高亮條 */}
                      <span
                        className={`absolute left-0 top-1 bottom-1 rounded-r-full transition-all ${
                          active
                            ? "w-[4px] bg-gradient-to-b from-[#38BDF8] to-[#6366F1]"
                            : "w-[2px] bg-transparent"
                        }`}
                      />
                      <span
                        className={`flex-1 rounded-xl px-3 py-2 text-left transition
                          ${
                            active
                              ? "bg-gradient-to-r from-[#E0F2FE] via-white to-[#F1EAFF] shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
                              : "bg-transparent"
                          }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ================= 右側主要內容 ================= */}
          <section className="flex-1 flex flex-col gap-6">
            {/* 歡迎卡片 */}
            <div className="rounded-2xl bg-white/80 border border-white shadow-[0_20px_50px_rgba(148,163,184,0.3)] p-6 sm:p-7">
              <p className="text-sm text-slate-500 mb-1">Welcome back,</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800">
                {userInfo.name || "會員"}
              </p>
            </div>

            {/* 內容卡片 */}
            <div className="flex-1 rounded-2xl bg-white/85 border border-white shadow-[0_20px_50px_rgba(148,163,184,0.35)] p-6 sm:p-8 min-h-[420px]">
              <AnimatePresence mode="wait">
                {/* ----------- 會員資料 ----------- */}
                {activeTab === "info" && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                        會員資料
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        管理您的基本聯絡資料與帳號資訊。
                      </p>
                    </div>

                    {editMode ? (
                      <div className="space-y-4 max-w-lg">
                        <div>
                          <label className="text-xs font-semibold text-slate-500">
                            姓名
                          </label>
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                            placeholder="姓名"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">
                            Email
                          </label>
                          <input
                            value={editingEmail}
                            onChange={(e) => setEditingEmail(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                            placeholder="Email"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">
                            電話
                          </label>
                          <input
                            value={editingPhone}
                            onChange={(e) => setEditingPhone(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                            placeholder="電話"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleProfileUpdate}
                            className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-semibold shadow-sm hover:brightness-110"
                          >
                            儲存
                          </button>
                          <button
                            onClick={() => setEditMode(false)}
                            className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-1 text-sm text-slate-700">
                          <p>
                            <span className="font-semibold">姓名：</span>
                            {userInfo.name}
                          </p>
                          <p>
                            <span className="font-semibold">Email：</span>
                            {userInfo.email}
                          </p>
                          <p>
                            <span className="font-semibold">電話：</span>
                            {userInfo.meta?.billing_phone || (
                              <span className="text-slate-400">(未填寫)</span>
                            )}
                          </p>
                        </div>

                        <button
                          onClick={() => setEditMode(true)}
                          className="inline-flex items-center rounded-full border border-sky-400/70 px-4 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50"
                        >
                          修改會員資料
                        </button>

                        <div className="pt-4 border-t border-slate-100">
                          <h3 className="text-lg font-semibold text-slate-800 mb-3">
                            我的最愛
                          </h3>
                          {favorites.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              尚未加入任何商品到最愛清單。
                            </p>
                          ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {favorites.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm"
                                >
                                  <Image
                                    src={item.image || "/images/default.jpg"}
                                    alt={item.name}
                                    width={72}
                                    height={72}
                                    className="rounded-xl object-cover"
                                  />
                                  <p className="text-sm font-medium text-slate-800">
                                    {item.name}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ----------- QR CODE 訂單 ----------- */}
                {activeTab === "qrcode" && (
                  <motion.div
                    key="qrcode"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                        我的訂單 &amp; eSIM
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        查看您的歷史訂單與 eSIM 相關資訊。
                      </p>
                    </div>

                    {ordersLoading ? (
                      <OrderSkeletonGrid />
                    ) : orders.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        尚無訂單紀錄，歡迎前往商店選購 eSIM 方案。
                      </p>
                    ) : (
                      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {orders.map((order) => {
                          const qrCodes = getEsimQRCodes(order);

                          return (
                            <li
                              key={order.id}
                              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm flex flex-col gap-3"
                            >
                              <p className="text-xs text-slate-500">訂單編號</p>
                              <p className="text-sm font-semibold text-slate-900">
                                #{order.id}
                              </p>

                              <div className="text-xs text-slate-500">
                                <p>
                                  狀態：
                                  <span className="font-semibold text-slate-800">
                                    {statusLabel(order.status)}
                                  </span>
                                </p>
                                <p>
                                  金額：NT$
                                  <span className="font-semibold">
                                    {formatNTDNoDecimals(order.total)}
                                  </span>
                                </p>
                                <p>
                                  日期：
                                  {new Date(
                                    order.date_created
                                  ).toLocaleDateString("zh-TW")}
                                </p>
                              </div>

                              {order.line_items?.length > 0 && (
                                <div className="mt-1">
                                  <p className="text-xs font-semibold text-slate-600 mb-1">
                                    商品內容
                                  </p>
                                  <ul className="space-y-1 text-xs text-slate-700">
                                    {order.line_items.map((item) => (
                                      <li key={item.id}>• {item.name}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {qrCodes.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold text-slate-600 mb-2">
                                    eSIM QR Code
                                  </p>
                                  <div className="grid grid-cols-2 gap-3">
                                    {qrCodes.map((src, i) => (
                                      <div
                                        key={i}
                                        className="aspect-square flex items-center justify-center rounded-xl bg-white border border-slate-200"
                                      >
                                        <Image
                                          src={src}
                                          alt={`Order ${order.id} QR Code #${
                                            i + 1
                                          }`}
                                          width={128}
                                          height={128}
                                          className="rounded-lg object-contain"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </motion.div>
                )}

                {/* ----------- 匯款資訊 ----------- */}
                {activeTab === "remit" && (
                  <motion.div
                    key="remit"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                        匯款 / 繳費資訊
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        若您選擇匯款或超商代碼，相關資訊會顯示在此區域。
                      </p>
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 text-sm text-slate-700 shadow-sm">
                      目前沒有待匯款的訂單。若您剛完成付款，稍待數分鐘後系統會自動更新狀態。
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
