"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwiperEsim from "../components/EmblaCarousel01/index";
import Liquid from "../components/LiquidGlassHome.jsx";
import Country from "../components/Country/ImageTextSlider.jsx";
import Image from "next/image";
import IntroIos from "../components/IntroHeroIos.tsx";
import IntroHero from "../components/IntroHero";
import PageTransition from "../components/PageTransition.tsx";
import Layout from "./Layout";

export default function Home() {
  const [showIos, setShowIos] = useState(false);

  return (
    <Layout>
      <PageTransition>
        <Liquid />

        <div className="pt-[280px] px-5 relative">
          <div className="flex w-screen justify-center fixed z-50 bottom-3 gap-4">
            <div className="w-full flex justify-center">
              <button
                onClick={() => setShowIos(false)}
                className={`px-4 py-2 rounded-[10px] mx-2 border ${
                  !showIos ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                Android
              </button>
              <button
                onClick={() => setShowIos(true)}
                className={`px-4 py-2 rounded-[10px] mx-2 border ${
                  showIos ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                IOS
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showIos ? (
              <motion.div
                key="ios"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <IntroIos />
              </motion.div>
            ) : (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <IntroHero />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <section className="relative overflow-hidden h-screen">
          <div className="txt w-full md:w-1/2 absolute z-50 left-[5%] top-1/2 -translate-y-1/2 p-4">
            <h2 className="text-white text-[32px] md:text-[45px] font-normal text-left">
              彈性資費
            </h2>
            <p className="text-white text-[18px] md:text-[24px] font-normal">
              按天 / 按流量彈性選擇，沒有合約束縛
            </p>
          </div>

          <div className="mask w-full h-full bg-black opacity-15 absolute z-10 left-0 top-0 pointer-events-none" />

          <div className="sim-card w-[120px] md:w-[140px] h-[170px] md:h-[200px] absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-white/20 backdrop-blur-md bg-white/10 shadow-xl overflow-hidden">
            <div className="sim-card-wrap border relative w-full h-full">
              <Image
                src="/images/sim-card.png"
                alt="sim-card"
                placeholder="empty"
                loading="lazy"
                fill
                className="object-contain p-4"
              />
            </div>
            <div
              className="absolute top-0 right-0 w-[60px] h-[60px] md:w-[80px] md:h-[80px] bg-white/20 backdrop-blur-md"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            ></div>
          </div>

          <Image
            src="/images/banner04.png"
            alt="banner-img"
            placeholder="empty"
            loading="lazy"
            width={2000}
            height={1000}
            className="object-cover w-full h-full"
          />
        </section>

        <Country />

        <section className="section-product-intro bg-[#1757ff] px-4 sm:px-[60px] xl:px-[200px] py-[100px] mx-auto">
          <div className="title flex flex-col lg:flex-row justify-between gap-10 px-4">
            <div className="flex flex-col items-center md:items-start text-center lg:text-left">
              <h2 className="text-white text-[2rem] md:text-[3.4rem] font-bold">
                一鍵啟用全球上網
              </h2>
              <h3 className="text-white leading-snug text-[1rem] md:text-[1.25rem]">
                即買即用．免拆SIM卡．支援全球上網服務
                <br />
                跨國旅遊、出差、短租專用的 eSIM 解決方案
              </h3>
            </div>
            <div className="flex flex-col items-center lg:items-end">
              <p className="text-white text-[22px] md:text-[24px] lg:text-[50px] font-normal">
                Hot Sale eSIM
              </p>
              <div className="relative inline-block text-left mt-6">
                <select className="appearance-none w-[200px] h-12 px-4 pr-10 rounded-full border border-neutral-200 bg-white text-neutral-950 font-medium focus:outline-none transition-all duration-300 shadow-sm hover:border-[#1757ff] focus:border-[#1757ff]">
                  <option disabled selected value="">
                    請選擇旅遊國家
                  </option>
                  <option value="japan">日本 Japan</option>
                  <option value="korea">韓國 Korea</option>
                  <option value="vietnam">越南 Vietnam</option>
                  <option value="thailand">泰國 Thailand</option>
                  <option value="usa">美國 USA</option>
                  <option value="france">法國 France</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500">
                  ▼
                </div>
              </div>
            </div>
          </div>
          <SwiperEsim />
        </section>

        <section className="section-info py-[50px] px-4 sm:px-[40px] md:px-[80px] lg:px-[100px] bg-[#f9f9f9]">
          <div className="section-title text-[40px] md:text-[70px] font-normal text-black">
            最新消息
          </div>
          <div className="flex flex-col lg:flex-row">
            <div className="left w-full lg:w-1/2">
              <div className="bg-white h-[330px] p-5">
                <span className="">全館任兩件</span>
                <div className="font-light text-black text-[70px]">88折</div>
                <span className="text-[24px]">六月瘋日韓</span>
              </div>
              <ul className="p-5 flex flex-col">
                <li className="border-b mt-4 items-center group flex justify-between pb-3">
                  <h4 className="text-[1.9rem]">NEWS</h4>
                  <span className="text-[16px] w-2/3">
                    最新消息上架中，請耐心等候更多提供資訊
                  </span>
                  <button className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-950 group-hover:bg-[#1757ff] font-medium text-neutral-200">
                    <div className="translate-x-0 transition group-hover:translate-x-[300%]">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div className="absolute -translate-x-[300%] transition group-hover:translate-x-0">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </li>
              </ul>
            </div>

            <div className="right w-full lg:w-1/2 mt-10 lg:mt-0">
              <div className="top flex flex-col md:flex-row">
                <div className="bg-[#217aff] w-full md:w-1/2 p-5">
                  <h3 className="text-white font-light text-[40px] md:text-[55px]">
                    旅遊
                  </h3>
                  <span className="mt-4 block text-gray-300 text-[16px] md:text-[18px]">
                    不用換卡、不用等卡寄來、不用排隊買卡， eSIM
                    讓你一掃即用，落地立刻上網！
                  </span>
                </div>
                <div className="bg-white w-full md:w-1/2 p-5">
                  <h3 className="text-gray-800 font-light text-[40px] md:text-[55px]">
                    網速
                  </h3>
                  <span className="mt-4 block text-gray-900 text-[16px] md:text-[18px]">
                    出門在外最怕什麼？網路慢、訊號差。 我們的 eSIM 支援高速 4G /
                    5G，無論你人在城市街頭或離島海灘，訊號穩、速度快、不卡頓，打卡、導航、視訊都不卡關。
                  </span>
                </div>
              </div>
              <div className="bottom relative aspect-[16/9]">
                <Image
                  src="/images/step/992c846e-d00e-4718-8e27-429f0a2d5397.png"
                  alt=""
                  fill
                  className="object-cover"
                  loading="lazy"
                  placeholder="empty"
                />
              </div>
            </div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
}
