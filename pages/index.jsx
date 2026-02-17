"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "./Layout";
import FeatureCarousel from "../components/FeatureCarousel.jsx";
import AccordionEsim from "../components/AccordionEsim.jsx";
import Carousel from "../components/EmblaCarouselTravel/index.jsx";
import Project from "../components/ServiceSection.jsx";
import SvgCard from "../components/SvgHoverCard.jsx";
import { ArrowRight } from "lucide-react";
import Image from "next/image.js";
import MaskText from "../components/MaskText.jsx";
// GSAP & Lenis Imports
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const VuckoScroll = dynamic(() => import("@/components/CodegridScroll"), {
  ssr: false,
});

// 輔助組件：快速連結按鈕
function QuickLinkButton({ text, active = false, link = "#" }) {
  return (
    <a href={link} className="group block">
      <div className="flex justify-center lg:justify-end items-center">
        <div
          className={`py-2 lg:py-2 flex items-center px-5 rounded-[30px] w-full lg:w-auto shadow-sm transition-all duration-200 ${
            active ? "bg-white" : "bg-white lg:bg-transparent lg:hover:bg-white"
          }`}
        >
          <div
            className={`w-[8px] h-[8px] rounded-full shrink-0 transition-all duration-300 ${
              active
                ? "bg-[#2d7ee7]"
                : "bg-[#2d7ee7] lg:hidden lg:group-hover:block"
            }`}
          ></div>
          <div className="ml-3 tracking-widest font-bold text-[14px] text-slate-700 group-hover:text-[#147AD7]">
            {text}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function Home() {
  const containerRef = useRef(null);

  // ★ Notification 區塊狀態
  const [activeTab, setActiveTab] = useState(0);
  const newsContainerRef = useRef(null);

  // ★ 安裝教學區塊狀態 (iOS/Android 切換)
  const [activeSystem, setActiveSystem] = useState("ios");

  // --- 資料數據 (Notification) ---
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

  const promoItems = [
    {
      id: 101,
      date: "2025.10.01",
      tag: "限時優惠",
      title: "【秋季旅展】日本 eSIM 買一送一，限時 3 天搶購！",
      link: "#",
    },
    {
      id: 102,
      date: "2025.09.15",
      tag: "會員專屬",
      title: "加入官方 LINE 好友，即刻領取 $50 折扣碼",
      link: "#",
    },
    {
      id: 103,
      date: "2025.08.30",
      tag: "新品上市",
      title: "歐洲 33 國通用 eSIM 全新上線，早鳥優惠價實施中",
      link: "#",
    },
  ];

  const filters = ["最新消息/公告", "特價/優惠"];
  const displayItems = activeTab === 0 ? newsItems : promoItems;

  // --- 資料數據 (安裝步驟) ---
  const iosSteps = [
    {
      step: 1,
      title: "進入設定",
      desc: "前往「設定」>「行動服務」> 點擊「加入 eSIM」。",
    },
    {
      step: 2,
      title: "掃描 QR Code",
      desc: "選擇「使用行動條碼」，掃描我們寄給您的 QR Code。若無法掃描，可手動輸入啟用碼。",
    },
    {
      step: 3,
      title: "設定標籤",
      desc: "將此 eSIM 標籤設為「旅遊」或「Jeko」，並將其設為「行動數據」的預設號碼 (僅在抵達目的地後切換)。",
    },
    {
      step: 4,
      title: "抵達後啟用",
      desc: "抵達目的地後，開啟此 eSIM 的「數據漫遊」，即可開始上網。",
    },
  ];

  const androidSteps = [
    {
      step: 1,
      title: "進入設定",
      desc: "前往「設定」>「網路和網際網路」>「SIM 卡」> 點擊「下載 SIM 卡」。",
    },
    {
      step: 2,
      title: "掃描 QR Code",
      desc: "掃描我們寄給您的 QR Code。若無法掃描，點擊「需要協助」手動輸入啟用碼。",
    },
    {
      step: 3,
      title: "下載並確認",
      desc: "確認下載 Jeko eSIM，下載過程需保持網路連線。",
    },
    {
      step: 4,
      title: "抵達後啟用",
      desc: "抵達目的地後，開啟此 eSIM 並開啟「數據漫遊」，將其設為上網專用卡。",
    },
  ];

  const currentSteps = activeSystem === "ios" ? iosSteps : androidSteps;

  const ArrowIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="transition-transform group-hover:translate-x-[2px]"
    >
      <path
        d="M8 5l8 7-8 7"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // --- 動畫邏輯 (Hero Scroll) ---
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
      const handContainer = document.querySelector(".jesko-hand-container");

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

          // 天空移動邏輯
          gsap.set(skyContainer, {
            y: -progress * skyMoveDistance,
          });

          // 手部向左滑出邏輯
          if (handContainer) {
            gsap.set(handContainer, {
              x: -progress * window.innerWidth * 1.2,
              opacity: 1 - progress * 1.2,
            });
          }

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
    };
  }, []);

  // --- 動畫邏輯 (Notification List Switch) ---
  useLayoutEffect(() => {
    if (!newsContainerRef.current) return;
    const ctx = gsap.context(() => {
      // 列表項目進場動畫 (Fade Up + Blur)
      gsap.fromTo(
        ".news-item",
        {
          y: 30,
          opacity: 0,
          filter: "blur(4px)", // 模糊起始
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)", // 模糊結束
          duration: 0.5,
          stagger: 0.08, // 階梯式出現
          ease: "power2.out",
          clearProps: "all",
        },
      );
    }, newsContainerRef);

    return () => ctx.revert();
  }, [activeTab]); // 依賴 activeTab 變化觸發

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
        <section className="jesko-hero relative h-sreen">
          <div className="jesko-hand-container will-change-transform absolute max-w-[700px] md:h-[60vh] h-[50vh] xl:h-screen z-[99999] left-[-30%] md:left-0 top-[60%] md:top-0 md:w-[80vw] w-[80vw] xl:w-[40vw]">
            <div className="relative h-full">
              <div className="hand absolute left-[60%] top-[23%] -translate-y-1/2 z-[999]">
                <Image
                  src="/即買即用.png"
                  className="w-[230px]"
                  width={1000}
                  height={1000}
                  alt="即買即用"
                ></Image>
              </div>
              <div className="hand absolute left-[25%] top-[18%] -translate-y-1/2 z-[999]">
                <Image
                  src="/掃qrcode.png"
                  className="w-[230px]"
                  width={1000}
                  height={1000}
                  alt="掃qrcode"
                ></Image>
              </div>
              <div className="hand absolute left-0 bottom-0 z-50">
                <Image
                  src="/hand01.png"
                  className="w-[600px]"
                  width={1000}
                  height={1000}
                  alt="hand"
                ></Image>
              </div>
            </div>
          </div>

          <div className="logo-txt absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50">
            <div className="flex flex-col items-center">
              <p className="text-[40px]">Jeko eSIM</p>
              <div className="group relative inline-flex cursor-default">
                {/* 1. 影子/立體層 (Shadow Layer) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-400 to-white opacity-0 transition-all duration-300 group-hover:translate-x-1.5 group-hover:translate-y-1.5 group-hover:opacity-100 shadow-inner" />

                {/* 2. 按鈕本體層 (Main Layer) */}
                <div className="relative z-10 inline-flex items-center justify-center overflow-hidden rounded-full bg-[#e46e2a] px-4 py-2 text-md text-gray-50 shadow-sm shadow-stone-600 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-none">
                  {/* 3. 文字動畫層 (Text Swap) */}
                  <span className="relative inline-flex overflow-hidden">
                    {/* 顯示文字 A: Hover 時往右飛走並傾斜 */}
                    <span className="translate-x-0 skew-x-0 transition-transform duration-500 group-hover:translate-x-[150%] group-hover:skew-x-12">
                      出國旅遊的好夥伴
                    </span>

                    {/* 顯示文字 B: Hover 時從左邊飛入並回正 */}
                    <span className="absolute inset-0 -translate-x-[150%] skew-x-12 transition-transform duration-500 group-hover:translate-x-0 group-hover:skew-x-0">
                      出國旅遊的好夥伴
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex mt-4 justify-center items-center">
                <span>方便 ｜</span>
                <span>快速 ｜</span>
                <span>即買即用 </span>
              </div>
            </div>
          </div>

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
        <section className="relative w-full mt-[-20px] overflow-hidden  ">
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

        <section className="   rounded-br-[60px] rounded-bl-[60px] lg:rounded-br-[130px] lg:rounded-bl-[130px] py-10  ">
          <div className="flex flex-col pt-20 lg:flex-row max-w-[1000px] mx-auto justify-between px-6 lg:px-0">
            <div className="txt">
              <MaskText blockColor="#30AE99">
                <h2 className="text-stone-900 tracking-widest text-3xl lg:text-6xl font-extrabold ">
                  快速找到您想去的<br></br> <br></br>{" "}
                  <h2 className="text-stone-900 tracking-widest mt-5 text-3xl lg:text-6xl font-extrabold ml-[100px]">
                    旅遊目的地的 eSIM 卡
                  </h2>
                </h2>
              </MaskText>
              <MaskText blockColor="#30AE99">
                {" "}
                <p className="text-slate-900 text-base lg:text-[16px] mt-6 leading-loose  tracking-widest">
                  在 Jeko 探索 經濟高效的旅遊數據方案
                  <br className="hidden lg:block"></br>
                  隨時隨地無縫連接 告別昂貴的國際漫遊費
                </p>
              </MaskText>
            </div>
            <div></div>
          </div>
          <Project />
        </section>

        <section className="relative rounded-[32px] z-[999999999] bg-white/40 border border-white/30 backdrop-blur-[25px] shadow-[0_30px_80px_rgba(36,57,69,0.15)] px-4 sm:px-10 mx-auto mt-[50px] w-[95%] lg:w-[96%] py-[60px] lg:py-[100px]">
          {/* 如何使用 eSIM 內容 */}
          <MaskText blockColor="#30AE99">
            <div className="main-title max-w-[1000px] mx-auto flex justify-center flex-col items-center text-center">
              <h2 className="text-3xl lg:text-5xl font-bold">如何使用 eSIM?</h2>
              <p className="text-slate-700 text-lg mt-3">
                How to use / Installation
              </p>
            </div>
          </MaskText>

          {/* 灰色背景大區塊 */}
          <div className="rounded-2xl bg-[#EBEEEF] py-10 lg:py-20 max-w-[1500px] mx-auto flex justify-center flex-col items-center mt-8">
            {/* --- Part 1: 什麼是 eSIM (維持原樣) --- */}
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

            {/* --- Part 2: 裝置相容性 & 快速連結 (維持原樣) --- */}
            <div className="border-t lg:border-t-0 lg:border-l-4 border-[#147AD7] w-full flex justify-around pt-10 lg:pt-0">
              <div className="flex flex-col lg:flex-row w-[90%] lg:w-[80%] mx-auto gap-8 lg:gap-0">
                <div className="w-full lg:w-1/2 flex items-center flex-col text-center lg:text-left">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold leading-snug">
                      請確保您的手機
                      <br className="hidden lg:block" />
                      已解鎖且支援 eSIM
                    </h3>
                    <p className="text-center lg:text-left font-bold mt-2 text-[#147AD7]">
                      Before You Buy
                    </p>
                    <p className="mt-4 leading-relaxed text-gray-700 text-sm lg:text-base">
                      在購買前，請務必確認您的裝置支援 eSIM
                      功能且未被電信商鎖定（Sim-Lock Free）。 目前市面上新款
                      iPhone （XR/XS 以後機型）及多數 Android 旗艦機種皆已支援。
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="flex flex-col gap-3">
                    {/* 按鈕組 */}
                    <QuickLinkButton text="查看支援裝置列表" active />
                    <QuickLinkButton text="產品相關政策及規範" />
                    <QuickLinkButton
                      text="蝦皮訂單編號快速兌換"
                      link="/shopee-qrcode"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- Part 3: 安裝步驟教學 (新設計內容) --- */}
            <div className="bg-white rounded-[20px] w-[90%] lg:w-[80%] mx-auto p-6 lg:p-10 mt-16 shadow-sm border border-slate-100">
              {/* iOS / Android 切換 Tab */}
              <div className="flex justify-center mb-10">
                <div className="bg-[#EBEEEF] p-1 rounded-full inline-flex">
                  <button
                    onClick={() => setActiveSystem("ios")}
                    className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                      activeSystem === "ios"
                        ? "bg-[#147AD7] text-white shadow-md"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    iOS (iPhone)
                  </button>
                  <button
                    onClick={() => setActiveSystem("android")}
                    className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                      activeSystem === "android"
                        ? "bg-[#30ae99] text-white shadow-md"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Android
                  </button>
                </div>
              </div>

              {/* 步驟列表 */}
              <div className="flex flex-col gap-6">
                {currentSteps.map((item, index) => (
                  <div
                    key={index}
                    className={`step group border-b border-gray-100 py-4 lg:py-6 last:border-b-0 transition-all duration-300 hover:bg-slate-50 rounded-xl px-2 lg:px-4`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8">
                      {/* 數字圈圈 */}
                      <div
                        className={`w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] rounded-full text-white flex justify-center items-center font-bold text-lg lg:text-xl shrink-0 transition-colors duration-300 ${
                          activeSystem === "ios"
                            ? "bg-[#428aef]"
                            : "bg-[#30ae99]"
                        }`}
                      >
                        {item.step}
                      </div>

                      {/* 文字內容 */}
                      <div className="flex flex-col justify-center w-full">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-1 group-hover:text-[#147AD7] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      {/* 裝飾箭頭 (僅桌面顯示) */}
                      <div className="hidden lg:block text-gray-300 group-hover:text-[#147AD7] group-hover:translate-x-2 transition-all">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 底部提醒 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                  <svg
                    className="w-6 h-6 text-[#147AD7] shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-bold text-[#147AD7]">貼心提醒：</span>
                    請務必在有 WiFi 或網路的環境下掃描安裝。掃描後請勿刪除 eSIM
                    方案，一旦刪除將無法再次掃描使用。
                    如果在安裝過程遇到問題，請截圖並聯繫客服。
                  </p>
                </div>
              </div>
            </div>

            <div className="tutorial p-10"></div>
          </div>
        </section>

        <img
          src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-1300x100_2d2c9e2f-293f-4f46-8b79-fed8dc5fa5bb.svg"
          alt=""
          className="w-full relative  mt-[-130px] z-10"
        />

        <section className="bg-[#147AD7]  p-6 lg:p-20 relative z-0">
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

        <section className="bg-[#147AD7] py-20">
          <div className="mt-8 lg:mt-5">
            <Carousel />
          </div>
          <section className="relative h-auto">
            <SvgCard />
          </section>
        </section>
        <img
          src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-1300x100_2d2c9e2f-293f-4f46-8b79-fed8dc5fa5bb.svg"
          alt=""
          className="w-full rotate-180 mt-[0px] relative z-10"
        />
        <section className="pt-[60px] max-w-[80%] lg:pt-[150px] rounded-[32px] bg-white/40 border border-white/30 backdrop-blur-[25px] shadow-[0_30px_80px_rgba(36,57,69,0.15)] px-4 sm:px-10 mx-auto mt-[-80px] lg:mt-[-220px] w-[95%] lg:w-[96%] py-[60px] lg:py-[100px] relative z-20 overflow-hidden">
          {/* Notification 內容保持不變 */}
          <div className="flex flex-col max-w-[1450px] mx-auto lg:flex-row gap-12 lg:gap-20">
            <div className="w-full lg:w-1/4 flex flex-col justify-between">
              <div>
                <h2 className="text-6xl font-serif font-bold text-[#0F356B] mb-10 tracking-wide">
                  Notification
                </h2>
                {/* ★ 修改：Tab 切換邏輯 (綁定 onClick 與動態樣式) */}
                <ul className="space-y-5 mb-10">
                  {filters.map((filter, index) => (
                    <li
                      key={index}
                      onClick={() => setActiveTab(index)} // 點擊切換 Tab
                      className={`cursor-pointer text-sm font-bold tracking-wide transition-all duration-300 ${
                        activeTab === index
                          ? "text-[#0F356B] translate-x-2" // 選中樣式
                          : "text-gray-500 hover:text-[#0F356B] hover:translate-x-1" // 一般樣式
                      }`}
                    >
                      <span className="relative inline-block pb-1">
                        {filter}
                        {/* 動態底線動畫 */}
                        <span
                          className={`absolute bottom-0 left-0 h-[2px] bg-[#0F356B] transition-all duration-300 ${
                            activeTab === index ? "w-full" : "w-0"
                          }`}
                        ></span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 flex  ">
                {/* 外層容器：設定 group 以便控制內部所有動畫 */}
                <a
                  href="/category/all-product/"
                  className="group relative inline-flex items-center justify-center"
                >
                  {/* 動畫效果 3 (背景影子層) */}
                  <div className="absolute inset-0 h-full w-full rounded-full bg-[#0891b2] opacity-0 transition-all duration-300 group-hover:translate-x-1.5 group-hover:translate-y-1.5 group-hover:opacity-100" />

                  {/* 主按鈕層 */}
                  <div className="relative z-10 inline-flex items-center justify-center overflow-hidden rounded-full bg-[#2E68C0] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#384a72] first-letter:transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[#0960c3]">
                    {/* 動畫效果 2 (文字傾斜滑動) */}
                    <span className="relative inline-flex overflow-hidden">
                      {/* 第一組內容：原本顯示的。Hover 時向右滑出並傾斜 */}
                      <div className="flex items-center gap-3 transition-transform duration-500 group-hover:translate-x-[150%] group-hover:skew-x-12">
                        聯絡我們
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                          <ArrowIcon />
                        </span>
                      </div>

                      {/* 第二組內容：原本隱藏在左側。Hover 時歸位並取消傾斜 */}
                      <div className="absolute inset-0 flex items-center gap-3 transition-transform duration-500 -translate-x-[150%] skew-x-12 group-hover:translate-x-0 group-hover:skew-x-0">
                        聯絡我們
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                          <ArrowIcon />
                        </span>
                      </div>
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* ★ 修改：列表容器綁定 Ref 且使用 displayItems */}
            <div
              ref={newsContainerRef} // 綁定 Ref
              className="w-full lg:w-3/4 flex flex-col gap-4 min-h-[400px]" // min-h 防止塌陷
            >
              {displayItems.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  // 加入 news-item 供 GSAP 抓取，移除 transform 相關 class 以免衝突
                  className="news-item group relative flex flex-col md:flex-row items-start md:items-center bg-[#F2F2F2] border border-transparent hover:border-gray-200 hover:bg-white transition-colors duration-300 rounded-xl p-6 cursor-pointer"
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
