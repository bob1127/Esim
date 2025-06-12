// Import necessary modules and components

"use client";
import { useUser } from "../../components/context/UserContext";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import NavbarMobile from "../../components/NavbarTestSideBar";
import { motion } from "framer-motion";
import Logo from "./Logo.jsx";
import Image from "next/image.js";
import Navbar01 from "../../components/NavbarTest.jsx";
import SidebarNav from "../../components/Sidebar.js";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import Icons from "./icons.jsx";
// import MobileMenu from "../mobileMenu/index.jsx";
import Marquee from "react-fast-marquee";
import DropDown from "../../components/DropdownMenu.jsx";
import Timer from "../../components/ShiftingCountdown";
// Define SlideTabsExample component
export const SlideTabsExample = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { userInfo, logout } = useUser();

  const { user } = useUser() || {}; // ✅ 加上容錯處理

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("https://starislandbaby.com/test/wp-json/wp/v2/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.code) setUserInfo(data);
        })
        .catch((err) => {
          console.error("無法取得使用者資訊", err);
        });
    }
  }, []);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <>
      <div
        className="top-0 mt-[-40px] pt-8 flex mx-auto left-[40%] justify-center fixed w-full z-[999999]
  bg-white/50 backdrop-blur-md backdrop-saturate-150 border-b border-white/30 rounded-none shadow-md"
      >
        <div className="flex w-full  py-4">
          <div className="left w-[10%]  flex justify-center items-center">
            <Link href="/" className="block w-[38px]">
              <Image
                src="/images/logo/logo.svg"
                alt="ESIM Logo"
                width={120}
                height={40}
                priority
              />
            </Link>
          </div>
          <div className="middle w-[80%] flex justify-center items-center">
            <Link
              href="/category/all-product/"
              className="group block py-3 hover:bg-[#4badf4] relative rounded-full bg-transparent px-4 text-neutral-950"
            >
              <span className="relative inline-flex overflow-hidden">
                <div className="translate-y-0 text-slate-500 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
                  eSIM 產品
                </div>
                <div className="absolute translate-y-[110%] group-hover:text-white skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  eSIM 產品
                </div>
              </span>
            </Link>

            <button className="group hover:bg-[#4badf4] relative h-12 rounded-full bg-transparent px-4 text-neutral-950">
              <span className="relative inline-flex overflow-hidden">
                <div className="translate-y-0 text-slate-500 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
                  使用教學
                </div>
                <div className="absolute translate-y-[110%] group-hover:text-white skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  使用教學
                </div>
              </span>
            </button>
            <button className="group hover:bg-[#4badf4] relative h-12 rounded-full bg-transparent px-4 text-neutral-950">
              <span className="relative inline-flex overflow-hidden">
                <div className="translate-y-0 text-slate-500 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
                  關於我們
                </div>
                <div className="absolute translate-y-[110%] group-hover:text-white skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  關於我們
                </div>
              </span>
            </button>

            <button className="group hover:bg-[#4badf4] relative h-12 rounded-full bg-transparent px-4 text-neutral-950">
              <span className="relative inline-flex overflow-hidden">
                <div className="translate-y-0 text-slate-500 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
                  相關資訊
                </div>
                <div className="absolute translate-y-[110%] group-hover:text-white skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  相關資訊
                </div>
              </span>
            </button>
          </div>
          <div className="right w-[10%]">
            <div className="flex justify-end items-center gap-4 pr-6">
              {userInfo ? (
                <>
                  <span className="text-sm">Hello, {userInfo.name}</span>
                  <button
                    onClick={logout}
                    className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                  >
                    登出
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                >
                  登入
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
