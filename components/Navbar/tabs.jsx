// Import necessary modules and components

"use client";

import React, { useRef, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@heroui/react";
import NavbarMobile from "../../components/NavbarTestSideBar";
import { motion } from "framer-motion";
import Logo from "./Logo.jsx";
import Image from "next/image.js";
import Navbar01 from "../../components/NavbarTest.jsx";
import SidebarNav from "../../components/SideBar.jsx";
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
            <Link href="/">
              <b className="text-[#20a3cf] font-bold text-[18px]">ESIM</b>
            </Link>
          </div>
          <div className="middle w-[80%] flex justify-center items-center">
            <Link
              href="/category/all-product/"
              className="group block py-3 hover:bg-[#4badf4] relative rounded-full bg-transparent px-4 text-neutral-950"
            >
              <span className="relative inline-flex overflow-hidden">
                <div className="translate-y-0 text-slate-700 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
                  Esim 產品
                </div>
                <div className="absolute translate-y-[110%] group-hover:text-white skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  Esim 產品
                </div>
              </span>
            </Link>

            <button className="group hover:bg-[#4badf4] relative h-12 rounded-full bg-transparent px-4 text-neutral-950">
              <span className="relative inline-flex overflow-hidden">
                <div className="translate-y-0 text-slate-700 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
                  使用教學
                </div>
                <div className="absolute translate-y-[110%] group-hover:text-white skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  使用教學
                </div>
              </span>
            </button>
            <button className="group hover:bg-[#4badf4] relative h-12 rounded-full bg-transparent px-4 text-neutral-950">
              <span className="relative inline-flex overflow-hidden">
                <div className="translate-y-0 text-slate-700 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
                  關於我們
                </div>
                <div className="absolute translate-y-[110%] group-hover:text-white skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  關於我們
                </div>
              </span>
            </button>
            <button className="group hover:bg-[#4badf4] relative h-12 rounded-full bg-transparent px-4 text-neutral-950">
              <span className="relative inline-flex overflow-hidden">
                <div className="translate-y-0 text-slate-700 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
                  相關資訊
                </div>
                <div className="absolute translate-y-[110%] group-hover:text-white skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                  相關資訊
                </div>
              </span>
            </button>
          </div>
          <div className="right w-[10%]"></div>
        </div>
      </div>
    </>
  );
};
