import { createContext, useState, useContext, useEffect } from "react";

// 创建一个空的购物车 context
const CartContext = createContext();

// CartProvider 组件，用于包裹应用并提供购物车上下文
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // 侧边栏打开状态

  // ✅ 页面载入时从 localStorage 读取购物车数据
  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems");
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  // ✅ 每次 cartItems 变化时写入 localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ 每次 cartItems 更新时重新计算总价
  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + parseFloat(item.price) * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product.color || !product.size) return;

    const existingItem = cartItems.find(
      (item) =>
        item.id === product.id &&
        item.color === product.color &&
        item.size === product.size
    );

    if (existingItem) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === existingItem.id &&
          item.color === existingItem.color &&
          item.size === existingItem.size
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
      );
    } else {
      setCartItems((prevItems) => [...prevItems, product]);
    }

    setIsOpen(true);
  };

  const removeFromCart = (productId, color, size) => {
    const updatedCartItems = cartItems.filter(
      (item) =>
        item.id !== productId ||
        item.color !== color ||
        item.size !== size
    );
    setCartItems(updatedCartItems);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
    setIsOpen(false);
  };

  const updateQuantity = (productId, color, size, newQuantity) => {
    if (newQuantity <= 0) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId &&
        item.color === color &&
        item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalPrice,
        isOpen,
        setIsOpen,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 自定义 Hook，方便其他组件使用购物车数据
export const useCart = () => useContext(CartContext);
