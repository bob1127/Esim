"use client";

import { useUser } from "../../components/context/UserContext";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export const SlideTabsExample = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userInfo, logout } = useUser();

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

  const navLinks = [
    { label: "eSIM 產品", href: "/category/all-product/" },
    { label: "使用教學", href: "#" },
    { label: "關於我們", href: "#" },
    { label: "相關資訊", href: "#" },
  ];

  return (
    <>
      {/* ✅ 手機選單開啟時的背景遮罩 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[900] pointer-events-none"
            initial={false}
            animate={{ opacity: isMenuOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full h-full bg-white/30 backdrop-blur-md pointer-events-auto" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Navbar 主區塊（LOGO 與 X 在上方） */}
      <div className="fixed top-0 px-8 left-0 w-full z-[1000] bg-white/50 backdrop-blur-md border-b border-white/30 shadow-md">
        <div className="flex justify-between items-center px-4 py-3 md:py-4">
          <Link href="/" className="w-[38px] md:w-[40px]">
            <Image
              src="/images/logo/logo.svg"
              alt="ESIM Logo"
              width={120}
              height={40}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group hover:bg-[#4badf4] relative h-10 rounded-full bg-transparent px-4 text-neutral-950"
              >
                <span className="relative  inline-flex overflow-hidden">
                  <div className="translate-y-0 mt-2 text-slate-500 skew-y-0 transition duration-500 group-hover:-translate-y-[150%] group-hover:skew-y-12">
                    {link.label}
                  </div>
                  <div className="absolute translate-y-[110%] mt-2 group-hover:text-white skew-y-2 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                    {link.label}
                  </div>
                </span>
              </Link>
            ))}
          </div>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center gap-4">
            {userInfo ? (
              <>
                <span className="text-sm">Hello, {userInfo.name}</span>
                <button
                  onClick={logout}
                  className="px-3 py-1 bg-[#3b57ff] text-white rounded hover:bg-[#2f3dd3] transition"
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

          {/* Mobile Menu Icon */}
          <button
            className="md:hidden text-black z-[1001]"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden px-4 pb-4 fixed top-[64px] left-0 right-0 z-[950] bg-[#3b57ff] text-white shadow-lg py-6 rounded-b-lg"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="py-2 border-b border-white/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {userInfo ? (
                <>
                  <span className="text-sm text-slate-400 sm:text-slate-800">
                    Hello, {userInfo.name}
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-1 bg-white text-[#3b57ff] rounded hover:bg-gray-100 transition"
                  >
                    登出
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1 bg-white text-[#3b57ff] rounded hover:bg-gray-100 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登入
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
