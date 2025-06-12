import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { useCart } from "../components/context/CartContext";
import Image from "next/image";

const CheckoutPage = () => {
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    paymentMethod: "Credit",
    shippingMethod: "宅配",
    storeInfo: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storeData = localStorage.getItem("ecpay_cvs_store");
      if (storeData) {
        setFormData((prev) => ({
          ...prev,
          storeInfo: JSON.parse(storeData),
        }));
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      alert("請填寫所有必填欄位");
      return;
    }

    const newWindow = window.open("about:blank");

    try {
      const res = await fetch("/api/generate-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cartItems, orderInfo: formData }),
      });

      const html = await res.text();
      newWindow.document.write(html);
      newWindow.document.close();
    } catch (err) {
      console.error("建立訂單失敗", err);
      newWindow.close();
      alert("送出失敗，請稍後再試");
    }
  };

  const handleLogisticsTest = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/ecpay-create-test-logistics";
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <Layout>
      <div className="pt-[200px] px-[30px] w-full mx-auto">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row max-w-[1920px] w-[95%] mx-auto"
        >
          <div className=" w-full lg:w-1/2 flex flex-col">
            <h2 className="text-xl font-bold">結帳資訊</h2>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="姓名"
              className="border p-2 rounded"
              required
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 rounded"
              required
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="手機號碼"
              className="border p-2 rounded"
              required
            />

            <select
              name="shippingMethod"
              value={formData.shippingMethod}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="宅配">宅配</option>
              <option value="超商取貨">超商取貨</option>
            </select>

            {formData.shippingMethod === "超商取貨" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      "/api/ecpay-cvs-map-redirect",
                      "_blank",
                      "width=800,height=600"
                    );
                  }}
                  className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                  選擇超商門市
                </button>
                {formData.storeInfo && (
                  <div className="border p-2 rounded text-sm">
                    <p>選擇門市：{formData.storeInfo.StoreName}</p>
                    <p>地址：{formData.storeInfo.StoreAddress}</p>
                    <p>電話：{formData.storeInfo.StoreTel}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogisticsTest}
                  className="mt-2 bg-gray-800 text-white px-4 py-2 rounded"
                >
                  產生測試物流訂單（超商B2C）
                </button>
              </>
            )}
          </div>
          <div className=" w-full lg:w-1/2 p-10 ">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                購物車內容
              </h3>
              {cartItems.length === 0 ? (
                <p className="text-gray-500">購物車是空的</p>
              ) : (
                <ul className="space-y-4">
                  {cartItems.map((item, index) => (
                    <li
                      key={index}
                      className=" bg-[#f8f8fa] p-8 border-gray-200 border-2 flex flex-row rounded-[20px] items-center gap-4 border-b pb-4"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-xl max-w-[200px]"
                      />
                      <div className="flex flex-col w-full pl-5">
                        <span className="font-bold">{item.name}</span>
                        <span className="text-sm text-gray-600">
                          國家：{item.color} / 規格：{item.size}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <label className="text-sm">數量：</label>
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            onChange={(e) =>
                              updateQuantity(
                                item.id,
                                item.color,
                                item.size,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 rounded-[10px] px-2 py-1 text-sm border "
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.id, item.color, item.size)
                            }
                            className="text-red-500 hover:underline text-sm"
                          >
                            移除
                          </button>
                        </div>
                        <span className="text-sm font-medium mt-1">
                          小計：${item.price * item.quantity}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-right font-bold mt-4">總金額：${totalPrice}</p>
            </div>

            <button
              type="submit"
              className="hover:bg-gray-900 bg-gray-800 text-white px-6 py-2 rounded-[10px] mt-4"
            >
              確認送出並前往付款
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
