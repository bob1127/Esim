"use client";
// import styles from "./page.module.scss";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

          <div className="primary w-[100px] h-[100px]">Lorem</div>
        </div>
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
