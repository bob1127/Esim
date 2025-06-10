import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useCart } from "../../components/context/CartContext";
import Layout from "../Layout";
import Image from "next/image";

// 🔧 ✅ 圖片擷取函式拉到外層
const extractImageFromDescription = (html) => {
  const match = html?.match(/<img[^>]+src="([^">]+)"/);
  return match?.[1] || null;
};

export async function getStaticPaths() {
  const res = await fetch(
    `https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/wc/v3/products?consumer_key=ck_0ed8acaab9f0bc4cd27c71c2e7ae9ccc3ca45b04&consumer_secret=cs_50ad8ba137c027d45615b0f6dc2d2d7ffcf97947&per_page=100`
  );
  const products = await res.json();
  const paths = products.map((product) => ({
    params: { slug: product.slug },
  }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const encodedSlug = encodeURIComponent(slug);

  try {
    const res = await fetch(
      `https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/wc/v3/products?slug=${encodedSlug}&consumer_key=ck_0ed8acaab9f0bc4cd27c71c2e7ae9ccc3ca45b04&consumer_secret=cs_50ad8ba137c027d45615b0f6dc2d2d7ffcf97947`
    );

    if (!res.ok) {
      console.error("API 錯誤", res.status);
      return { notFound: true };
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      return { notFound: true };
    }

    return {
      props: { product: data[0] },
      revalidate: 60,
    };
  } catch (err) {
    console.error("getStaticProps 發生例外：", err);
    return { notFound: true };
  }
}

export default function ProductPage({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const image =
      product.images?.[0]?.src ||
      extractImageFromDescription(product.description) ||
      "/default-image.jpg";

    addToCart({
      id: product.id,
      name: product.name,
      price: product.prices?.price || product.price,
      quantity,
      image,
    });
    alert("已加入購物車");
  };

  const firstImage =
    product.images?.[0]?.src ||
    extractImageFromDescription(product.description) ||
    "/default-image.jpg";

  return (
    <Layout>
      <Head>
        <title>{product.name}</title>
      </Head>
      <div className="max-w-4xl mx-auto py-20 px-4">
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
        <Image src={firstImage} width={500} height={500} alt={product.name} />
        <p className="text-xl mt-4">NT${product.price}</p>
        <p
          className="mt-4 text-gray-600"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <div className="flex items-center mt-6 gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 border"
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 border"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-4 px-6 py-2 bg-black text-white rounded"
        >
          加入購物車
        </button>
      </div>
    </Layout>
  );
}
