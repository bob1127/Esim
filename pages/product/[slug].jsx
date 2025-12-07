import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useCart } from "../../components/context/CartContext";
import Layout from "../Layout";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import PLAN_ID_MAP from "../../lib/esim/planMap";

// --- 輔助函式與設定 ---
const getWooCommerceUrl = (endpoint, params = {}) => {
  const baseUrl = process.env.WORDPRESS_URL;
  const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const queryString = new URLSearchParams({
    consumer_key: ck,
    consumer_secret: cs,
    ...params,
  }).toString();
  return `${baseUrl}/wp-json/wc/v3/${endpoint}?${queryString}`;
};

const extractImageFromDescription = (html) => {
  const match = html?.match(/<img[^>]+src="([^">]+)"/);
  return match?.[1] || null;
};

const stripHtml = (html) =>
  html ? html.replace(/<[^>]*>?/gm, "").substring(0, 160) + "..." : "";

// --- UI 元件：極簡風格摺疊選單 ---
const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200 last:border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group"
      >
        <span className="font-medium text-gray-900 text-base tracking-wide uppercase">
          {title}
        </span>
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 pt-1 text-gray-600 leading-relaxed text-sm">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 主要頁面邏輯 ---
export async function getStaticPaths() {
  try {
    const apiUrl = getWooCommerceUrl("products", { per_page: 100 });
    const res = await fetch(apiUrl);
    const products = await res.json();
    if (!Array.isArray(products)) return { paths: [], fallback: "blocking" };
    return {
      paths: products.map((product) => ({ params: { slug: product.slug } })),
      fallback: "blocking",
    };
  } catch (err) {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      getWooCommerceUrl("products", { slug: params.slug })
    );
    const data = await res.json();
    if (!data || data.length === 0) return { notFound: true };
    const product = data[0];

    let variations = [];
    if (product.type === "variable") {
      const varRes = await fetch(
        getWooCommerceUrl(`products/${product.id}/variations`, { per_page: 50 })
      );
      if (varRes.ok) variations = await varRes.json();
    }

    console.log(`✅ [ISR Update] 商品已更新: ${product.name}`);
    return { props: { product, variations }, revalidate: 10 };
  } catch (err) {
    return { notFound: true };
  }
}

