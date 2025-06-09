import React, { useState } from "react";
import { useCart } from "../components/context/CartContext"; // 引入 useCart hook
import Sidebar from "../components/Sidebar";

const ProductDetail = () => {
  const { addProductToCart } = useCart(); // 讀取全局狀態
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 測試用的商品列表
  const productList = [
    {
      name: "泡泡袖吊帶迷你裙套裝",
      price: 390,
      variant: { color: "紅色", size: "M" },
    },
    {
      name: "休閒牛仔外套",
      price: 890,
      variant: { color: "藍色", size: "L" },
    },
    {
      name: "印花短袖T恤",
      price: 290,
      variant: { color: "白色", size: "S" },
    },
    {
      name: "高腰修身牛仔褲",
      price: 690,
      variant: { color: "黑色", size: "M" },
    },
  ];

  const handleAddToCart = () => {
    if (!selectedProduct) return; // 確保有選擇商品

    const productToAdd = {
      ...selectedProduct,
      quantity,
      totalPrice: selectedProduct.price * quantity,
    };

    addProductToCart(productToAdd); // 更新全局狀態
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">產品詳情</h1>

      {/* 選擇商品 */}
      <select
        className="border p-2 mb-4"
        onChange={(e) => {
          const selectedIndex = e.target.value;
          setSelectedProduct(
            selectedIndex !== "" ? productList[selectedIndex] : null
          );
        }}
      >
        <option value="">選擇商品</option>
        {productList.map((product, index) => (
          <option key={index} value={index}>
            {product.name} - {product.variant.color} / {product.variant.size}
          </option>
        ))}
      </select>

      {/* 顯示選擇的商品資訊 */}
      {selectedProduct && (
        <div className="border p-4 mb-4">
          <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
          <p>價格: ${selectedProduct.price}</p>
          <p>顏色: {selectedProduct.variant.color}</p>
          <p>尺寸: {selectedProduct.variant.size}</p>

          {/* 調整數量 */}
          <label className="block mt-2">數量:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            min="1"
            className="border p-2 w-16"
          />

          <button
            onClick={handleAddToCart}
            className="bg-blue-500 text-white p-2 mt-4 block w-full"
          >
            加入購物車
          </button>
        </div>
      )}

      {/* 傳遞 sidebarProduct 到 Sidebar 組件 */}
      <Sidebar />
    </div>
  );
};

export default ProductDetail;
