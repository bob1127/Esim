// 檔案路徑：pages/product/[category]/index.js

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Head from "next/head.js";
// ★★★ 注意：因為檔案往下移了一層，這裡的相對路徑多了一個 ../ ★★★
import Layout from "../../Layout.js";
import CountryFilter from "../../../components/NavbarTestSideBarToggle.jsx";
import SwiperCarousel from "../../../components/SwiperCarousel/SwiperCard.jsx";
import FilterSideBar from "../../../components/FilterSideBar";

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

// --- getStaticPaths (產生所有分類的網址) ---
export async function getStaticPaths() {
  try {
    const res = await fetch(
      getWooCommerceUrl("products/categories", { per_page: 100 }),
    );
    const categories = await res.json();

    // 產生如 /product/japan, /product/korea 等路徑
    const paths = categories.map((cat) => ({
      params: { category: cat.slug },
    }));

    return { paths, fallback: "blocking" };
  } catch (error) {
    return { paths: [], fallback: "blocking" };
  }
}

// --- getStaticProps (抓取特定分類的商品) ---
export async function getStaticProps({ params }) {
  try {
    const { category: categorySlug } = params;

    // 1. 先用 slug 找出這個分類的 ID 與詳細資料
    const catRes = await fetch(
      getWooCommerceUrl("products/categories", { slug: categorySlug }),
    );
    const categoriesData = await catRes.json();

    // 如果找不到這個分類，回傳 404
    if (!categoriesData || categoriesData.length === 0) {
      return { notFound: true };
    }
    const currentCategory = categoriesData[0];

    // 2. 用找出的分類 ID，去抓取該分類下的所有商品
    const productUrl = getWooCommerceUrl("products", {
      category: currentCategory.id, // ★ 這裡指定了只抓該分類的商品
      per_page: 50,
      status: "publish",
    });
    const productRes = await fetch(productUrl);
    const products = await productRes.json();

    // 3. 為了讓側邊欄依然能顯示所有分類，我們還是要抓一次所有分類表
    const allCatRes = await fetch(
      getWooCommerceUrl("products/categories", { per_page: 100 }),
    );
    const allCategories = await allCatRes.json();

    return {
      props: {
        currentCategory, // 將當前分類資料傳給前端 (用來顯示標題)
        categories: Array.isArray(allCategories) ? allCategories : [],
        initialProducts: Array.isArray(products) ? products : [],
      },
      revalidate: 60, // ISR: 每 60 秒更新一次
    };
  } catch (e) {
    console.error("❌ getStaticProps 錯誤：", e);
    return { notFound: true };
  }
}

// --- 主要元件 ---
const CategoryPage = ({ currentCategory, categories, initialProducts }) => {
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

  // 前端篩選邏輯 (針對 Tags 進行二次篩選)
  useEffect(() => {
    if (!initialProducts) return;

    if (!activeTags || activeTags.length === 0) {
      setFilteredProducts(initialProducts);
    } else {
      const filtered = initialProducts.filter((product) => {
        return activeTags.every((tag) =>
          product.tags?.some((t) => t.slug === tag || t.name === tag),
        );
      });
      setFilteredProducts(filtered);
      setCurrentPage(1);
    }
  }, [activeTags, initialProducts]);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  // 如果正在產生新頁面，顯示載入中
  if (router.isFallback)
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          載入中...
        </div>
      </Layout>
    );

  return (
    <Layout>
      <Head>
        <title>{currentCategory?.name} eSIM 推薦 | FeGo</title>
        <meta
          name="description"
          content={
            currentCategory?.description ||
            `精選 ${currentCategory?.name} 旅遊 eSIM，隨插即用。`
          }
        />
      </Head>

      <div className="flex flex-col bg-[#f9f9fa]">
        <section className="section_Hero w-full mx-auto">
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
                // ★★★ 確保點擊標籤時，網址停留在當前分類底下 ★★★
                router.push(
                  {
                    pathname: `/product/${currentCategory.slug}`,
                    query: { ...router.query, tags: tagQuery },
                  },
                  undefined,
                  { scroll: false },
                );
              }}
            />
          </div>

          {/* 右側商品列表 */}
          <div className="bottom-content mt-[30px] rounded-xl overflow-hidden w-full lg:w-[75%] flex flex-col">
            <div className="top-navgation bg-white max-w-[1920px] border-b border-gray-200 py-5 flex flex-col sm:flex-row items-center pl-4 sm:pl-10">
              <div className="bread_crumb w-full text-gray-500">
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>
                <span className="mx-2">/</span>
                <Link
                  href="/product"
                  className="hover:text-blue-600 transition-colors"
                >
                  所有商品
                </Link>
                <span className="mx-2">/</span>
                {/* 動態顯示當前分類名稱 (例如: 日本 Japan) */}
                <span className="text-[16px] font-bold text-slate-800">
                  {currentCategory?.name}
                </span>
              </div>
              <CountryFilter />
            </div>

            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 bg-white rounded-bl-xl rounded-br-xl sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-2 sm:p-6">
                {currentProducts.map((product, index) => {
                  // 圖片處理邏輯
                  const match = product?.description?.match(
                    /<img[^>]+src="([^">]+)"/,
                  );
                  const extractedImg = match?.[1];
                  const productImage =
                    product?.images?.[0]?.src ||
                    extractedImg ||
                    "/default-image.jpg";

                  const price =
                    product?.prices?.sale_price ||
                    product?.prices?.price ||
                    product.price;
                  const regularPrice =
                    product?.prices?.regular_price || product.regular_price;

                  // ★★★ 組合階層式網址： /product/分類slug/商品slug ★★★
                  const productLink = `/product/${currentCategory.slug}/${product.slug}`;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                    >
                      <Link
                        href={productLink}
                        className="hover:scale-105 duration-200 block"
                      >
                        <div className="card overflow-hidden rounded-xl p-4 bg-white">
                          <div className="relative w-full aspect-[3/4] mb-3">
                            <Image
                              src={productImage}
                              alt={product.name}
                              fill
                              className="rounded-[20px] border-2 border-gray-100 group-hover:shadow-lg group-hover:border-blue-100 object-cover transition-all"
                            />
                          </div>
                          <span className="font-bold text-sm text-slate-800 block mb-1 line-clamp-2 min-h-[40px]">
                            {product.name}
                          </span>
                          <div className="text-gray-700 mt-2">
                            {price && (
                              <div className="flex items-end gap-2">
                                <span className="text-blue-600 font-bold text-lg">
                                  NT${price}
                                </span>
                                {regularPrice && regularPrice !== price && (
                                  <del className="text-gray-400 text-xs mb-0.5">
                                    NT${regularPrice}
                                  </del>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-10 bg-white rounded-b-xl flex flex-col items-center justify-center min-h-[300px]">
                <span className="text-4xl mb-3">📭</span>
                <p>這個分類目前還沒有商品喔！</p>
              </div>
            )}

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-8 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded border transition-colors ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white border-blue-600 font-bold"
                        : "bg-white text-blue-600 border-gray-300 hover:bg-gray-50"
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

export default CategoryPage;
