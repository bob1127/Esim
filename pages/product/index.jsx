// pages/product/index.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Layout from "../Layout.js"; // 請確認路徑是否正確，可能只需要 ../Layout
import CountryFilter from "../../components/NavbarTestSideBarToggle.jsx";
import { useRouter } from "next/router";
import SwiperCarousel from "../../components/SwiperCarousel/SwiperCard.jsx";
import FilterSideBar from "../../components/FilterSideBar";
import { motion } from "framer-motion";

// --- API 輔助函式 ---
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

// --- getStaticProps (抓取所有商品) ---
export async function getStaticProps() {
  try {
    // 1. 抓取所有分類 (給側邊欄用)
    const categoryUrl = getWooCommerceUrl("products/categories", {
      per_page: 100,
    });
    const catRes = await fetch(categoryUrl);
    const categories = await catRes.json();

    // 2. 抓取「所有」商品 (不篩選 Category)
    // 這裡 per_page 設為 50 或更多，看你首頁想顯示多少
    const productUrl = getWooCommerceUrl("products", {
      per_page: 50, 
      status: "publish", // 只抓公開的商品
    });

    const productRes = await fetch(productUrl);
    const products = await productRes.json();

    return {
      props: {
        categories: Array.isArray(categories) ? categories : [],
        initialProducts: Array.isArray(products) ? products : [],
      },
      revalidate: 60, // ISR: 每 60 秒更新一次
    };
  } catch (e) {
    console.error("❌ getStaticProps 錯誤：", e);
    return {
      props: { categories: [], initialProducts: [] },
      revalidate: 60,
    };
  }
}

// --- 主要元件 (邏輯與 CategoryPage 幾乎一樣) ---
const AllProductsPage = ({ categories, initialProducts }) => {
  const router = useRouter();
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [activeTags, setActiveTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  // 監聽路由 query 變化 (處理 URL 篩選參數)
  useEffect(() => {
    const tagsFromQuery = router.query.tags?.split(",").filter(Boolean) || [];
    setActiveTags(tagsFromQuery);
  }, [router.query.tags]);

  // 前端篩選邏輯
  useEffect(() => {
    if (!initialProducts) return;

    if (!activeTags || activeTags.length === 0) {
      setFilteredProducts(initialProducts);
    } else {
      const filtered = initialProducts.filter((product) => {
        // 檢查 Tags
        const tagMatch = activeTags.every((tag) =>
          product.tags?.some((t) => t.slug === tag || t.name === tag)
        );
        // 檢查 Categories (因為這是總覽頁，側邊欄篩選分類也要能運作)
        const categoryMatch = activeTags.some((tag) =>
          product.categories?.some((cat) => cat.slug === tag)
        );
        
        // 這裡邏輯依你的需求調整：是要 Tag 和 Category 同時符合，還是擇一
        // 目前是：如果標籤符合 OR 分類符合
        return tagMatch || categoryMatch;
      });
      setFilteredProducts(filtered);
      setCurrentPage(1);
    }
  }, [activeTags, initialProducts]);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  return (
    <Layout>
      <div className="flex flex-col bg-[#f9f9fa]">
        <section className="section_Hero w-full mx-auto">
          {/* 如果總覽頁想換標題，可以在這裡改 */}
          <SwiperCarousel /> 
        </section>

        <div className="filter-wrap flex lg:flex-row flex-col sm:px-5 px-4 md:px-10 min-h-screen">
          {/* 左側篩選欄 */}
          <div className="filter_bar rounded-xl overflow-hidden w-full lg:w-[25%] bg-white mt-[30px] mr-4">
            <FilterSideBar
              products={initialProducts}
              activeTags={activeTags}
              setActiveTags={(tags) => {
                setActiveTags(tags);
                const tagQuery = tags.join(",");
                // 這裡 push 到當前路徑 (/product)
                router.push(
                  {
                    pathname: "/product",
                    query: { ...router.query, tags: tagQuery },
                  },
                  undefined,
                  { scroll: false }
                );
              }}
            />
          </div>

          {/* 右側商品列表 */}
          <div className="bottom-content mt-[30px] rounded-xl overflow-hidden w-full lg:w-[75%] flex flex-col">
            <div className="top-navgation bg-white max-w-[1920px] border-b border-gray-200 py-5 flex flex-col sm:flex-row items-center pl-4 sm:pl-10">
              <div className="bread_crumb w-full">
                <Link href="/">Home</Link> ←{" "}
                <span className="text-[16px] font-bold">所有商品 (All Products)</span>
              </div>
              <CountryFilter />
            </div>

            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 bg-white rounded-bl-xl rounded-br-xl sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-2 sm:p-6">
                {currentProducts.map((product, index) => {
                  // 圖片處理邏輯
                  const match = product?.description?.match(/<img[^>]+src="([^">]+)"/);
                  const extractedImg = match?.[1];
                  const productImage = product?.images?.[0]?.src || extractedImg || "/default-image.jpg";

                  const price = product?.prices?.sale_price || product?.prices?.price || product.price;
                  const regularPrice = product?.prices?.regular_price || product.regular_price;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                    >
                      {/* 注意這裡：連結指向 /product/slug，這會由 [slug].js 處理 */}
                      <Link href={`/product/${product.slug}`} className="hover:scale-105 duration-200 block">
                        <div className="card overflow-hidden rounded-xl p-4 bg-white">
                          <Image
                            src={productImage}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full rounded-[30px] border-2 border-gray-300 group-hover:shadow-lg object-contain mb-3"
                          />
                          <span className="font-bold text-[16px] block mb-1">{product.name}</span>
                          <div className="text-gray-700">
                            {price && (
                              <>
                                {regularPrice && regularPrice !== price && (
                                  <del className="mr-1 text-gray-400 text-sm">NT${regularPrice}</del>
                                )}
                                <span className="text-blue-600 font-bold">NT${price}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-10 bg-white rounded-b-xl">
                暫無商品。
              </div>
            )}

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-8 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded border ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-600 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllProductsPage;