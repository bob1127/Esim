import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Navbar from "@/components/Navbar/Navbar.jsx";
import Banner from "@/components/banner";
import Footer from "@/components/ui/footer.jsx";
import Head from "next/head";
import Sidebar from "@/components/Sidebar.js"; // 引入側邊欄組件

export default function RootLayout({ children }) {
  const [sidebarProduct, setSidebarProduct] = useState(null); // 儲存購物車資料

  // handleAddToCart 用於更新 sidebarProduct
  const handleAddToCart = (product, quantity, selectedAttributes) => {
    const totalPrice = product.price * quantity; // 計算總價
    const variantId = getVariantId(selectedAttributes); // 根據選擇的屬性獲取變體 ID

    // 更新 sidebarProduct 狀態
    setSidebarProduct({
      name: product.name,
      price: product.price,
      quantity,
      totalPrice,
      variant: selectedAttributes,
      variantId,
    });
    
    // 顯示購物車側邊欄（根據需求控制顯示）
    setIsSidebarOpen(true);
  };

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <>
      <Head>
        <title>星嶼童裝-韓系童裝｜小童、嬰幼兒服飾、兒童服飾配件｜台中童裝</title>
        <meta name="description" content="韓系童裝｜小童、嬰幼兒服飾、兒童服飾配件｜台中童裝" />
        <meta name="keywords" content="產品, 購物, 優惠" />
        <meta name="author" content="星嶼童裝" />
        <link rel="icon" href="/fstarislandbaby-icon.ico" />
        <meta property="og:title" content="星嶼童裝-韓系童裝｜小童、嬰幼兒服飾、兒童服飾配件｜台中童裝" />
        <meta property="og:description" content="星嶼童裝-韓系童裝｜小童、嬰幼兒服飾、兒童服飾配件｜台中童裝" />
        <meta property="og:image" content="/default-og-image.jpg" />
        <meta property="og:url" content="https://www.starislandbaby.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="星嶼童裝-韓系童裝｜小童、嬰幼兒服飾、兒童服飾配件｜台中童裝" />
        <meta name="twitter:description" content="韓系童裝｜小童、嬰幼兒服飾、兒童服飾配件｜台中童裝" />
        <meta name="twitter:image" content="/default-og-image.jpg" />
      </Head>

        
      <div className=" min-h-screen ">
         

        <NextUIProvider>
          <NextThemesProvider attribute="class" defaultTheme="light">
            <Navbar />
         
               <Sidebar sidebarProduct={sidebarProduct} onAddToCart={handleAddToCart} />

            {/* 顯示 Sidebar 組件 */}
     
            {/* 這裡渲染 children，這部分會根據當前頁面的路由動態顯示 */}
            {children}
           
          </NextThemesProvider>
        </NextUIProvider>
        <Banner />
        <Footer />
      </div>
    </>
  );
}