export default function ProductPage({ product, variations = [] }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentVariation, setCurrentVariation] = useState(null);
  const [displayPrice, setDisplayPrice] = useState(product?.price);

  useEffect(() => {
    if (product?.type === "variable" && variations.length > 0) {
      const allSelected = product.attributes.every(
        (attr) => selectedAttributes[attr.name]
      );
      if (allSelected) {
        const match = variations.find((v) =>
          v.attributes.every(
            (vAttr) => vAttr.option === selectedAttributes[vAttr.name]
          )
        );
        if (match) {
          setCurrentVariation(match);
          setDisplayPrice(match.price);
        }
      }
    }
  }, [selectedAttributes, product, variations]);

  const handleAttributeSelect = (attributeName, option) => {
    setSelectedAttributes((prev) => ({ ...prev, [attributeName]: option }));
  };

  const handleAddToCart = () => {
    if (product.type === "variable" && !currentVariation) {
      alert("請先選擇商品規格");
      return;
    }
    const finalProduct = currentVariation || product;
    const image =
      finalProduct.image?.src ||
      product.images?.[0]?.src ||
      extractImageFromDescription(product.description) ||
      "/default-image.jpg";
    const cleanedSku = (finalProduct.sku || "").trim().replace(/\u200B/g, "");
    const planId =
      PLAN_ID_MAP[cleanedSku] ||
      finalProduct.meta_data?.find((m) => m.key === "esim_plan_id")?.value ||
      null;
    let cartItemName = product.name;
    if (currentVariation) {
      cartItemName = `${product.name} - ${currentVariation.attributes
        .map((a) => a.option)
        .join(" / ")}`;
    }
    addToCart({
      id: finalProduct.id,
      parentId: product.id,
      name: cartItemName,
      price: finalProduct.price,
      sku: cleanedSku,
      planId,
      image,
      quantity,
    });
    setTimeout(() => {
      const event = new Event("open-cart-sidebar");
      window.dispatchEvent(event);
    }, 500);
  };

  if (router.isFallback)
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          載入中...
        </div>
      </Layout>
    );

  // SEO Info
  const seoTitle = `${product.name} | FeGo eSIM`;
  const seoDesc = stripHtml(product.short_description || product.description);
  const seoImage = product.images?.[0]?.src || "/default-image.jpg";
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: [seoImage],
    description: seoDesc,
    sku: product.sku || product.id,
    brand: { "@type": "Brand", name: "FeGo eSIM" },
    offers: {
      "@type": "Offer",
      url: currentUrl,
      priceCurrency: "TWD",
      price: displayPrice || product.price,
      availability: "https://schema.org/InStock",
    },
  };

  const images = product.images?.length
    ? product.images
    : [{ src: seoImage, alt: product.name }];

  return (
    <Layout>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      </Head>

      <div className="max-w-6xl mx-auto py-10 px-4 md:px-8">
        {/* 上半部：圖片 + 購買資訊 */}
        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          {/* 左側：圖片輪播 (經典配置：左縮圖 + 右大圖) */}
          <div className="w-full lg:w-3/5 flex lg:flex-row flex-col-reverse gap-4 items-start h-[500px]">
            {/* 1. 垂直縮圖列表 (Desktop) */}
            <div className="hidden lg:flex flex-col items-center gap-3 w-[80px] shrink-0 h-full">
              <button
                onClick={() => mainSwiper?.slidePrev()}
                className="w-full h-8 flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
              >
                ▲
              </button>

              <Swiper
                onSwiper={setThumbsSwiper}
                direction="vertical"
                spaceBetween={12}
                slidesPerView="auto"
                modules={[FreeMode, Thumbs]}
                className="w-full flex-1"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx} className="!h-[80px]">
                    <div className="w-full h-full relative border border-gray-200 rounded cursor-pointer overflow-hidden hover:border-black transition-all">
                      <Image
                        src={img.src}
                        alt="thumb"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                onClick={() => mainSwiper?.slideNext()}
                className="w-full h-8 flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
              >
                ▼
              </button>
            </div>

            {/* 2. 大圖區塊 */}
            {/* 強制設定為 h-full 讓它跟左側縮圖列表一樣高，並保持 object-contain */}
            <div className="w-full h-full relative border border-gray-100 bg-gray-50 rounded-lg overflow-hidden flex-1">
              <Swiper
                onSwiper={setMainSwiper}
                loop={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="w-full h-full"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="w-full h-full relative flex items-center justify-center bg-gray-50">
                      <Image
                        src={img.src}
                        alt="main"
                        fill
                        className="object-contain"
                        priority={idx === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* 手機版縮圖 */}
            <div className="flex lg:hidden w-full overflow-x-auto gap-2 pb-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => mainSwiper?.slideTo(idx)}
                  className="w-[60px] h-[60px] relative shrink-0 border border-gray-200 rounded overflow-hidden"
                >
                  <Image
                    src={img.src}
                    alt="thumb-mobile"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 右側：商品資訊 */}
          <div className="w-full lg:w-2/5 flex flex-col justify-start">
            <h1 className="text-2xl font-medium mb-2 text-gray-900 tracking-wide">
              {product.name}
            </h1>
            <p className="text-2xl text-gray-900 font-bold mb-6">
              NT${displayPrice || product.price}
            </p>

            {/* 短描述 */}
            {product.short_description && (
              <div
                className="text-sm text-gray-600 mb-8 leading-relaxed border-b border-gray-200 pb-6"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {/* 規格選擇器 */}
            {product.type === "variable" && product.attributes && (
              <div className="mb-6 space-y-5">
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="flex flex-col">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {attr.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((option) => (
                        <button
                          key={option}
                          onClick={() =>
                            handleAttributeSelect(attr.name, option)
                          }
                          className={`px-4 py-2 border text-sm transition-all ${
                            selectedAttributes[attr.name] === option
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 數量與按鈕 */}
            <div className="flex gap-4 mb-10">
              <div className="flex items-center border border-gray-300 h-[48px] w-[120px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full hover:bg-gray-50"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.type === "variable" && !currentVariation}
                className={`flex-1 h-[48px] text-sm font-bold uppercase tracking-widest transition-all ${
                  product.type === "variable" && !currentVariation
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {product.type === "variable" && !currentVariation
                  ? "請選擇規格"
                  : "加入購物車"}
              </button>
            </div>

            {/* 右側摺疊選單 (Shopify Style) */}
            <div className="border-t border-gray-200">
              <AccordionItem title="流量公平使用原則 (FUP)">
                <p className="mb-4">
                  為了維護網路品質，原生卡設有公平使用機制：
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>
                    <strong>高速流量期間：</strong>享受 4G/5G 極速上網。
                  </li>
                  <li>
                    <strong>若超過限制：</strong>網速將降至
                    128~256kbps，不會斷網，隔日 00:00 恢復。
                  </li>
                </ul>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                  <div className="col-span-2 font-bold mb-1">
                    降速後 (128kbps) 支援性：
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span>LINE 文字</span> <span>✅</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span>Google Maps</span> <span>✅</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span>Email</span> <span>✅</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1 text-gray-400">
                    <span>Youtube</span> <span>❌</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1 text-gray-400">
                    <span>IG 限動</span> <span>❌</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1 text-gray-400">
                    <span>視訊通話</span> <span>❌</span>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="安裝與啟用說明">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>下單付款後，QR Code 將發送至您的 Email。</li>
                  <li>
                    <strong>出發前：</strong>可先在台灣掃描加入
                    eSIM，但請勿開啟數據漫遊。
                  </li>
                  <li>
                    <strong>抵達後：</strong>將 eSIM
                    設為主要數據，並開啟「數據漫遊」即可上網。
                  </li>
                  <li>若無法上網，請檢查 APN 設定 (詳見 Email 說明)。</li>
                </ol>
                <p className="mt-4 text-xs text-gray-400">
                  *適用機型：iPhone XR/XS 以上，以及支援 eSIM 的 Android 手機。
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>

        {/* 下半部：詳細介紹 (美化渲染 WordPress 內容) */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-8 text-gray-900 tracking-wide uppercase">
            商品詳細介紹
          </h2>

          {/* 🔥 這裡做了 Prose 優化：自動美化你在後台貼的表格和清單 */}
          <article
            className="prose prose-lg prose-gray max-w-4xl mx-auto leading-loose text-gray-700
                       prose-headings:font-bold prose-headings:text-gray-900
                       prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                       prose-table:border prose-table:border-gray-200 prose-table:shadow-sm prose-table:rounded-lg
                       prose-th:bg-gray-50 prose-th:p-4 prose-th:text-gray-700 prose-th:font-bold prose-th:border-b
                       prose-td:p-4 prose-td:border-b prose-td:border-gray-100 first:prose-td:font-medium first:prose-td:text-gray-900
                       prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </div>
    </Layout>
  );
}
