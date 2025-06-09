"use client";
// import styles from "./page.module.scss";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwiperEsim from "../components/EmblaCarousel01/index";

// import { AnimatePresence } from "framer-motion";
// import Preloader from "../components/toys05/Preloader";
import Image from "next/image";
import IntroIos from "../components/IntroHeroIos.tsx";
import IntroHero from "../components/IntroHero";
import PageTransition from "../components/PageTransition.tsx";
// import { Link } from "lucide-react";
import Layout from "./Layout";
export default function Home() {
  const [showIos, setShowIos] = useState(false);

  return (
    <Layout>
      <PageTransition>
        <div className="pt-[280px] relative">
          <div className="flex w-screen justify-center bottom-2 fixed z-50 mb-[50px] gap-4">
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
          {/* 黑色遮罩 */}
          <div className="txt w-1/2 absolute z-50 left-[10%] top-1/2 -translate-y-1/2 ">
            <h2 className="text-white font-normal text-left text-[45px]">
              彈性資費
            </h2>
            <p className="text-white font-normal text-[24px]">
              按天 / 按流量彈性選擇，沒有合約束縛
            </p>
          </div>
          <div className="mask w-full h-full bg-black opacity-15 absolute z-10 left-0 top-0 pointer-events-none"></div>

          {/* SIM 卡 */}
          <div
            className="sim-card w-[140px] h-[200px] absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
    rounded-[20px] border border-white/20 backdrop-blur-md bg-white/10 shadow-xl overflow-hidden"
          >
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
              className="absolute top-0 right-0 w-[80px] h-[80px] bg-white/20 backdrop-blur-md"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            ></div>

            {/* 可加入模擬卡片內容 */}
            <div className="flex flex-col justify-center items-center h-full text-white p-4"></div>
          </div>

          {/* 背景圖片 */}
          <Image
            src="/images/banner01.jpg"
            alt="banner-img"
            placeholder="empty"
            loading="lazy"
            width={2000}
            height={1000}
            className="object-cover w-full h-full"
          />
        </section>

        <section className="section-product-intro bg-[#1757ff] px-[200px] py-[100px] mx-auto">
          <div className="title flex flex-col">
            <h2 className="text-white font-normal text-left text-[40px]">
              一鍵啟用全球上網
            </h2>
            <span className="text-white leading-snug text-[24px]">
              即買即用．免拆SIM卡．支援全球上網服務<br></br>{" "}
              跨國旅遊、出差、短租專用的 eSIM 解決方案
            </span>
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
          <SwiperEsim />
        </section>
        <section className="section-info px-[100px] bg-[#f9f9f9]">
          <div className="section-title text-[70px] font-normal text-black">
            DISCCOUNT
          </div>
          <div className="flex-row flex ">
            <div className="left w-1/2">
              <div className="bg-white h-[330px] p-5">
                <span className="">title discount</span>
                <div className="font-light text-black text-[50px]">88%</div>
                <span className="">
                  {" "}
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Quasi, error?
                </span>
              </div>
              <ul className="p-5 flex flex-col ">
                <li className="border-b-1 mt-4 group flex justify-between pb-3">
                  <span className="text-[14px] w-2/3">
                    {" "}
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Aspernatur sint earum veritatis, expedita inventore commodi
                    molestias error rerum hic maiores!
                  </span>
                  <button class=" relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-950 group-hover:bg-[#1757ff] font-medium text-neutral-200">
                    <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </li>
                <li className="border-b-1 mt-4 group flex justify-between pb-3">
                  <span className="text-[14px] w-2/3">
                    {" "}
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Aspernatur sint earum veritatis, expedita inventore commodi
                    molestias error rerum hic maiores!
                  </span>
                  <button class=" relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-950 group-hover:bg-[#1757ff] font-medium text-neutral-200">
                    <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </li>
                <li className="border-b-1 mt-4 group flex justify-between pb-3">
                  <span className="text-[14px] w-2/3">
                    {" "}
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Aspernatur sint earum veritatis, expedita inventore commodi
                    molestias error rerum hic maiores!
                  </span>
                  <button class=" relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-950 group-hover:bg-[#1757ff] font-medium text-neutral-200">
                    <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </li>
                <li className="border-b-1 mt-4 group flex justify-between pb-3">
                  <span className="text-[14px] w-2/3">
                    {" "}
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Aspernatur sint earum veritatis, expedita inventore commodi
                    molestias error rerum hic maiores!
                  </span>
                  <button class=" relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-950 group-hover:bg-[#1757ff] font-medium text-neutral-200">
                    <div class="translate-x-0 transition group-hover:translate-x-[300%]">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div class="absolute -translate-x-[300%] transition group-hover:translate-x-0">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
            <div className="right w-1/2">
              <div className="top flex ">
                <div className="bg-[#217aff] w-1/2 p-5">
                  <h3 className="text-white font-light text-[55px]">100%</h3>
                  <span className="mt-10  text-gray-300">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </span>
                </div>
                <div className="bg-[#ffffff] w-1/2 p-5">
                  <h3 className="text-gray-800 font-light text-[55px]">
                    SPEED
                  </h3>
                  <span className="mt-10  text-gray-300">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </span>
                </div>
              </div>
              <div className="bottom aspect-[16/9] ">
                <Image
                  src="https://images.pexels.com/photos/1829980/pexels-photo-1829980.jpeg?auto=compress&cs=tinysrgb&w=600"
                  className="object-cover"
                  alt=""
                  width={800}
                  height={400}
                  loading="lazy"
                  placeholder="empty"
                ></Image>
              </div>
            </div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
}
