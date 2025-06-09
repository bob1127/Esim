"use client";
import { useEffect } from "react";
import {
  motion,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

export default function IntroHero() {
  const logoControls = useAnimation();
  const phonesControls = useAnimation();
  const titleControls = useAnimation();
  const textControls = useAnimation();
  const ref = useRef(null); // ✅ 第二段 section ref

  // ✅ 只針對第二段 section 的滾動範圍偵測
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0px", "0px"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["120px", "0px"]); // 從下移到對齊
  const y3 = useTransform(scrollYProgress, [0, 1], ["240px", "0px"]); // 更低移到對齊

  useEffect(() => {
    async function sequence() {
      // LOGO 初始放大
      await logoControls.start({
        scale: 1,
        y: 0,
        opacity: 1,
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
      });

      // LOGO 縮小上移，手機 & title 同時進場
      await Promise.all([
        logoControls.start({
          scale: 0.5,
          y: "-160px",
          transition: { duration: 1.1, ease: [0.33, 1, 0.68, 1] },
        }),
        phonesControls.start({
          opacity: 1,
          y: -60,
          scale: 1,
          transition: {
            duration: 1.3,
            ease: [0.33, 1, 0.68, 1],
          },
        }),
        titleControls.start({
          opacity: 1,
          y: -60,
          scale: 1,
          transition: {
            duration: 1.3,
            ease: [0.33, 1, 0.68, 1],
          },
        }),
      ]);

      // 底部文字
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
      <section className="relative h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
        {/* LOGO */}
        <motion.div
          className="z-10 text-4xl font-extrabold mb-4"
          initial={{ scale: 2.2, y: 0, opacity: 0 }}
          animate={logoControls}
        >
          <div className="logo bg-rose-500 text-white rounded-[20px] flex justify-center items-center w-[180px] h-[180px] shadow-xl">
            ESIM
          </div>
        </motion.div>

        {/* LET'S GET ESIM */}
        <motion.div
          className="font-bold text-neutral-800 text-[45px] mb-6"
          initial={{ opacity: 0, y: 0, scale: 0.95 }}
          animate={titleControls}
        >
          LET&apos;S GET ESIM
        </motion.div>

        {/* 手機動畫區塊 */}
        <motion.div
          className="relative flex gap-4 z-0"
          initial={{ opacity: 0, y: 60, scale: 1.1 }}
          animate={phonesControls}
        >
          <img
            src="	https://mobile-magicui.vercel.app/Device-5.png"
            alt="Phone 1"
            className="w-[80px] md:w-[220px] translate-x-[20px]"
          />
          <img
            src="	https://mobile-magicui.vercel.app/Device-4.png"
            alt="Phone 2"
            className="w-[80px] md:w-[220px]"
          />
          <img
            src="	https://mobile-magicui.vercel.app/Device-3.png"
            alt="Phone 3"
            className="w-[80px] md:w-[220px]"
          />
          <img
            src="	https://mobile-magicui.vercel.app/Device-2.png"
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
      <section
        ref={ref}
        className="h-[200vh] bg-white flex flex-col items-center"
      >
        <div className="h-screen flex flex-col justify-center items-center sticky top-0">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Experience <br /> An app unlike any other
          </h2>
          <div className="flex gap-8">
            <motion.img
              src="https://mobile-magicui.vercel.app/Device-6.png"
              className="w-[200px] md:w-[280px]"
              style={{ y: y1 }}
              alt="Phone 1"
            />
            <motion.img
              src="	https://mobile-magicui.vercel.app/Device-7.png"
              className="w-[200px] md:w-[280px]"
              style={{ y: y2 }}
              alt="Phone 2"
            />
            <motion.img
              src="https://mobile-magicui.vercel.app/Device-8.png"
              className="w-[200px] md:w-[280px]"
              style={{ y: y3 }}
              alt="Phone 3"
            />
          </div>
        </div>
      </section>
    </>
  );
}
