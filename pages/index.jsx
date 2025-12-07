"use client";

import dynamic from "next/dynamic";
import Layout from "./Layout";
import PageTransition from "../components/PageTransition.tsx";
import FeatureCarousel from "../components/FeatureCarousel.jsx";
import ScrollScaleWrapper from "@/components/ScrollScaleWrapper";
import SwiperCarousel from "../components/SwiperCarousel/SwiperCardTravel.jsx";
import Country from "../components/Country/ImageTextSlider.jsx";
import Image from "next/image";
import AccordionEsim from "../components/AccordionEsim.jsx";
import Carousel from "../components/EmblaCarouselTravel/index.jsx";
import Project from "../components/ServiceSection.jsx";
import Link from "next/link";
const VuckoScroll = dynamic(() => import("@/components/CodegridScroll"), {
  ssr: false,
});

export default function Home() {
  return (
    <Layout>
      <>
        {/* <VuckoScroll brand="Codegrid" /> */}

        {/* 🎠 套用 scroll-scale 效果 */}
        {/* <ScrollScaleWrapper
          range={[0.95, 1.08]} // 可調整放大幅度
          offset={["start 100%", "end 0%"]} // 觸發更早
          className="transition-transform ease-linear"
        >
          <Carousel />
        </ScrollScaleWrapper> */}

        <section className="">
          <div className="z-[9999] relative">
            <br></br>
            <FeatureCarousel />
          </div>
          <div className="absolute  top-[-50px]   xl::top-[9%] left-[0%] 2xl:left-[80%] z-[1]">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
              id="blobSvg"
              className="w-[450px] h-[450px] xl:w-[650px] xl:h-[650px] 2xl:w-[800px] 2xl:h-[800px]"
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
          <div className="absolute  top-[-50px]   xl::top-[9%] left-[0%] 2xl:left-[-20%] z-[1]">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
              id="blobSvg"
              className="w-[450px] h-[450px] xl:w-[650px] xl:h-[650px] 2xl:w-[800px] 2xl:h-[800px]"
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
        </section>
        <img
          src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-1300x100_2d2c9e2f-293f-4f46-8b79-fed8dc5fa5bb.svg"
          alt=""
          className="w-full"
        />
        <section className="bg-[#147AD7] h-screen rounded-br-[130px] rounded-bl-[130px]">
          <div className="flex max-w-[1000px] mx-auto justify-between">
            <div className="txt">
              <h2 className="text-white tracking-widest text-4xl">
                熱門國家&地區
              </h2>
              <h3 className="text-white tracking-widest mt-2 text-2xl">
                快速找到您想去的旅遊目的地的 eSIM 卡
              </h3>
              <p className="text-slate-100 text-xl mt-6 leading-snug tracking-widest">
                在 Re.MEDIA 探索<br></br>經濟高效的旅遊數據方案<br></br>
                隨時隨地無縫連接<br></br>告別昂貴的國際漫遊費
              </p>
            </div>
            <div></div>
          </div>
          <Project />
        </section>
        <section className="pt-[150px] rounded-[32px] bg-white/40 border border-white/30 backdrop-blur-[25px] shadow-[0_30px_80px_rgba(36,57,69,0.15)] px-6 sm:px-10 mx-auto mt-[150px] w-[96%] py-[100px]">
          <div className="main-title max-w-[1000px] mx-auto flex justify-center flex-col items-center">
            <h2 className="text-5xl font-bold">如何使用 eSIM?</h2>
            <p className="text-slate-700 text-lg mt-3">How to use</p>
          </div>
          <div className="rounded-2xl bg-[#EBEEEF] py-20 max-w-[1500px] mx-auto flex justify-center flex-col items-center ">
            <div className="mb-10 w-full flex justify-around">
              <div className="flex w-[80%] mx-auto">
                <div className="w-1/2 flex pr-10 items-center flex-col">
                  <div>
                    <div className="max-w-[280px]">
                      <div className="bg-[#30ae99] p-2 rounded-[8px] text-white text-[16px] font-bold">
                        無論你去哪裡旅行，保持連線不斷網
                      </div>
                      <h3 className="text-3xl font-bold mt-2">什麼是 eSIM？</h3>
                    </div>
                    <p className="tetx-left font-bold mt-2">
                      告別實體 SIM 卡的束縛
                    </p>
                    <p className="mt-4 leading-relaxed text-gray-700">
                      eSIM（嵌入式 SIM 卡）是新一代的網路技術。
                      無需抽換實體卡片，只需掃描 QR Code 設定，
                      抵達目的地後開啟數據漫遊，即可立即連接當地高速網路，
                      省去保管實體卡片的麻煩。
                    </p>
                  </div>
                </div>
                <div className="w-1/2 pr-10">
                  <img
                    src="/images/如何使用esim.png"
                    className="w-full rounded-xl"
                    alt="eSIM使用說明"
                  />
                </div>
              </div>
            </div>
            <div className="border-l-5 border-[#147AD7] w-full flex justify-around">
              <div className="flex w-[80%] mx-auto">
                <div className="w-1/2 flex items-center flex-col">
                  <div>
                    <h3 className="text-3xl font-bold">
                      請確保您的手機運營商已解鎖<br></br>且與 eSIM 相容
                    </h3>
                    <p className="tetx-left font-bold mt-2">
                      eSIM 相容裝置列表
                    </p>
                    <p className="mt-4 leading-relaxed text-gray-700">
                      在購買前，請務必確認您的裝置支援 eSIM 功能且未被
                      電信商鎖定（Sim-Lock Free）。目前市面上新款 iPhone （XR/XS
                      以後機型）及多數 Android 旗艦機種皆已支援。
                    </p>
                  </div>
                </div>
                <div className="w-1/2">
                  <div>
                    <a href="#"></a>
                    <a href="#" className="">
                      <div className="flex justify-end items-center">
                        <div className="bg-white py-1 flex items-center px-4 rounded-[30px]">
                          {" "}
                          <div className="w-[7px] h-[7px] bg-[#2d7ee7] rounded-full"></div>
                          <div className="ml-3 tracking-widest font-bold text-[14px]">
                            使用 eSIM 快速教學
                          </div>
                        </div>
                      </div>
                    </a>
                    <a href="#" className="group">
                      <div className="flex justify-end items-center mt-2">
                        <div className="py-1 flex group-hover:bg-white duration-200 items-center px-4 rounded-[30px]">
                          {" "}
                          <div className="w-[7px] h-[7px] bg-[#2d7ee7] hidden group-hover:block duration-300 transition-all rounded-full"></div>
                          <div className="ml-3 tracking-widest font-bold text-[14px]">
                            產品相關政策及規範
                          </div>
                        </div>
                      </div>
                    </a>
                    <a href="/shopee-qrcode" className="group">
                      <div className="flex justify-end items-center mt-2">
                        <div className="py-1 flex group-hover:bg-white duration-200 items-center px-4 rounded-[30px]">
                          {" "}
                          <div className="w-[7px] h-[7px] bg-[#2d7ee7] hidden group-hover:block duration-300 transition-all rounded-full"></div>
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
            <div className="bg-white rounded-[10px] w-[80%] mx-auto p-10 mt-10">
              <div className="step border-b-1 border-gray-400 py-5">
                <div className="w-1/2 flex items-center">
                  <div className="w-[50px] bg-[#428aef] rounded-full h-[50px] text-white flex justify-center items-center font-bold text-xl">
                    1
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-2xl font-bold ml-3">
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
          className="w-full mt-[-150px]"
          alt=""
        />
        <section className="bg-[#07b53b] p-20">
          <div className="max-w-[1400px] mx-auto xl:w-[70%] sm:w-[85%] w-full">
            <div className="main-title">
              <h2 className="text-white text-5xl font-bold tracking-widest">
                Features
              </h2>
              <p className="text-slate-50">特色</p>
            </div>
            <div className="main pt-10">
              <div>
                <div className="title flex w-[70%] justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-white text-3xl">精選全球 eSIM</h3>
                  </div>
                  <div className="flex">
                    <div className="bg-white flex tracking-wider mx-2 items-center justify-center font-bold rounded-[20px] px-3 py-1 text-[14px]">
                      超快物流
                    </div>
                    <div className="bg-white flex tracking-wider mx-2 items-center justify-center font-bold rounded-[20px] px-3 py-1 text-[14px]">
                      即時客服
                    </div>
                    <div className="bg-white flex tracking-wider mx-2 items-center justify-center font-bold rounded-[20px] px-3 py-1 text-[14px]">
                      攻略分享
                    </div>
                  </div>
                </div>
                <div className="w-[30%]"></div>
              </div>
              <div className="chat p-8 bg-white relative flex rounded-[20px] mt-4">
                <div className="absolute bottom-[-30px] z-30 left-10 w-[40px] h-[40px]">
                  <img
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-43x30_bff1345c-8a45-4eed-ad55-45a1705d21db.svg"
                    alt=""
                    className="w-full"
                  />
                </div>
                <div className="left w-[70%]">
                  <AccordionEsim />
                </div>
                <div className="phone w-[30%] relative flex justify-between items-end">
                  <img
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-464x928_v-fs_webp_26a92258-9a41-4f50-af8c-624012999e60_small.webp"
                    className="w-[60%] absolute h-auto z-30 left-1/2 -translate-x-1/2 bottom-0"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-[1400px] mx-auto xl:w-[70%] sm:w-[85%] w-full">
            <div className="main pt-10">
              <div className="chat p-8 bg-white relative flex rounded-[20px] mt-4">
                <div className="absolute bottom-[-30px] z-30 left-10 w-[40px] h-[40px]">
                  <img
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-43x30_bff1345c-8a45-4eed-ad55-45a1705d21db.svg"
                    alt=""
                    className="w-full"
                  />
                </div>
                <div className="left w-[70%]">
                  <AccordionEsim />
                </div>
                <div className="phone w-[30%] relative flex justify-between items-end">
                  <img
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-464x928_v-fs_webp_26a92258-9a41-4f50-af8c-624012999e60_small.webp"
                    className="w-[60%] absolute h-auto z-30 left-1/2 -translate-x-1/2 bottom-0"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <img
          src="https://storage.googleapis.com/studio-design-asset-files/projects/8dO8NkVvan/s-1300x100_601d1578-d35b-424a-bd5b-dcee64d6b25f.svg"
          className="w-full rotate-180 mt-[0px]"
          alt=""
        />
        <section className="pt-[150px] rounded-[32px] bg-white/40 border border-white/30 backdrop-blur-[25px] shadow-[0_30px_80px_rgba(36,57,69,0.15)] px-6 sm:px-10 mx-auto mt-[-150px] w-[96%] py-[100px]">
          <div className="main-title flex flex-col max-w-[650px] mx-auto justify-center items-center">
            <h2 className="text-5xl font-bold">旅遊精選文章</h2>
            <p className="text-slate-700 mt-2">Travel Blog</p>

            <span className="tracking-widest text-[14px] text-center mt-3 leading-relaxed text-gray-600">
              精選全球熱門旅遊目的地攻略，從上網設定到必去景點，
              為您的旅程提供最實用的資訊與建議，讓自由行變得更簡單。
            </span>
          </div>
          <div className="mt-5">
            <Carousel />
          </div>
          <div className="cta-btn bg-[#1C82E0] max-w-[1160px] mx-auto rounded-[33px] p-10 mt-10">
            <div className="w-[90%] flex mx-auto flex-col">
              <div className="title flex justify-between items-center">
                <h3 className="text-white font-bold tracking-wider text-[26px]">
                  遇到問題需要協助？
                </h3>
                <span className="text-white text-[14px]">Customer Support</span>
              </div>
              <div className="cta-btn-wrapper">
                <div className="cta-btn group bg-[#0069CA] mt-4 rounded-[10px] p-2 cursor-pointer">
                  <div className="inner group-hover:bg-white bg-transparent duration-500 p-8 rounded-[10px] flex items-center">
                    <div className="w-1/2">
                      <h3 className="text-white group-hover:ml-6 group-hover:text-[#0069CA] duration-300 font-bold text-2xl">
                        LINE 官方客服
                      </h3>
                    </div>
                    <div className="border-l-1 w-[55%] flex justify-end !group-hover:w-[55%] duration-300 border-gray-50 pl-5 group-hover:border-[#0069CA]">
                      <span className="text-white group-hover:mr-10 duration-500 w-[300px] group-hover:text-[#0069CA] text-[14px]">
                        直接使用 LINE 與我們聯繫，真人客服即時在線。
                        如有使用問題請直接加入好友詢問。
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="relative">
          <div className="absolute w-[300px] h-[400px]"></div>
        </div>
      </>
    </Layout>
  );
}
