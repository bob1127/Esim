"use client";
import { useEffect, useRef } from "react";
import {
  motion,
  useAnimation,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import SwiperEsim from "./EmblaCarousel01/index";
export default function IntroHero() {
  const logoControls = useAnimation();
  const phonesControls = useAnimation();
  const titleControls = useAnimation();
  const textControls = useAnimation();
  const ref = useRef(null);

  // ✅ Step 1: 滾動監聽 & 平滑 spring 包裝
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 15,
    mass: 0.3,
  });

  // ✅ Step 2: 計算三張圖片的 transform Y
  const y1 = useTransform(smoothProgress, [0, 1], ["20px", "-40px"]);
  const y2 = useTransform(smoothProgress, [0, 1], ["60px", "-20px"]);
  const y3 = useTransform(smoothProgress, [0, 1], ["100px", "0px"]);

  // ✅ 初始動畫流程
  useEffect(() => {
    async function sequence() {
      await logoControls.start({
        scale: 1,
        y: 0,
        opacity: 1,
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
      });

      await Promise.all([
        logoControls.start({
          scale: 0.5,
          y: "-160px",
          transition: { duration: 1.1, ease: [0.33, 1, 0.68, 1] },
        }),
        phonesControls.start({
          opacity: 1,
          y: -160,
          scale: 1,
          transition: { duration: 1.3, ease: [0.33, 1, 0.68, 1] },
        }),
        titleControls.start({
          opacity: 1,
          y: -160,
          scale: 1,
          transition: { duration: 1.3, ease: [0.33, 1, 0.68, 1] },
        }),
      ]);

      textControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.2 },
      });
    }

    sequence();
  }, []);

  return (
    <>
      {/* 第一段區塊 */}
      <section className="relative bg-white flex flex-col items-center justify-center">
        {/* LOGO */}
        <motion.div
          className="z-10 text-4xl flex flex-col justify-center items-center font-extrabold mb-4"
          initial={{ scale: 2.2, y: 0, opacity: 0 }}
          animate={logoControls}
        >
          <div className="logo bg-[#1757ff] text-white rounded-[20px] flex justify-center items-center w-[180px] h-[180px] shadow-xl">
            ESIM
          </div>
          <span className="text-[26px]">IOS</span>
        </motion.div>
        {/* Title */}
        <motion.div
          className="font-bold text-neutral-800 text-[45px] mb-6"
          initial={{ opacity: 0, y: 0, scale: 0.95 }}
          animate={titleControls}
        >
          LET&apos;S GET ESIM
        </motion.div>

        {/* 手機群動畫 */}
        <motion.div
          className="relative flex gap-4 z-0"
          initial={{ opacity: 0, y: 100, scale: 1.1 }}
          animate={phonesControls}
        >
          <img
            src="https://mobile-magicui.vercel.app/Device-5.png"
            alt="Phone 1"
            className="w-[80px] md:w-[220px] translate-x-[20px]"
          />
          <img
            src="https://mobile-magicui.vercel.app/Device-4.png"
            alt="Phone 2"
            className="w-[80px] md:w-[220px]"
          />
          <img
            src="https://mobile-magicui.vercel.app/Device-3.png"
            alt="Phone 3"
            className="w-[80px] md:w-[220px]"
          />
          <img
            src="https://mobile-magicui.vercel.app/Device-2.png"
            alt="Phone 4"
            className="w-[80px] md:w-[220px] -translate-x-[20px]"
          />
        </motion.div>

        {/* 底部文字 */}
        <motion.div
          className="absolute bottom-10 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={textControls}
        >
          <h1 className="text-3xl font-bold">選擇您的旅遊地區</h1>
          <p className="text-neutral-600 mt-2">Powered by Motion + Tailwind</p>
        </motion.div>
      </section>

      {/* 第二段區塊 - 改為非 sticky + 流暢滾動 */}
      <section
        ref={ref}
        className="bg-white mt-[80px] pt-[60px] pb-[160px] flex flex-col items-center"
      >
        <h2 className="text-4xl font-bold mb-12 text-center">
          Experience <br /> An app unlike any other
        </h2>
        <div className="flex gap-8">
          <motion.img
            src="https://mobile-magicui.vercel.app/Device-6.png"
            alt="Phone 1"
            className="w-[200px] md:w-[280px] will-change-transform"
            style={{ y: y1 }}
          />
          <motion.img
            src="https://mobile-magicui.vercel.app/Device-7.png"
            alt="Phone 2"
            className="w-[200px] md:w-[280px] will-change-transform"
            style={{ y: y2 }}
          />
          <motion.img
            src="https://mobile-magicui.vercel.app/Device-8.png"
            alt="Phone 3"
            className="w-[200px] md:w-[280px] will-change-transform"
            style={{ y: y3 }}
          />
        </div>
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
      <section className="w-[85%]  mx-auto">
        <div className="left text">
          <span className="mb-4">一鍵啟用全球上網</span>
          <h3 className="text-[#1757ff] mt-4 font-bold text-[24px]">
            無卡革命，暢遊世界
          </h3>
          <h3 className="text-[#050505] font-bold text-[24px]">
            即買即用．免拆SIM卡．支援全球上網服務 <br></br>
            跨國旅遊、出差、短租專用的 eSIM 解決方案
          </h3>
          <button className="group mt-6 relative inline-flex h-12 items-center justify-center overflow-hidden  border border-neutral-200 bg-white rounded-full font-medium">
            <div className="inline-flex h-12 translate-y-0  items-center justify-center px-6 text-neutral-950 transition duration-500 group-hover:-translate-y-[150%]">
              Hover me
            </div>
            <div className="absolute inline-flex  h-12 w-full translate-y-[100%] items-center justify-center text-neutral-50 transition duration-500 group-hover:translate-y-0">
              <span className="absolute h-full w-full translate-y-full  skew-y-12 scale-y-0 bg-[#1757ff] transition duration-500 group-hover:translate-y-0 group-hover:scale-150"></span>
              <span className="z-10 text-white">Hover me</span>
            </div>
          </button>
        </div>
        <div className="right phone"></div>
      </section>
    </>
  );
}
