"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "../components/context/CartContext";
import Image from "next/image";
import { motion } from "framer-motion";
import PLAN_ID_MAP from "../lib/esim/planMap";

// --- Helper: SKU 轉換 ---
const getPlanIdFromSku = (sku) => {
  const rawSkuToPlanId = {
    "MY-1DAY-DAILY500MB": "Malaysia-Daily500MB-1-A0",
  };
  const cleaned = sku
    ?.trim()
    .replace(/\u200B/g, "")
    .toUpperCase();
  return rawSkuToPlanId[cleaned] || null;
};

// --- Component: 浮動標籤輸入框 (Shopify 風格核心) ---
const FloatingInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div className="relative w-full">
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder} // 需要 placeholder 來觸發 peer-placeholder-shown
      className="peer w-full border border-gray-300 rounded-md px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow"
      required={required}
    />
    <label
      htmlFor={name}
      className="absolute left-3 top-1 text-xs text-gray-500 transition-all 
                 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 
                 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-600 pointer-events-none"
    >
      {label}
    </label>
  </div>
);

const CheckoutPage = ({ onBack, onNext }) => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  // --- Logic: 計算小計 ---
  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + it.price * it.quantity, 0),
    [cartItems]
  );

  // --- State: 表單與折扣 ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "Taiwan",
    city: "",
    address: "",
    postalCode: "",
    saveInfo: false,
    newsOffers: true,
  });

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponInfo, setCouponInfo] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);

  const finalTotal = Math.max(subtotal - discount, 0);

  // --- Effect: 載入預存資料 ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setMemberInfo(user);
        setFormData((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        }));
      }
    }
  }, []);

  // --- Effect: 購物車變動重算折扣 ---
  useEffect(() => {
    if (couponApplied && couponInfo?.code) {
      void reapplyCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Logic: 優惠券相關 ---
  const reapplyCoupon = async () => {
    if (!couponInfo?.code) return;
    try {
      const code = couponInfo.code.toLowerCase();
      const res = await fetch(
        `/api/validate-coupon?code=${encodeURIComponent(
          code
        )}&subtotal=${subtotal}`
      );
      const data = await res.json();
      if (data.valid) {
        setDiscount(Number(data.discount ?? 0));
        setCouponInfo({
          code: data.code,
          type: data.type,
          amount: Number(data.amount),
        });
      } else {
        setDiscount(0);
        setCouponApplied(false);
        setCouponInfo(null);
      }
    } catch {
      /* ignore */
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const code = couponCode.trim().toLowerCase();
      const res = await fetch(
        `/api/validate-coupon?code=${encodeURIComponent(
          code
        )}&subtotal=${subtotal}`
      );
      const data = await res.json();

      if (data.valid) {
        setDiscount(Number(data.discount ?? 0));
        setCouponApplied(true);
        setCouponInfo({
          code: data.code,
          type: data.type,
          amount: Number(data.amount),
        });
      } else {
        alert(data.message || "優惠碼無效");
        setDiscount(0);
        setCouponApplied(false);
        setCouponInfo(null);
      }
    } catch (err) {
      console.error("❌ 驗證失敗", err);
      alert("套用優惠碼時發生錯誤");
    }
  };

  // --- Logic: 建立訂單 (NewebPay) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      alert("請填寫所有必填欄位 (含地址)");
      return;
    }
    if (cartItems.length === 0) {
      alert("購物車為空");
      return;
    }

    const newWindow = window.open("about:blank");
    try {
      const enrichedItems = cartItems.map((item) => {
        const cleanedSku = item.sku
          ?.trim()
          .replace(/\u200B/g, "")
          .replace(/,/g, "-");
        const resolvedPlanId = item.planId || PLAN_ID_MAP[cleanedSku];
        return { ...item, planId: resolvedPlanId };
      });

      const res = await fetch("/api/newebpay-generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: enrichedItems,
          totalPrice: finalTotal,
          orderInfo: {
            ...formData,
            customerId: memberInfo?.id || 0,
            couponCode: couponInfo?.code || couponCode,
            discount,
          },
        }),
      });

      const html = await res.text();
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
      if (onNext) onNext();
    } catch (err) {
      console.error("❌ 建立訂單失敗", err);
      if (newWindow) newWindow.close();
      alert("送出失敗，請稍後再試");
    }
  };

  const handleLinePaySubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("請填寫所有必填欄位");
      return;
    }
    alert("正在呼叫 LINE Pay...");
  };

  // --- Render ---
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white font-sans"
    >
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* === 左側：表單區 (白色背景) === */}
        {/* 調整寬度比例：左側佔 55-60%，右側佔 40-45%，讓表單更寬敞 */}
        <div className="w-full lg:w-[58%] px-4 md:px-8 lg:px-16 xl:px-24 py-8 lg:py-12 order-2 lg:order-1 border-r border-gray-200">
          {/* Logo & Breadcrumbs */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4 tracking-tight text-gray-900">
              eSIM
            </h1>
            <nav className="text-xs flex gap-2 text-gray-500 mb-6">
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={onBack}
              >
                購物車
              </span>
              <span>&gt;</span>
              <span className="text-gray-900 font-medium">填寫資料</span>
              <span>&gt;</span>
              <span>運送</span>
              <span>&gt;</span>
              <span>付款</span>
            </nav>
          </div>

          {/* Express Checkout */}
          <div className="mb-8">
            <p className="text-xs text-center text-gray-500 mb-3">
              快速結帳 (Express checkout)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleLinePaySubmit}
                className="bg-[#00C300] hover:bg-[#009f00] text-white py-2.5 rounded-[4px] font-bold text-lg flex justify-center items-center transition-colors shadow-sm"
              >
                LINE Pay
              </button>
              <button
                onClick={handleSubmit}
                className="bg-black hover:bg-gray-800 text-white py-2.5 rounded-[4px] font-bold text-lg flex justify-center items-center transition-colors shadow-sm"
              >
                <span className="mr-1">G</span>Pay
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">或</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit}>
            {/* Contact */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">聯絡資訊</h2>
                {!memberInfo && (
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    登入
                  </button>
                )}
              </div>
              <FloatingInput
                label="電子郵件 (Email)"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="電子郵件"
                required
              />
              <div className="mt-3 flex items-center">
                <input
                  id="newsOffers"
                  name="newsOffers"
                  type="checkbox"
                  checked={formData.newsOffers}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="newsOffers"
                  className="ml-2 block text-sm text-gray-600 cursor-pointer"
                >
                  訂閱最新優惠與消息
                </label>
              </div>
            </div>

            {/* Delivery */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">運送地址</h2>
              <div className="space-y-3">
                {/* Country Select */}
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 pt-5 pb-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                  >
                    <option value="Taiwan">台灣 (Taiwan)</option>
                  </select>
                  <label className="absolute left-3 top-1 text-xs text-gray-500 pointer-events-none">
                    國家/地區
                  </label>
                  <div className="absolute right-3 top-4 pointer-events-none text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <FloatingInput
                    label="收件人姓名"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="收件人姓名"
                    required
                  />
                </div>

                <FloatingInput
                  label="地址 (路段、街、號)"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="地址"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput
                    label="城市 / 縣市"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="城市"
                  />
                  <FloatingInput
                    label="郵遞區號"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="郵遞區號"
                  />
                </div>

                <div className="relative">
                  <FloatingInput
                    label="手機號碼"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="手機號碼"
                    required
                  />
                  <div
                    className="absolute right-3 top-3.5 text-gray-400 cursor-help group"
                    title="物流配送時聯絡使用"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="mt-3 flex items-center">
                  <input
                    id="saveInfo"
                    name="saveInfo"
                    type="checkbox"
                    checked={formData.saveInfo}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="saveInfo"
                    className="ml-2 block text-sm text-gray-600 cursor-pointer"
                  >
                    儲存資料以便下次快速結帳
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-10 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors"
              >
                <span>&lt;</span> 返回購物車
              </button>

              <button
                type="submit"
                className="bg-[#1773b0] hover:bg-[#105a8d] text-white rounded-[5px] px-8 py-4 font-bold text-lg w-full md:w-auto shadow-md transition-all hover:shadow-lg transform active:scale-95"
              >
                前往付款
              </button>
            </div>
          </form>

          {/* Legal Links */}
          <div className="mt-12 border-t pt-4 flex flex-wrap gap-4 text-xs text-blue-600 underline">
            <a href="#">退換貨政策</a>
            <a href="#">隱私權條款</a>
            <a href="#">服務條款</a>
          </div>
        </div>

        {/* === 右側：訂單摘要 (灰色背景) === */}
        {/* 調整：增加 lg:pl-10 確保內容不貼邊，背景色延伸至全高 */}
        <div className="w-full lg:w-[42%] bg-[#fafafa] border-l border-gray-200 px-4 md:px-8 lg:px-10 py-8 lg:py-12 order-1 lg:order-2">
          <div className="max-w-[450px] mx-auto lg:mr-auto lg:ml-0 lg:sticky lg:top-10">
            {/* 產品列表 */}
            <ul className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-4"
                >
                  <div className="relative w-16 h-16 border border-gray-200 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-md">
                      {item.quantity}
                    </div>
                    <div className="w-full h-full relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1 mix-blend-multiply"
                      />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.color} / {item.size}
                    </p>
                  </div>

                  <div className="text-sm font-medium text-gray-900">
                    NT${(item.price * item.quantity).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>

            {/* 優惠碼輸入區 */}
            <div className="flex gap-3 mb-8 border-t border-gray-200 pt-6 border-b pb-6 border-dashed">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="折扣碼"
                  className="peer w-full border border-gray-300 rounded-md px-3 py-3 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-sm"
                />
                <label className="absolute left-3 top-[-10px] bg-[#fafafa] px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:top-[-10px] peer-focus:text-xs peer-focus:bg-[#fafafa] peer-focus:text-blue-600 pointer-events-none">
                  折扣碼
                </label>
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={!couponCode}
                className={`font-medium px-5 rounded-md transition-colors shadow-sm ${
                  couponCode
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-[#e5e7eb] text-gray-400 cursor-not-allowed border border-gray-300"
                }`}
              >
                套用
              </button>
            </div>

            {/* 價格摘要 */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>小計</span>
                <span className="text-gray-900 font-medium">
                  NT${subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>運費</span>
                <span className="text-xs text-gray-500">下一步計算</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span className="flex items-center gap-1">
                    折扣{" "}
                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-1">
                      {couponInfo?.code}
                    </span>
                  </span>
                  <span>-NT${discount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* 總計 */}
            <div className="flex justify-between items-center mt-6 border-t border-gray-200 pt-6">
              <span className="text-lg font-medium text-gray-900">總計</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-500">TWD</span>
                <span className="text-2xl font-bold text-gray-900">
                  NT${finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
