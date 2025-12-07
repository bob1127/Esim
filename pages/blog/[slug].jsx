import Head from "next/head";
import { useRouter } from "next/router";
import parse from "html-react-parser";
import dynamic from "next/dynamic";
import Layout from "../Layout";

const OtherPostsCarousel = dynamic(() =>
  import("../../components/OtherPostsCarousel")
);

export default function PostPage({ post, relatedPosts = [] }) {
  const router = useRouter();
  if (router.isFallback) return <div>Loading...</div>;

  const seo = post.yoast_head_json || {};

  const canonicalUrl =
    seo?.canonical?.replace(
      "https://dyx.wxv.mybluehost.me/website_a8bfc44c",
      "https://www.wmesim.com"
    ) || `https://www.wmesim.com/blog/${post.slug}`;

  const ogUrl =
    seo?.og_url?.replace(
      "https://dyx.wxv.mybluehost.me/website_a8bfc44c",
      "https://www.wmesim.com"
    ) || canonicalUrl;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首頁",
        item: "https://www.wmesim.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "部落格",
        item: "https://www.wmesim.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title.rendered,
        item: canonicalUrl,
      },
    ],
  };

  const firstImageMatch = post.content.rendered.match(
    /<img[^>]+src="([^">]+)"/
  );
  const firstImage =
    firstImageMatch?.[1]?.replace(
      "https://dyx.wxv.mybluehost.me/website_a8bfc44c",
      "https://www.wmesim.com"
    ) || "https://www.wmesim.com/logo.png";

  const fallbackDescription =
    post.excerpt?.rendered?.replace(/<[^>]+>/g, "")?.slice(0, 160) ||
    "台灣 eSIM、免簽、自由行教學與最新旅遊資訊";

  const fallbackKeywords = `${post.title.rendered}, eSIM, 台灣eSIM, 旅遊上網, 日本旅遊, 自由行, 簽證, 2025`;

  // 將 WP 文章內容 HTML 轉成 React 元件，並處理 img
  const renderContent = (html) =>
    parse(html, {
      replace: (node) => {
        if (node.name === "img" && node.attribs?.src) {
          const src = node.attribs.src.replace(
            "https://dyx.wxv.mybluehost.me/website_a8bfc44c",
            "https://www.wmesim.com"
          );
          return (
            <img
              src={src}
              alt={node.attribs.alt || ""}
              className="w-full h-auto my-6 rounded-md"
              loading="lazy"
            />
          );
        }
      },
    });

  return (
    <>
      <Layout>
        <Head>
          {/* Gutenberg 文章排版樣式（只在 blog 頁用） */}
          <link
            rel="stylesheet"
            href="https://fegoesim.com/wp-includes/css/dist/block-library/style.min.css"
          />
          <link
            rel="stylesheet"
            href="https://fegoesim.com/wp-includes/css/dist/block-library/theme.min.css"
          />

          {/* 基本 SEO */}
          <title>{seo?.title || `${post.title.rendered}｜部落格文章`}</title>
          <meta
            name="description"
            content={seo?.description || fallbackDescription}
          />
          <meta name="keywords" content={fallbackKeywords} />
          <link rel="canonical" href={canonicalUrl} />

          {/* Robots 設定 */}
          {seo?.robots && (
            <>
              <meta
                name="robots"
                content={`${seo.robots.index}, ${seo.robots.follow}`}
              />
              {seo.robots["max-snippet"] && (
                <meta name="max-snippet" content={seo.robots["max-snippet"]} />
              )}
              {seo.robots["max-image-preview"] && (
                <meta
                  name="max-image-preview"
                  content={seo.robots["max-image-preview"]}
                />
              )}
              {seo.robots["max-video-preview"] && (
                <meta
                  name="max-video-preview"
                  content={seo.robots["max-video-preview"]}
                />
              )}
            </>
          )}

          {/* Open Graph */}
          <meta
            property="og:title"
            content={seo?.og_title || post.title.rendered}
          />
          <meta
            property="og:description"
            content={seo?.og_description || fallbackDescription}
          />
          <meta property="og:type" content={seo?.og_type || "article"} />
          <meta property="og:url" content={ogUrl} />
          <meta
            property="og:site_name"
            content={seo?.og_site_name || "WMESIM"}
          />
          <meta property="og:locale" content={seo?.og_locale || "zh_TW"} />
          <meta property="og:image" content={firstImage} />

          {/* Twitter Card */}
          <meta name="twitter:card" content={seo?.twitter_card || "summary"} />
          <meta
            name="twitter:title"
            content={seo?.twitter_title || post.title.rendered}
          />
          <meta
            name="twitter:description"
            content={seo?.twitter_description || fallbackDescription}
          />
          <meta name="twitter:image" content={firstImage} />

          {/* Yoast schema + 自訂補強 */}
          {seo?.schema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  ...seo.schema,
                  mainEntityOfPage: {
                    "@type": "WebPage",
                    "@id": canonicalUrl,
                  },
                  image: firstImage,
                }),
              }}
            />
          )}

          {/* Breadcrumb 結構化資料 */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(breadcrumbJsonLd),
            }}
          />
        </Head>

        <div className="max-w-[1920px] mt-20 xl:w-[85%] flex flex-col lg:flex-row w-[95%] mx-auto px-4 py-10">
          {/* 文章內容 */}
          <article className="entry-content wp-block-post-content w-full p-4 md:p-8 lg:w-[80%]">
            <h1 className="post-title text-[5vmin] font-semibold mb-4">
              {post.title.rendered}
            </h1>

            {/* 導覽列 + 更新日期 */}
            <div className="navgation py-4 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500 mt-1 mb-6 border-b border-gray-200">
              <span className="mb-2 md:mb-0">
                <a href="/" className="text-blue-600 hover:underline">
                  首頁
                </a>{" "}
                &gt;{" "}
                <a href="/blog" className="text-blue-600 hover:underline">
                  部落格
                </a>{" "}
                &gt; <span>{post.title.rendered}</span>
              </span>
              <span>
                最後更新時間：
                {new Date(post.modified).toLocaleDateString("zh-TW")}
              </span>
            </div>

            {renderContent(post.content.rendered)}
          </article>

          {/* 側邊欄：更多相似文章 */}
          <aside className="sidebar w-full lg:w-[20%] p-4 space-y-6">
            <div className="same-category sticky top-24">
              <h3 className="text-lg font-semibold mb-4">更多相似文章</h3>
              {relatedPosts.map((item) => {
                const imageMatch = item.content.rendered.match(
                  /<img[^>]+src="([^">]+)"/
                );
                const previewImg = imageMatch?.[1]?.replace(
                  "https://dyx.wxv.mybluehost.me/website_a8bfc44c",
                  "https://www.wmesim.com"
                );

                return (
                  <div key={item.id} className="mb-6 border-b pb-4">
                    {previewImg && (
                      <a href={`/blog/${item.slug}`}>
                        <img
                          src={previewImg}
                          alt={item.title.rendered}
                          className="w-full h-auto mb-2 rounded"
                          loading="lazy"
                        />
                      </a>
                    )}
                    <a href={`/blog/${item.slug}`}>
                      <h4 className="text-md font-medium text-blue-600 hover:underline line-clamp-2">
                        {item.title.rendered}
                      </h4>
                    </a>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(item.date).toLocaleDateString("zh-TW")}
                    </p>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        {/* 其他文章輪播 */}
        <section className="section-others-blog max-w-[1920px] mx-auto xl:w-[85%] w-[90%] py-10">
          <OtherPostsCarousel />
        </section>
      </Layout>

      {/* 這一段是「只套用在本頁」的全域排版樣式 */}
      <style jsx global>{`
        /* 文章主體區塊 */
        .entry-content {
          max-width: 760px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, BlinkMacSystemFont,
            "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
          font-size: 0.95rem;
          line-height: 1.9;
          color: #111827;
        }

        @media (min-width: 768px) {
          .entry-content {
            font-size: 1rem;
          }
        }

        /* H1（文章內額外 H1，如果有） */
        .entry-content h1 {
          font-size: clamp(1.9rem, 3.4vw, 2.4rem);
          line-height: 1.25;
          font-weight: 700;
          margin: 2rem 0 1rem;
        }

        /* H2 標題 */
        .entry-content h2 {
          font-size: clamp(1.4rem, 2.6vw, 2rem);
          line-height: 1.4;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        /* H3 標題 */
        .entry-content h3 {
          font-size: clamp(1.2rem, 2.1vw, 1.6rem);
          line-height: 1.5;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.5rem;
        }

        /* 段落文字 */
        .entry-content p {
          margin: 0 0 0.75rem;
        }

        .entry-content p + p {
          margin-top: 0.25rem;
        }

        /* 粗體文字 */
        .entry-content strong {
          font-weight: 600;
          color: #111827;
        }

        /* 調整列表樣式 */
        .entry-content ul,
        .entry-content ol {
          padding-left: 1.25rem;
          margin: 0.5rem 0 1rem;
        }

        .entry-content li {
          margin-bottom: 0.25rem;
        }

        /* hr / 分隔線 */
        .entry-content hr,
        .entry-content .wp-block-separator {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          margin: 2rem 0;
        }

        /* 表格（Gutenberg 表格 Block） */
        .entry-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.95rem;
        }

        .entry-content table th,
        .entry-content table td {
          border: 1px solid #e5e7eb;
          padding: 0.6rem 0.75rem;
        }

        .entry-content table th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        /* 讓圖片在手機不要爆版 */
        .entry-content img {
          max-width: 100%;
          height: auto;
        }

        /* 小螢幕調整內距，避免太擠 */
        @media (max-width: 640px) {
          .entry-content {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
        }
      `}</style>
    </>
  );
}

export async function getStaticPaths() {
  const res = await fetch(
    `https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/wp/v2/posts?_fields=slug&per_page=20`
  );
  const posts = await res.json();

  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const res = await fetch(
    `https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/wp/v2/posts?slug=${params.slug}&_embed`
  );
  const posts = await res.json();

  if (!posts[0]) return { notFound: true };
  const post = posts[0];

  const categoryId = post.categories?.[0];

  let relatedPosts = [];
  if (categoryId) {
    const relRes = await fetch(
      `https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/wp/v2/posts?categories=${categoryId}&exclude=${post.id}&per_page=6&_embed`
    );
    relatedPosts = await relRes.json();
  }

  return {
    props: {
      post,
      relatedPosts,
    },
    revalidate: 10,
  };
}
