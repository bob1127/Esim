import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import Layout from "../Layout";
import { useRouter } from "next/router";
import SwiperCarousel from "../../components/SwiperCarousel/SwiperCard.jsx";
const SideBar = dynamic(
  () => import("../../components/NavbarTestSideBarToggle"),
  {
    ssr: false,
  }
);

// API base (後續可抽到 .env)
const WC_API_URL = `https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/wc/v3/products?consumer_key=ck_0ed8acaab9f0bc4cd27c71c2e7ae9ccc3ca45b04&consumer_secret=cs_50ad8ba137c027d45615b0f6dc2d2d7ffcf97947`;

// 抓全部產品
async function fetchAllProducts() {
  const res = await fetch(WC_API_URL);
  if (!res.ok) throw new Error("Failed to fetch all products");
  return await res.json();
}

// 過濾特定分類
async function fetchProductsBySlug(slug) {
  const allProducts = await fetchAllProducts();
  return allProducts.filter((product) =>
    product.categories?.some((cat) => cat.slug === slug)
  );
}

// 靜態產生分類頁面路徑
export async function getStaticPaths() {
  const allProducts = await fetchAllProducts();
  const paths = allProducts.flatMap((product) =>
    product.categories.map((category) => ({
      params: { slug: category.slug },
    }))
  );

  return { paths, fallback: "blocking" };
}

// 靜態生成分類內容
export async function getStaticProps({ params }) {
  const { slug } = params;

  try {
    const products = await fetchProductsBySlug(slug);
    return {
      props: { slug, products },
      revalidate: 10,
    };
  } catch (err) {
    console.error("Error in getStaticProps:", err);
    return { notFound: true };
  }
}

const CategoryPage = ({ slug, products }) => {
  return (
    <Layout>
      <div className=" flex flex-col">
        <section className="section_Hero w-full mx-auto  ">
          <SwiperCarousel />
        </section>
        <div className="top-navgation mt-[100px] border-b-1 border-gray-200  pb-4 mx-0 sm:mx-[50px] lg:mx-[100px] 2xl:mx-[200px] pl-10">
          <a href="/">Home</a> ← <span>{slug || "All Products"}</span>
        </div>

        <div className="bottom-content mx-0 sm:mx-[50px] lg:mx-[100px] 2xl:mx-[200px]  flex flex-col lg:flex-row">
          <div className="left w-full lg:w-[40%] 2xl:w-[25%] px-4 lg:p-10">
            <div className="wrap bg-[#f7f7f8] flex flex-col w-full">
              <div className="menu py-8 px-3">
                <SideBar />
              </div>
            </div>
          </div>

          {products && products.length > 0 && (
            <div className="right w-full lg:items-start sm:pt-10 flex-col flex 2xl:w-full 2xl:pr-0 pt-5 products_menu">
              <div className="flex pr-2 flex-wrap justify-start items-start">
                {products.map((product) => {
                  // 👉 從 description 中抓圖片
                  const match = product?.description?.match(
                    /<img[^>]+src="([^">]+)"/
                  );
                  const extractedImg = match?.[1];
                  const productImage =
                    product?.images?.[0]?.src ||
                    extractedImg ||
                    "/default-image.jpg";

                  const price =
                    product?.prices?.sale_price ||
                    product?.prices?.price ||
                    null;
                  const regularPrice = product?.prices?.regular_price || null;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      prefetch={false}
                      className="mt-2 w-1/2 hover:scale-105 duration-200 group mb-3 sm:w-[260px] md:w-[280px] 2xl:w-[330px]"
                    >
                      <div className="card mx-2 overflow-hidden w-[98%] rounded-xl pr-1 md:p-8">
                        <Image
                          src={productImage}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full rounded-[40px] border-2 border-gray-300 group-hover:shadow-lg group-hover:shadow-gray-500/50 duration-200 mb-3 object-contain"
                        />
                        <span className="font-bold text-[16px]">
                          {product.name}
                        </span>
                        <div className="text-gray-700">
                          {price ? (
                            <>
                              {regularPrice && (
                                <del className="mr-1">NT${regularPrice}</del>
                              )}
                              NT${price}
                            </>
                          ) : (
                            <span className="text-red-500 text-sm">
                              價格未設定
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
