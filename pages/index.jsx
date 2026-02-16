"use client";

import React, { useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Layout from "./Layout";
import FeatureCarousel from "../components/FeatureCarousel.jsx";
import AccordionEsim from "../components/AccordionEsim.jsx";
import Carousel from "../components/EmblaCarouselTravel/index.jsx";
import Project from "../components/ServiceSection.jsx";
import SvgCard from "../components/SvgHoverCard.jsx";
import { ArrowRight } from "lucide-react";
import Image from "next/image.js";
// GSAP & Lenis Imports
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const VuckoScroll = dynamic(() => import("@/components/CodegridScroll"), {
  ssr: false,
});

export default function Home() {
  const containerRef = useRef(null);

  // --- 動畫邏輯開始 ---
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Lenis 初始化 (平滑滾動)
      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      // 抓取元素
      const windowContainer = document.querySelector(".jesko-window-container");
      const skyContainer = document.querySelector(".jesko-sky-container");
      const heroCopy = document.querySelector(".jesko-hero-copy");
      const heroHeader = document.querySelector(".jesko-hero-header");

      // 確保元素存在才執行
      if (!windowContainer || !skyContainer) return;

      const skyContainerHeight = skyContainer.offsetHeight;
      const viewportHeight = window.innerHeight;
      const skyMoveDistance = skyContainerHeight - viewportHeight;

      // 初始設定
      gsap.set(heroCopy, { yPercent: 100 });

      // ScrollTrigger 動畫
      ScrollTrigger.create({
        trigger: ".jesko-hero",
        start: "top top",
        end: `+=${window.innerHeight * 3}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          // 窗口縮放邏輯
          let windowScale;
          if (progress <= 0.5) {
            windowScale = 1 + (progress / 0.5) * 3;
          } else {
            windowScale = 4;
          }
          gsap.set(windowContainer, { scale: windowScale });
          gsap.set(heroHeader, { scale: windowScale, z: progress * 500 });

          // 天空移動邏輯 (因為雲層包在裡面，所以會跟著一起動)
          gsap.set(skyContainer, {
            y: -progress * skyMoveDistance,
          });

          // 文字移動邏輯
          let heroCopyY;
          if (progress <= 0.66) {
            heroCopyY = 100;
          } else if (progress >= 1) {
            heroCopyY = 0;
          } else {
            heroCopyY = 100 * (1 - (progress - 0.66) / 0.34);
          }
          gsap.set(heroCopy, { yPercent: heroCopyY });
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      // lenis.destroy();
    };
  }, []);
  // --- 動畫邏輯結束 ---

  // 資料數據
  const newsItems = [
    {
      id: 1,
      date: "2025.09.26",
      tag: "購買流程",
      title: "Jeko eSIM 的購買流程到使用方式",
      link: "#",
    },
    {
      id: 2,
      date: "2025.04.16",
      tag: "實體辦公處",
      title: "目前有實體辦公處，有問題或者合作意願可親洽或者聯絡我們",
      link: "#",
    },
    {
      id: 3,
      date: "2025.03.27",
      tag: "退貨相關",
      title: "eSIM無法安裝/使用？",
      link: "#",
    },
    {
      id: 4,
      date: "2025.02.23",
      tag: "支付方式",
      title: "Jeko 提供街口支付、Line pay  等等主流付款方式 ",
      link: "#",
    },
    {
      id: 5,
      date: "2025.02.11",
      tag: "新着情報",
      title:
        "（採用）LINE公式アカウント・Lステップ構築の制作実績を追加しました。",
      link: "#",
    },
  ];

  const filters = [
    "すべてのお知らせ",
    "コラム",
    "プレスリリース",
    "補助金・助成金",
    "新着情報",
  ];

  return (
    <Layout>
      <div ref={containerRef}>
        {/* --- 嵌入 CSS 樣式 (Scoped) --- */}
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap");

          .jesko-hero {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            perspective: 1000px;
            color: #fff;
            font-family: "Instrument Serif", sans-serif;
            background-color: #000;
          }

          /* 1. 天空容器 (父層) - 包含 天空圖片 & 雲層 */
          .jesko-sky-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 350vh; /* 長圖 */
            z-index: 1;
            will-change: transform;
          }

          /* 天空背景圖 */
          .jesko-sky-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1; /* 在最底層 */
          }

          /* 2. 雲層容器 (子層) - 絕對定位在天空容器內 */
          .jesko-cloud-container {
            position: absolute;
            top: -15%; /* 黏在天空頂部 */
            left: 0;
            width: 100%;
            height: 100%; /* 高度與天空容器一致 (350vh)，這樣雲才會覆蓋整個天空 */
            z-index: 2; /* 疊在天空圖片上 */
            overflow: hidden;
            pointer-events: none;
          }

          /* 雲層跑道 */
          .jesko-cloud-track {
            display: flex;
            width: 200%;
            height: 100%;
            will-change: transform;
            animation: jeskoMarquee 60s linear infinite;
          }

          .jesko-cloud-track img {
            width: 50%;
            height: 100%;
            object-fit: cover;
            opacity: 0.9;

            /* 新增這行：讓圖片左右兩側邊緣模糊淡出 */
            -webkit-mask-image: linear-gradient(
              to right,
              transparent,
              black 10%,
              black 90%,
              transparent
            );
            mask-image: linear-gradient(
              to right,
              transparent,
              black 10%,
              black 90%,
              transparent
            );
          }
          /* 其他層級保持不變 */
          .jesko-hero-copy {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3;
            text-align: center;
            will-change: transform;
          }

          .jesko-window-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 4;
            pointer-events: none;
            will-change: transform;
          }

          .jesko-window-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .jesko-hero-header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            padding: 2rem;
            display: flex;
            transform-style: preserve-3d;
            z-index: 5;
            pointer-events: none;
            will-change: transform;
          }

          .jesko-hero-header h1 {
            font-size: clamp(3rem, 5vw, 6rem);
            line-height: 0.9;
            font-weight: 500;
          }

          .jesko-hero-header p {
            font-size: 1.2rem;
            width: 60%;
          }

          .jesko-hero-copy h1 {
            width: 85%;
            font-size: clamp(2rem, 4vw, 5rem);
            font-weight: 500;
            line-height: 1.1;
          }

          @keyframes jeskoMarquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          @media (max-width: 1000px) {
            .jesko-hero-header h1 {
              font-size: 2.5rem;
            }
            .jesko-hero-copy h1 {
              font-size: 2rem;
            }
          }
        `}</style>

        {/* --- Animation HTML Structure --- */}
        <section className="jesko-hero relative">
          <div className="hand  absolute left-[23%]  top-[13%] -translate-y-1/2 z-[999]">
            <Image
              src="/即買即用.png"
              className="w-[230px]"
              width={1000}
              height={1000}
            ></Image>
          </div>
          <div className="hand  absolute left-[8%]  top-[13%] -translate-y-1/2 z-[999]">
            <Image
              src="/掃qrcode.png"
              className="w-[230px]"
              width={1000}
              height={1000}
            ></Image>
          </div>
          <div className="hand  absolute left-0  top-1/2 -translate-y-1/2 z-50">
            <Image
              src="/hand01.png"
              className="w-[600px]"
              width={1000}
              height={1000}
            ></Image>
          </div>
          <div className="logo-txt absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50">
            <div className="flex flex-col items-center">
              <p className="text-[40px]">Jeko eSIM</p>
              <div className="bg-[#e46e2a] rounded-full px-4 py-2 shadow-sm shadow-stone-600 text-gray-50 text-md">
                出國旅遊的好夥伴
              </div>
              <div className="flex mt-4 justify-center items-center">
                <span>方便 ｜</span>
                <span>快速 ｜</span>
                <span>即買即用 </span>
              </div>
            </div>
          </div>
          {/* <div className="title absolute left-[10%] top-[15%] z-50">
            <h1 className="text-[4em]">WHERE YOU GO ? </h1>
            <h2 className="text-[2.3em]">
              你的口袋旅遊神隊友，<br></br>出國上網真簡單
            </h2>
          </div> */}
          {/* 天空容器 (包含天空圖 + 雲層) */}
          <div className="jesko-sky-container">
            {/* 1. 天空背景圖 */}
            <img src="/sky.jpg" alt="Sky Background" className="jesko-sky-bg" />

            {/* 2. 雲層跑馬燈 (放在這裡面，就會跟著天空一起 scroll) */}
            <div className="jesko-cloud-container">
              <div className="jesko-cloud-track">
                <img src="/cloud.png" alt="Clouds" />
                <img src="/cloud.png" alt="Clouds" />
              </div>
            </div>
          </div>

          <div className="jesko-hero-copy mt-[150px]">
            <h1> 掃描 QR Code 即刻連網。</h1>
          </div>

          <div className="jesko-window-container">
            <img src="/window.png" alt="Plane Window" />
          </div>

          <div className="jesko-hero-header">{/* Header Content */}</div>
        </section>

        {/* --- End of Animation Section --- */}

        {/* --- 下方原本的內容 --- */}
        <section className="relative w-full mt-[-20px] overflow-hidden bg-[#147AD7]">
          {/* ... 保持原本代碼 ... */}
          <div className="z-[9999]  relative">
            <FeatureCarousel />
          </div>
          {/* Blobs ... */}
          <div className="absolute top-[-20px] lg:top-[-50px] xl:top-[9%] left-[0%] 2xl:left-[80%] z-[1]">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
              id="blobSvg"
              className="w-[250px] h-[250px] md:w-[450px] md:h-[450px] xl:w-[650px] xl:h-[650px] 2xl:w-[800px] 2xl:h-[800px] opacity-70 lg:opacity-100"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    style={{ stopColor: "rgb(248, 121, 21)" }}
                  ></stop>
                  <stop
                    offset="100%"
                    style={{ stopColor: "rgb(255, 201, 69)" }}
                  ></stop>
                </linearGradient>
              </defs>
              <path id="blob" fill="url(#gradient)">
                <animate
                  attributeName="d"
                  dur="4s"
                  repeatCount="indefinite"
                  values="M421.63508,307.39005Q364.7801,364.7801,307.39005,427.43403Q250,490.08796,191.6822,428.36178Q133.3644,366.6356,70.9089,308.3178Q8.4534,250,54.21728,174.99058Q99.98115,99.98115,174.99058,81.49686Q250,63.01257,330.66021,75.84607Q411.32042,88.67958,444.90524,169.33979Q478.49006,250,421.63508,307.39005Z;M395.5,320Q390,390,320,400Q250,410,172,408Q94,406,59,328Q24,250,70.5,183.5Q117,117,183.5,108Q250,99,335,89.5Q420,80,410.5,165Q401,250,395.5,320Z;M408.24461,332.63257Q415.26513,415.26513,332.63257,434.71568Q250,454.16622,179.33614,422.74697Q108.67228,391.32772,65.87585,320.66386Q23.07942,250,63.27221,176.73251Q103.46501,103.46501,176.73251,63.02288Q250,22.58075,311.86507,74.4253Q373.73015,126.26985,387.47712,188.13493Q401.22409,250,408.24461,332.63257Z;M418.08664,320.33435Q390.6687,390.6687,320.33435,427.91946Q250,465.17023,188.27506,419.31005Q126.55013,373.44987,106.38448,311.72494Q86.21883,250,84.09726,165.98785Q81.9757,81.9757,165.98785,53.98938Q250,26.00305,311.1687,76.83282Q372.3374,127.6626,408.92099,188.8313Q445.50458,250,418.08664,320.33435Z;M421.63508,307.39005Q364.7801,364.7801,307.39005,427.43403Q250,490.08796,191.6822,428.36178Q133.3644,366.6356,70.9089,308.3178Q8.4534,250,54.21728,174.99058Q99.98115,99.98115,174.99058,81.49686Q250,63.01257,330.66021,75.84607Q411.32042,88.67958,444.90524,169.33979Q478.49006,250,421.63508,307.39005Z"
                ></animate>
              </path>
            </svg>
          </div>
          {/* Blob 2 */}
          <div className="absolute top-[-20px] lg:top-[-50px] xl:top-[9%] left-[-20%] lg:left-[0%] 2xl:left-[-20%] z-[1]">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
              className="w-[250px] h-[250px] md:w-[450px] md:h-[450px] xl:w-[650px] xl:h-[650px] 2xl:w-[800px] 2xl:h-[800px] opacity-70 lg:opacity-100"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    style={{ stopColor: "rgb(248, 121, 21)" }}
                  ></stop>
                  <stop
                    offset="100%"
                    style={{ stopColor: "rgb(255, 201, 69)" }}
                  ></stop>
                </linearGradient>
              </defs>
              <path id="blob" fill="url(#gradient)">
                <animate
                  attributeName="d"
                  dur="4s"
                  repeatCount="indefinite"
                  values="... (same path data) ..."
                ></animate>
              </path>
            </svg>
          </div>
        </section>

        <img
          src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-1300x100_2d2c9e2f-293f-4f46-8b79-fed8dc5fa5bb.svg"
          alt=""
          className="w-full relative z-10"
        />

        {/* 熱門國家, 如何使用, Features, Blog, CTA 等區塊 (請直接使用原本的內容，此處為了簡潔省略重複顯示) */}
        {/* 請保留您原本下方所有的 section 代碼 */}

        <section className="bg-[#147AD7] min-h-screen lg:h-screen rounded-br-[60px] rounded-bl-[60px] lg:rounded-br-[130px] lg:rounded-bl-[130px] py-10 lg:py-0">
          <div className="flex flex-col lg:flex-row max-w-[1000px] mx-auto justify-between px-6 lg:px-0">
            <div className="txt">
              <h2 className="text-white tracking-widest text-3xl lg:text-4xl font-bold lg:font-normal">
                熱門國家&地區
              </h2>
              <h3 className="text-white tracking-widest mt-2 text-xl lg:text-2xl">
                快速找到您想去的旅遊目的地的 eSIM 卡
              </h3>
              <p className="text-slate-100 text-base lg:text-xl mt-6 leading-relaxed lg:leading-snug tracking-widest">
                在 Re.MEDIA 探索<br className="hidden lg:block"></br>
                經濟高效的旅遊數據方案<br className="hidden lg:block"></br>
                隨時隨地無縫連接<br className="hidden lg:block"></br>
                告別昂貴的國際漫遊費
              </p>
            </div>
            <div></div>
          </div>
          <Project />
        </section>

        <section className="pt-[60px] relative lg:pt-[150px] rounded-[32px] z-[999999999] bg-white/40 border border-white/30 backdrop-blur-[25px] shadow-[0_30px_80px_rgba(36,57,69,0.15)] px-4 sm:px-10 mx-auto mt-[50px] lg:mt-[150px] w-[95%] lg:w-[96%] py-[60px] lg:py-[100px]">
          {/* 如何使用 eSIM 內容 */}
          <div className="main-title max-w-[1000px] mx-auto flex justify-center flex-col items-center text-center">
            <h2 className="text-3xl lg:text-5xl font-bold">如何使用 eSIM?</h2>
            <p className="text-slate-700 text-lg mt-3">How to use</p>
          </div>
          {/* ... (省略部分代碼以節省篇幅，請保留您原本的代碼) ... */}
          <div className="rounded-2xl bg-[#EBEEEF] py-10 lg:py-20 max-w-[1500px] mx-auto flex justify-center flex-col items-center mt-8">
            {/* Step 1, 2, Check Step 等內容保持不變 */}
            <div className="mb-10 w-full flex justify-around">
              <div className="flex flex-col lg:flex-row w-[90%] lg:w-[80%] mx-auto gap-8 lg:gap-0">
                <div className="w-full lg:w-1/2 flex lg:pr-10 items-center flex-col text-center lg:text-left">
                  <div>
                    <div className="max-w-full lg:max-w-[280px] mx-auto lg:mx-0">
                      <div className="bg-[#30ae99] p-2 rounded-[8px] text-white text-[16px] font-bold inline-block lg:block">
                        無論你去哪裡旅行，保持連線不斷網
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold mt-4 lg:mt-2">
                        什麼是 eSIM？
                      </h3>
                    </div>
                    <p className="text-center lg:text-left font-bold mt-2">
                      告別實體 SIM 卡的束縛
                    </p>
                    <p className="mt-4 leading-relaxed text-gray-700 text-sm lg:text-base">
                      eSIM（嵌入式 SIM
                      卡）是新一代的網路技術。無需抽換實體卡片，只需掃描 QR Code
                      設定，抵達目的地後開啟數據漫遊，即可立即連接當地高速網路，省去保管實體卡片的麻煩。
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-1/2 lg:pr-10">
                  <img
                    src="/images/如何使用esim.png"
                    className="w-full rounded-xl shadow-md"
                    alt="eSIM使用說明"
                  />
                </div>
              </div>
            </div>
            {/* Step 2 */}
            <div className="border-t lg:border-t-0 lg:border-l-5 border-[#147AD7] w-full flex justify-around pt-10 lg:pt-0">
              <div className="flex flex-col lg:flex-row w-[90%] lg:w-[80%] mx-auto gap-8 lg:gap-0">
                <div className="w-full lg:w-1/2 flex items-center flex-col text-center lg:text-left">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold">
                      請確保您的手機運營商已解鎖
                      <br className="hidden lg:block"></br>且與 eSIM 相容
                    </h3>
                    <p className="text-center lg:text-left font-bold mt-2">
                      eSIM 相容裝置列表
                    </p>
                    <p className="mt-4 leading-relaxed text-gray-700 text-sm lg:text-base">
                      在購買前，請務必確認您的裝置支援 eSIM
                      功能且未被電信商鎖定（Sim-Lock Free）。目前市面上新款
                      iPhone （XR/XS 以後機型）及多數 Android 旗艦機種皆已支援。
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="flex flex-col gap-2">
                    <a href="#">
                      <div className="flex justify-center lg:justify-end items-center">
                        <div className="bg-white py-2 lg:py-1 flex items-center px-4 rounded-[30px] w-full lg:w-auto shadow-sm">
                          <div className="w-[7px] h-[7px] bg-[#2d7ee7] rounded-full shrink-0"></div>
                          <div className="ml-3 tracking-widest font-bold text-[14px]">
                            使用 eSIM 快速教學
                          </div>
                        </div>
                      </div>
                    </a>
                    <a href="#" className="group">
                      <div className="flex justify-center lg:justify-end items-center lg:mt-2">
                        <div className="py-2 lg:py-1 flex group-hover:bg-white bg-white lg:bg-transparent duration-200 items-center px-4 rounded-[30px] w-full lg:w-auto shadow-sm lg:shadow-none">
                          <div className="w-[7px] h-[7px] bg-[#2d7ee7] lg:hidden lg:group-hover:block duration-300 transition-all rounded-full shrink-0"></div>
                          <div className="ml-3 tracking-widest font-bold text-[14px]">
                            產品相關政策及規範
                          </div>
                        </div>
                      </div>
                    </a>
                    <a href="/shopee-qrcode" className="group">
                      <div className="flex justify-center lg:justify-end items-center lg:mt-2">
                        <div className="py-2 lg:py-1 flex group-hover:bg-white bg-white lg:bg-transparent duration-200 items-center px-4 rounded-[30px] w-full lg:w-auto shadow-sm lg:shadow-none">
                          <div className="w-[7px] h-[7px] bg-[#2d7ee7] lg:hidden lg:group-hover:block duration-300 transition-all rounded-full shrink-0"></div>
                          <div className="ml-3 tracking-widest font-bold text-[14px]">
                            蝦皮訂單編號快速兌換
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[10px] w-[90%] lg:w-[80%] mx-auto p-6 lg:p-10 mt-10 shadow-sm">
              <div className="step border-b lg:border-b-1 border-gray-200 lg:border-gray-400 py-2 lg:py-5">
                <div className="w-full lg:w-1/2 flex items-center">
                  <div className="w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] bg-[#428aef] rounded-full text-white flex justify-center items-center font-bold text-lg lg:text-xl shrink-0">
                    1
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-lg lg:text-2xl font-bold ml-3">
                      確認手機是否有支援
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="tutorial p-10"></div>
          </div>
        </section>

        <img
          src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-1300x100_601d1578-d35b-424a-bd5b-dcee64d6b25f.svg"
          className="w-full mt-[-80px] lg:mt-[-150px] relative z-10"
          alt=""
        />

        <section className="bg-[#07b53b] p-6 lg:p-20 relative z-0">
          {/* Features 內容保持不變 */}
          <div className="max-w-[1400px] mx-auto xl:w-[70%] sm:w-[85%] w-full">
            <div className="main-title text-center lg:text-left">
              <h2 className="text-white text-4xl lg:text-5xl font-bold tracking-widest">
                Features
              </h2>
              <p className="text-slate-50">特色</p>
            </div>
            <div className="main pt-6 lg:pt-10">
              <div>
                <div className="title flex flex-col lg:flex-row w-full lg:w-[70%] justify-between items-center lg:items-start">
                  <div className="flex flex-col">
                    <h3 className="text-white text-2xl lg:text-3xl">
                      精選全球 eSIM
                    </h3>
                  </div>
                  <div className="flex mt-4 lg:mt-0 flex-wrap justify-center gap-2">
                    <div className="bg-white flex tracking-wider items-center justify-center font-bold rounded-[20px] px-3 py-1 text-[12px] lg:text-[14px]">
                      超快物流
                    </div>
                    <div className="bg-white flex tracking-wider items-center justify-center font-bold rounded-[20px] px-3 py-1 text-[12px] lg:text-[14px]">
                      即時客服
                    </div>
                    <div className="bg-white flex tracking-wider items-center justify-center font-bold rounded-[20px] px-3 py-1 text-[12px] lg:text-[14px]">
                      攻略分享
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-[30%]"></div>
              </div>
              <div className="chat p-6 lg:p-8 bg-white relative flex flex-col-reverse lg:flex-row rounded-[20px] mt-8 lg:mt-4 overflow-hidden lg:overflow-visible">
                <div className="absolute bottom-[-20px] lg:bottom-[-30px] z-30 left-6 lg:left-10 w-[30px] h-[30px] lg:w-[40px] lg:h-[40px]">
                  <img
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-43x30_bff1345c-8a45-4eed-ad55-45a1705d21db.svg"
                    alt=""
                    className="w-full"
                  />
                </div>
                <div className="left w-full lg:w-[70%] mt-4 lg:mt-0">
                  <AccordionEsim />
                </div>
                <div className="phone w-full lg:w-[30%] relative flex justify-center lg:justify-between items-end h-[200px] lg:h-auto">
                  <img
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-464x928_v-fs_webp_26a92258-9a41-4f50-af8c-624012999e60_small.webp"
                    className="w-[120px] lg:w-[60%] lg:absolute h-auto z-30 lg:left-1/2 lg:-translate-x-1/2 bottom-0"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Duplicate Feature Block */}
          <div className="max-w-[1400px] mx-auto xl:w-[70%] sm:w-[85%] w-full">
            <div className="main pt-6 lg:pt-10">
              <div className="chat p-6 lg:p-8 bg-white relative flex flex-col-reverse lg:flex-row rounded-[20px] mt-4 overflow-hidden lg:overflow-visible">
                <div className="absolute bottom-[-20px] lg:bottom-[-30px] z-30 left-6 lg:left-10 w-[30px] h-[30px] lg:w-[40px] lg:h-[40px]">
                  <img
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-43x30_bff1345c-8a45-4eed-ad55-45a1705d21db.svg"
                    alt=""
                    className="w-full"
                  />
                </div>
                <div className="left w-full lg:w-[70%] mt-4 lg:mt-0">
                  <AccordionEsim />
                </div>
                <div className="phone w-full lg:w-[30%] relative flex justify-center lg:justify-between items-end h-[200px] lg:h-auto">
                  <img
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-464x928_v-fs_webp_26a92258-9a41-4f50-af8c-624012999e60_small.webp"
                    className="w-[120px] lg:w-[60%] lg:absolute h-auto z-30 lg:left-1/2 lg:-translate-x-1/2 bottom-0"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <img
          src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-1300x100_601d1578-d35b-424a-bd5b-dcee64d6b25f.svg"
          className="w-full rotate-180 mt-[0px] relative z-10"
          alt=""
        />

        <section className="bg-[#147AD7] py-20">
          <div className="mt-8 lg:mt-5">
            <Carousel />
          </div>
          <section className="relative h-auto">
            <SvgCard />
          </section>
        </section>

        <section className="pt-[60px] max-w-[80%] lg:pt-[150px] rounded-[32px] bg-white/40 border border-white/30 backdrop-blur-[25px] shadow-[0_30px_80px_rgba(36,57,69,0.15)] px-4 sm:px-10 mx-auto mt-[-80px] lg:mt-[-150px] w-[95%] lg:w-[96%] py-[60px] lg:py-[100px] relative z-20 overflow-hidden">
          {/* Notification 內容保持不變 */}
          <div className="flex flex-col max-w-[1450px] mx-auto lg:flex-row gap-12 lg:gap-20">
            <div className="w-full lg:w-1/4 flex flex-col justify-between">
              <div>
                <h2 className="text-6xl font-serif font-bold text-[#0F356B] mb-10 tracking-wide">
                  Notification
                </h2>
                <ul className="space-y-5 mb-10">
                  {filters.map((filter, index) => (
                    <li
                      key={index}
                      className={`cursor-pointer text-sm font-bold tracking-wide transition-colors duration-300 ${index === 0 ? "text-[#0F356B]" : "text-gray-500 hover:text-[#0F356B]"}`}
                    >
                      <span className="relative inline-block pb-1">
                        {filter}
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0F356B]"></span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <a
                  href="#"
                  className="inline-flex items-center justify-center bg-[#2E68C0] text-white text-sm font-bold py-4 px-8 rounded-full shadow-lg hover:bg-[#1a54a8] transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                >
                  聯絡我們
                </a>
              </div>
            </div>
            <div className="w-full lg:w-3/4 flex flex-col gap-4">
              {newsItems.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  className="group relative flex flex-col md:flex-row items-start md:items-center bg-[#F2F2F2] border border-transparent hover:border-gray-200 hover:bg-white transition-all duration-500 rounded-xl p-6 cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-3 md:mb-0 md:w-[220px] flex-shrink-0">
                    <span className="text-[#2E68C0] font-bold text-sm font-sans tracking-wider">
                      {item.date}
                    </span>
                    <span className="text-[10px] text-[#2E68C0] border border-[#2E68C0]/30 px-2 py-1 rounded bg-white font-bold">
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex-grow pr-12">
                    <h3 className="text-gray-800 font-medium text-sm md:text-base leading-relaxed group-hover:text-[#0F356B] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out">
                    <div className="w-10 h-10 rounded-full bg-[#2E68C0] flex items-center justify-center shadow-md">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#2E68C0]/20 group-hover:opacity-0 transition-opacity duration-300 hidden md:block"></div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-btn bg-[#1C82E0] max-w-[1160px] mx-auto rounded-[20px] lg:rounded-[33px] p-6 lg:p-10 mt-10">
          {/* CTA Button 內容 */}
          <div className="w-full lg:w-[90%] flex mx-auto flex-col">
            <div className="title flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-0">
              <h3 className="text-white font-bold tracking-wider text-xl lg:text-[26px]">
                遇到問題需要協助？
              </h3>
              <span className="text-white text-sm lg:text-[14px] opacity-80 lg:opacity-100">
                Customer Support
              </span>
            </div>
            <div className="cta-btn-wrapper w-full">
              <div className="cta-btn group bg-[#0069CA] mt-6 lg:mt-4 rounded-[10px] p-2 cursor-pointer w-full">
                <div className="inner group-hover:bg-white bg-transparent duration-500 p-6 lg:p-8 rounded-[10px] flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0">
                  <div className="w-full lg:w-1/2">
                    <h3 className="text-white group-hover:ml-0 lg:group-hover:ml-6 group-hover:text-[#0069CA] duration-300 font-bold text-xl lg:text-2xl">
                      LINE 官方客服
                    </h3>
                  </div>
                  <div className="border-t lg:border-t-0 lg:border-l-1 w-full lg:w-[55%] flex justify-start lg:justify-end !group-hover:w-full lg:!group-hover:w-[55%] duration-300 border-gray-50/30 lg:border-gray-50 pt-4 lg:pt-0 pl-0 lg:pl-5 group-hover:border-[#0069CA]">
                    <span className="text-white group-hover:mr-0 lg:group-hover:mr-10 duration-500 w-full lg:w-[300px] group-hover:text-[#0069CA] text-sm lg:text-[14px] leading-relaxed">
                      直接使用 LINE
                      與我們聯繫，真人客服即時在線。如有使用問題請直接加入好友詢問。
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute w-[300px] h-[400px]"></div>
        </div>
      </div>
    </Layout>
  );
}
