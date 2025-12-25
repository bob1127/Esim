"use client";
// import styles from "./page.module.scss";
import { useEffect, useState } from "react";
// import { AnimatePresence } from "framer-motion";
// import Preloader from "../components/toys05/Preloader";
import Marquee from "react-marquee-slider";
import Layout from "./Layout.js";
import Link from "next/link";
import Image from "next/image.js";
import Carousel from "../components/ThreeHorizontalSlider.jsx";
export default function Home() {
  return (
    <Layout>
      <Carousel />
      <section className="section-company-intro  pt-20">
        <div className="flex h-[400px] group">
          <div className="w-[5%] border-[.5px] border-gray-200 flex justify-center items-center flex-col  h-full">
            <p className="font-bold rotate-[90deg] text-gray-500 group-hover:text-black  duration-500">
              01
            </p>
            <p className="text-lg font-bold rotate-[90deg] text-gray-500 group-hover:text-black my-8 duration-500">
              ABOUT
            </p>
          </div>
          <div className="w-[10%] border-[.5px] border-gray-200 h-full"></div>
          <div className="w-[85%] border-[.5px] border-gray-200 h-full flex justify-center items-center">
            <div className="flex flex-col p-6">
              <h1 className="text-6xl font-bold">Jeko eSIM</h1>
              <p className="text-2xl font-bold">
                您出國旅遊的好選擇，各種eSIM方案
              </p>
              <div>
                <span className="text-gray-900 font-bold text-2xl">
                  美加旅遊 | 日本旅遊 ｜ 韓國旅遊 ｜中國旅遊{" "}
                </span>
              </div>
              <div className="max-w-[1500px] flex">
                <div className="max-w-[500px] mr-8 tetx-gray-700 text-[14px] tracking-widest mt-4">
                  我們是一家專注於全球行動連線解決方案的科技公司，致力於以 eSIM
                  技術 打破地域界限，讓使用者在世界各地都能輕鬆上網。
                  透過與多國電信合作，我們提供 彈性方案、即時啟用、透明價格
                  的數據服務，讓旅行與通訊更自由、更智能。
                  我們相信，網路不只是連線工具，更是世界互通的橋樑。
                  讓每一段旅程、每一次溝通，都無縫順暢，這就是我們存在的使命。
                </div>
                <div className="max-w-[500px] mr-4 tetx-gray-700 text-[14px] tracking-widest mt-4">
                  無論你身處何地，連線只需一瞬。 我們以創新的 eSIM
                  技術，讓旅人、商務人士與數位生活家，輕鬆擁抱全球高速網路。
                  免換卡、免等待、免煩惱——世界，從此隨手可連。
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="swuper-full-img overflow-hidden aspect-[16/7] relative">
          <Image
            src="/images/06.png"
            alt="image"
            placeholder="empty"
            loading="lazy"
            fill
            className="object-cover "
          />
        </div>
      </section>

      <section className="section-company-intro">
        <div className="flex  h-auto lg:h-[500px] lg:flex-row flex-col group">
          <div className=" w-full  bg-black lg:bg-transparent lg:w-[5%] border-[.5px] border-gray-200 flex justify-center items-center flex-row lg:flex-col  h-full">
            <p className="font-bold rotate-[0deg] lg:rotate-[90deg] text-gray-500 lg:group-hover:text-black  group-hover:text-white duration-500">
              02
            </p>
            <p className="text-lg mx-4 lg:mx-0 font-bold rotate-[0deg] lg:rotate-[90deg] text-gray-500 group-hover:text-white lg:group-hover:text-black my-2 lg:my-8 duration-500">
              eSIM
            </p>
          </div>
          <div className=" w-full lg:w-[50%] xl:w-[65%] border-[.5px] border-gray-200 h-full p-20">
            <div className="max-w-[500px]">
              <h2 className=" text-4xl lg:text-6xl font-normal leading-snug">
                eSIM。
                <br />
                您旅行的好夥伴
              </h2>
              <p className="leading-relaxed mt-4">
                即掃即用，隨時上線。全新 eSIM 服務提供 24HR
                快速發貨，讓你無須等待、無需實體卡，出國前後都能輕鬆啟用。無論工作、旅遊或日常上網，一掃即可連線世界，享受真正的即時便利與自由行動力。
              </p>
              <button
                className="
  inline-flex items-center px-8 py-3 rounded-full  mt-4
  text-white font-semibold text-sm 
  bg-gradient-to-r from-[#0059b8] via-[#0071cf] to-[#0095e6]
  shadow-md transition-all duration-300
  hover:brightness-110 hover:shadow-lg
"
              >
                eSIM 產品
                <span className="ml-2 text-base">{">"}</span>
              </button>
            </div>
          </div>
          <div className=" w-full lg:w-[45%] xl:w-[30%] border-[.5px] border-gray-200 h-full flex justify-center items-center">
            <div className="p-20">
              <h3 className=" text-2xl lg:text-4xl text-gray-800">
                無卡束縛，自由上線
              </h3>
              <p className="leading-relaxed text-gray-800 mt-3">
                eSIM
                讓連線變得更直覺、更自由。免插卡、免等待，只需掃描即可啟用，無論出國旅行或日常使用都能立即上線。支援多門號切換，讓你在工作、生活間輕鬆管理不同方案；內建式設計也更安全、不怕遺失，更具耐用性。同時減少實體塑料使用，是更環保、更現代的通信選擇。以更聰明的方式連線，讓你的行動力再進化。
              </p>
            </div>
          </div>
        </div>

        <div className="marquee mt-8">
          <Marquee>
            {[
              <div className="flex" key="scan">
                <div className="mx-4">
                  <img
                    src="/素材/形象/Generated-Image-November-15,-2025---6_07PM.png"
                    className="max-w-[450px]"
                    alt="scan"
                  />
                </div>
                <div className="mx-4">
                  <img
                    src="/素材/形象/Generated-Image-November-15,-2025---5_19PM.png"
                    className="max-w-[450px]"
                    alt="scan"
                  />
                </div>
                <div className="mx-4">
                  <img
                    src="/素材/形象/Generated Image November 15, 2025 - 5_25PM.png"
                    className="max-w-[450px]"
                    alt="scan"
                  />
                </div>
                <div className="mx-4">
                  <img
                    src="/素材/形象/Generated Image November 05, 2025 - 8_40PM.png"
                    className="max-w-[450px]"
                    alt="scan"
                  />
                </div>
                <div className="mx-4">
                  <img
                    src="/素材/形象/Generated-Image-November-15,-2025---6_07PM.png"
                    className="max-w-[450px]"
                    alt="scan"
                  />
                </div>
                <div className="mx-4">
                  <img
                    src="/素材/形象/Generated-Image-November-15,-2025---5_19PM.png"
                    className="max-w-[450px]"
                    alt="scan"
                  />
                </div>
                <div className="mx-4">
                  <img
                    src="/素材/形象/Generated Image November 15, 2025 - 5_25PM.png"
                    className="max-w-[450px]"
                    alt="scan"
                  />
                </div>
              </div>,
            ]}
          </Marquee>
        </div>
      </section>
      {/* 工作環境區塊：藍色漸層背景 */}
      <section className="py-24 bg-gradient-to-r from-[#0059b8] via-[#0071cf] to-[#0095e6]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-12 items-center">
          {/* 左邊：多張照片排版 */}
          <div className="w-full lg:w-1/2 flex gap-4">
            {/* 左側直欄 */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="relative h-64 rounded-3xl overflow-hidden">
                <Image
                  src="/images/env-01.jpg"
                  alt="workspace 1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-64 rounded-3xl overflow-hidden">
                <Image
                  src="/images/env-02.jpg"
                  alt="workspace 2"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* 右側直欄（錯落高度） */}
            <div className="flex-1 flex flex-col gap-4 mt-10">
              <div className="relative h-64 rounded-3xl overflow-hidden">
                <Image
                  src="/images/env-03.jpg"
                  alt="workspace 3"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-56 rounded-3xl overflow-hidden">
                <Image
                  src="/images/env-04.jpg"
                  alt="workspace 4"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* 右邊：標題 + 文字 + 按鈕 */}
          <div className="w-full lg:w-1/2 text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">環境を知る</h2>
            <p className="leading-relaxed text-[15px] md:text-base mb-8">
              当社では、「自分と大切な人が幸せな時間を送れる環境であり続ける」という行動指針をもとに、
              働きやすい環境、成長しやすい環境づくりに力を入れています。ここでは、当社のカルチャー、
              福利厚生、人事評価制度など働く環境についてご紹介します。
            </p>

            <button className="inline-flex items-center px-8 py-3 rounded-full bg-white text-[#0059b8] font-semibold text-sm shadow-md hover:bg-blue-50 transition">
              働く環境
              <span className="ml-2 text-base">{">"}</span>
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
