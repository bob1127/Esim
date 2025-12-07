// pages/Cart.tsx
import { useCart } from "../components/context/CartContext";
import Layout from "./Layout";
import Link from "next/link";
import SwiperCard from "../components/SwiperCarousel/AnotherProduct";
import { useState, useEffect } from "react";
import CheckoutPage from "./checkout";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import CheckoutForm from "../components/CheckoutForm";
import StepLabel from "@mui/material/StepLabel";
import Box from "@mui/material/Box";
import { motion, AnimatePresence } from "framer-motion";

// Icons for the design matching (using simple svg or material icons concepts)
// 如果你有特定的 icon library 可以替換這裡
const TruckIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
    />
  </svg>
);
const SecurityIcon = () => (
  <svg
    className="w-4 h-4 mr-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const steps = ["購物車", "填寫資料", "完成訂單"];

const CartPage = () => {
  const { cartItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [removingIndex, setRemovingIndex] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleRemoveWithAnimation = (index, id, color, size) => {
    setRemovingIndex(index);
    setTimeout(() => {
      removeFromCart(id, color, size);
      setRemovingIndex(null);
    }, 300);
  };

  // 取得網址參數中的 orderNo
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNo = urlParams.get("orderNo");

    if (orderNo) {
      fetch(`/api/order-status-for-cart?orderNo=${orderNo}`)
        .then((res) => res.json())
        .then((data) => setOrderStatus(data))
        .catch((err) => console.error("查詢訂單失敗", err));
    }
  }, []);

  // 取得預計送達日期 (模擬截圖中的日期邏輯，顯示一週後)
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return `${date.getMonth() + 1}月${date.getDate()}日，${
      ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][
        date.getDay()
      ]
    }`;
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white min-h-screen"
      >
        <div className="pt-[120px]  max-w-[1600px] mx-auto">
          {/* Stepper 保留但不搶眼 */}
          <Box sx={{ width: "100%", marginBottom: "3rem" }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                {/* 標題區 */}
                <div className="mb-8">
                  <h1 className="text-3xl font-normal text-gray-900">
                    袋內物品數量：
                    <span className="font-bold">{cartItems.length}</span>
                  </h1>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-xl text-gray-600 mb-4">
                      您的購物車是空的
                    </p>
                    <Link href="/" className="text-blue-600 hover:underline">
                      繼續選購商品
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-12">
                    {/* 左側：商品列表 */}
                    <div className="w-full lg:w-[65%] space-y-8">
                      {cartItems.map((item, index) => (
                        <motion.div
                          key={item.id + item.color + item.size}
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-8 ${
                            removingIndex === index ? "opacity-50" : ""
                          }`}
                        >
                          {/* 商品圖片 */}
                          <div className="w-full md:w-[150px] flex-shrink-0 flex items-start justify-center bg-[#ffffff] rounded-lg p-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-auto object-contain mix-blend-multiply"
                            />
                          </div>

                          {/* 商品資訊區 */}
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h2 className="text-xl font-bold text-gray-900">
                                {item.name}
                              </h2>
                              <p className="text-lg font-bold text-gray-900">
                                ${item.price}
                              </p>
                            </div>

                            {/* 規格顯示 */}
                            <p className="text-gray-500 text-sm mb-4">
                              {item.color} / {item.size}
                            </p>

                            {/* 灰底資訊區塊 (模仿截圖) */}
                            <div className="bg-[#f5f6f7] rounded-md p-4 mb-4">
                              <div className="mb-2">
                                <span className="font-bold text-sm text-gray-900">
                                  可用性
                                </span>
                                <p className="text-sm text-gray-600 mt-1">
                                  現貨供應
                                </p>
                              </div>
                              <div className="flex items-start text-sm text-gray-800">
                                <TruckIcon />
                                <span>
                                  預計送達日期：
                                  <span className="font-bold">
                                    {getDeliveryDate()}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* 數量與刪除控制區 */}
                            <div className="flex justify-between items-end mt-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700">
                                  數量：
                                </span>
                                {/* 模擬下拉選單樣式的數量控制器 */}
                                <div className="flex items-center text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer select-none">
                                  <button
                                    className="px-2 py-1 text-lg leading-none hover:bg-gray-100 rounded"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        item.color,
                                        item.size,
                                        item.quantity - 1
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="mx-2">{item.quantity}</span>
                                  <button
                                    className="px-2 py-1 text-lg leading-none hover:bg-gray-100 rounded"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        item.color,
                                        item.size,
                                        item.quantity + 1
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <button
                                className="text-blue-600 text-sm font-medium hover:underline"
                                onClick={() =>
                                  handleRemoveWithAnimation(
                                    index,
                                    item.id,
                                    item.color,
                                    item.size
                                  )
                                }
                              >
                                刪除
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* 右側：訂單摘要 (Sticky Sidebar) */}
                    <div className="w-full lg:w-[35%]">
                      <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 text-gray-900">
                          訂單摘要
                        </h3>

                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between text-gray-600">
                            <span>小計</span>
                            <span className="font-medium text-gray-900">
                              ${totalPrice}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span className="text-blue-600 font-medium">
                              新增優惠代碼
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>運費</span>
                            <span className="text-gray-900">自由的 (Free)</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>消費稅</span>
                            <span className="text-gray-900">
                              已包含在顯示價格中
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 my-4 pt-4">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-xl font-bold text-gray-900">
                              全部的
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              ${totalPrice}元
                            </span>
                          </div>

                          <button
                            onClick={handleNext}
                            className="w-full bg-[#0064e0] hover:bg-[#0052b5] text-white font-bold py-4 px-6 rounded-full transition-colors text-lg shadow-md"
                          >
                            查看 (Checkout)
                          </button>
                        </div>

                        <div className="flex justify-center items-center gap-4 text-xs text-gray-500 mt-4">
                          <span className="flex items-center">
                            <SecurityIcon /> 免運費
                          </span>
                          <span className="flex items-center">
                            <SecurityIcon /> 較長的報酬期
                          </span>
                          <span className="flex items-center">
                            <SecurityIcon /> 保證
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 1 & 2: 保持原本邏輯，但稍微置中優化版面 */}
            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className=" max-w-[1600px] mx-auto py-10"
              >
                <CheckoutForm onBack={handleBack} onNext={handleNext} />
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto px-4 py-20 bg-white border rounded-xl shadow-sm mt-8 text-center"
              >
                <h1 className="text-3xl font-bold mb-6 text-gray-900">
                  感謝您的訂購
                </h1>
                {orderStatus ? (
                  <div className="space-y-4 text-left inline-block w-full max-w-md">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="flex justify-between border-b pb-2 mb-2">
                        <span>付款狀態：</span>
                        <span className="font-bold">{orderStatus.status}</span>
                      </p>
                      <p className="flex justify-between border-b pb-2 mb-2">
                        <span>訂單編號：</span>
                        <span className="font-bold">{orderStatus.orderNo}</span>
                      </p>
                      <p className="flex justify-between border-b pb-2 mb-2">
                        <span>付款方式：</span>
                        <span>{orderStatus.payment_method_title}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>付款時間：</span>
                        <span>{orderStatus.date_paid}</span>
                      </p>
                    </div>
                    {orderStatus.qrcode && (
                      <div className="text-center mt-6">
                        <p className="mb-2 font-bold text-gray-700">
                          請掃描下方 QRCode 啟用 eSIM
                        </p>
                        <img
                          src={orderStatus.qrcode}
                          alt="eSIM QRCode"
                          className="mx-auto max-w-[200px] border p-2 rounded"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p>正在查詢訂單資訊...</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 推薦商品區 */}
        <div className="border-t border-gray-200 mt-20 pt-10">
          <SwiperCard />
        </div>
      </motion.div>
    </Layout>
  );
};

export default CartPage;
