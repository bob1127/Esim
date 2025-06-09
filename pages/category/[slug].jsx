import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
const SideBar = dynamic(
  () => import("../../components/NavbarTestSideBarToggle"),
  {
    ssr: false, // 禁用服务器端渲染
  }
);
import Layout from "../Layout";
import { useRouter } from "next/router"; // 获取 slug

const { NEXT_PUBLIC_API_BASE_URL } = process.env;

// 获取所有产品数据
async function fetchAllProducts() {
  const productUrl = `https://starislandbaby.com/test/wp-json/wc/store/products?consumer_key=ck_ec41b174efc5977249ffb5ef854f6c1fdba1844b&consumer_secret=cs_d6c8d7ba3031b522ca93e6ee7fb56397b8781d1f&per_page=100`;

  console.log("Fetching all products from:", productUrl);

  const response = await fetch(productUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch all products");
  }

  const products = await response.json();
  console.log("Fetched all products:", products);

  return products;
}

async function fetchProductsBySlug(slug) {
  console.log("📌 Fetching products for category slug:", slug);

  const allProducts = await fetchAllProducts();
  console.log("🛒 获取到的所有产品:", allProducts);

  // 过滤符合 slug 的产品（匹配 categories 中的 slug）
  const filteredProducts = allProducts.filter((product) =>
    product.categories.some((category) => category.slug === slug)
  );

  return filteredProducts;
}

export async function getStaticPaths() {
  const allProducts = await fetchAllProducts();

  // 获取所有唯一的产品 slug 并生成路径
  const paths = allProducts.flatMap((product) =>
    product.categories.map((category) => ({
      params: { slug: encodeURIComponent(category.slug) }, // 确保 slug 被正确编码
    }))
  );

  return {
    paths,
    fallback: "blocking", // 确保新增的 slug 页面可以动态生成
  };
}

export async function getStaticProps({ params }) {
  console.log("getStaticProps is called with params:", params);

  let { slug } = params;
  slug = decodeURIComponent(slug);

  try {
    const products = await fetchProductsBySlug(slug);

    return {
      props: {
        slug,
        products,
      },
      revalidate: 10, // ⬅ 这里是 ISR 设置
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return { notFound: true };
  }
}

const CategoryPage = ({ slug, products }) => {
  console.log("Rendering products for slug:", slug);

  return (
    <Layout>
      <div
        data-aos="fade-up"
        className="mb-[200px] mx-0 sm:mx-[50px] lg:mx-[100px] 2xl:mx-[200px] mt-[100px] sm:mt-[170px] lg:mt-[250px]  xl:mt-[300px] flex flex-col"
      >
        <div className="top-navgation pl-10">
          <a href="/">Home</a> ← <span>{slug ? slug : "All Products"}</span>
        </div>

        <div className="bottom-content flex flex-col lg:flex-row">
          {/* 左側側邊欄保留 */}
          <div className="left w-full lg:w-[40%] 2xl:w-[25%] py-0 px-4 lg:p-10 side_bar">
            <div className="wrap  bg-[#f7f7f8] flex flex-col w-full ">
              <div className="menu  py-8 px-3">
                <SideBar />
              </div>
            </div>
          </div>

          {/* 右側產品區域，只有在有產品時才顯示 */}
          {products && products.length > 0 && (
            <div className="right w-[100%] justify-center items-center lg:items-start lg:justify-start sm:pt-10 flex-col flex 2xl:w-[100%] 2xl:pr-[0px] pt-5 products_menu">
              <div className="flex pr-2 flex-wrap justify-start sm:justify-start items-start">
                {products.map((product) => {
                  const productImage =
                    product.images?.[0]?.src || "/default-image.jpg";

                  // 取出价格，根據是否有折扣來顯示
                  const price = product.prices.sale_price
                    ? product.prices.sale_price
                    : product.prices.price;

                  const regularPrice = product.prices.regular_price;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${encodeURIComponent(product.slug)}`} // 确保 slug 编码
                      className="mt-2 w-1/2 hover:scale-105 duration-200  group mb-3 sm:w-[260px] md:w-[280px] 2xl:w-[330px]"
                    >
                      <div className="card mx-2 overflow-hidden w-[98%]    rounded-xl  pr-1 md:p-8">
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
                        <div>
                          <span className="text-gray-700 ">
                            {regularPrice && <del>NT${regularPrice}</del>} NT$
                            {price}
                          </span>
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
