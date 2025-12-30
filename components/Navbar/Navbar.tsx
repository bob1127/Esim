"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, MenuItem } from "../ui/navbar-menu";
import {
  UserIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

/**
 * ✅ 下拉選單文字項目：hover 時左側出現 icon（w-8 h-8）
 */
function IconHoveredLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        group flex items-center gap-3
        text-sm text-neutral-700
        hover:text-sky-600
        transition-colors
      "
    >
      <span className="relative w-8 h-8 shrink-0 overflow-hidden">
        <Image
          src="/images/logo/esim-icon.svg"
          alt=""
          fill
          className="
            object-contain
            opacity-0 -translate-x-2
            transition-all duration-300 ease-out
            group-hover:opacity-100 group-hover:translate-x-0
          "
        />
      </span>
      <span className="leading-tight">{children}</span>
    </Link>
  );
}

export function NavbarDemo() {
  return (
    <div className="relative min-h-[220px] flex items-start justify-center">
      <Navbar className="top-4" />
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 right-0 top-[68px] h-[160px] z-0"
      >
        <div
          className="w-full h-full bg-[#0876C9]"
          style={{
            clipPath: "ellipse(75% 60% at 50% 0%)",
          }}
        />
      </div>
    </div>
  );
}

export default function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileHotOpen, setMobileHotOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("token");
      const rawUser = localStorage.getItem("user");
      if (token && rawUser) {
        setIsLoggedIn(true);
        try {
          const parsed = JSON.parse(rawUser);
          setUserName(parsed?.name || null);
        } catch {
          setUserName(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    } catch {
      setIsLoggedIn(false);
      setUserName(null);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    setIsLoggedIn(false);
    setUserName(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  const showOverlay =
    Boolean(active) || mobileOpen || mobileHotOpen || userMenuOpen;

  return (
    <>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="nav-overlay"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999999] bg-black/35  pointer-events-none"
            style={{ WebkitBackdropFilter: "blur(2px)" }}
          />
        )}
      </AnimatePresence>

      <header className={cn("fixed inset-x-0 !z-[9999999] ", className)}>
        <div className="mx-auto w-[94%] max-w-[1920px] flex mt-4 items-center justify-between gap-4">
          <Link
            href="/"
            className="relative z-50 flex items-center gap-2 py-2 pr-2 select-none"
          >
            <span className="text-[22px] font-semibold leading-none tracking-tight">
              <span className="text-[#0A6CD0]">Jeko</span>
              <span className="text-[#24A148]">.eSIM</span>
            </span>
          </Link>

          {/* 桌機版選單 */}
          <div
            className={cn(
              "relative z-50 rounded-[15px] border border-white/30",
              "bg-gradient-to-b from-[#D6EEF9]/80 to-[#A9D5F1]/70",
              "shadow-[0_6px_18px_-6px_rgba(0,0,0,0.25)]",
              "backdrop-blur-md px-3 "
            )}
          >
            <Menu setActive={setActive}>
              <div className="hidden md:flex items-center">
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="首頁"
                  dropdownSizeClass="min-w-[520px] max-w-[680px]"
                  offsetXClass="-ml-10 md:-ml-[160px]"
                >
                  <div className="flex flex-col space-y-4">
                    <IconHoveredLink href="/news">最新優惠活動</IconHoveredLink>
                    <IconHoveredLink href="/coverage">
                      全球訊號覆蓋範圍
                    </IconHoveredLink>
                    <IconHoveredLink href="/support">幫助中心</IconHoveredLink>
                  </div>
                </MenuItem>

                <Divider />

                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="精選方案"
                  dropdownSizeClass="min-w-[1200px] max-w-[1680px]"
                  offsetXClass="md:-ml-[420px]"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeaturedCard
                      href="/esim/japan-5days"
                      img="/images/country/malaysia.jpg"
                      title="日本 5 日吃到飽"
                      subtitle="Docomo / Softbank"
                      description="高速穩定、不降速，適合追劇與地圖導航。"
                    />
                    <FeaturedCard
                      href="/esim/korea-daily"
                      img="/images/country/tailand.jpg"
                      title="韓國 每日 3GB"
                      subtitle="SKT 高覆蓋"
                      description="每日固定流量，社群拍照上傳不怕爆。"
                    />
                    <FeaturedCard
                      href="/esim/europe-30days"
                      img="/images/country/USA.jpg"
                      title="歐洲 30 國通用"
                      subtitle="跨國自動切換"
                      description="多國移動免換卡，出差旅遊首選。"
                    />
                    <FeaturedCard
                      href="/esim/global"
                      img="/images/country/malaysia.jpg"
                      title="全球周遊券"
                      subtitle="120+ 國可用"
                      description="商務族最愛，一張走天下。"
                    />
                  </div>
                </MenuItem>

                <Divider />

                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="旅遊文章｜須知"
                  href="/blog"
                >
                  <div className="flex flex-col space-y-4">
                    <IconHoveredLink href="/blog">熱門旅遊景點</IconHoveredLink>
                    <IconHoveredLink href="/blog">出國須知</IconHoveredLink>
                    <IconHoveredLink href="/blog">
                      eSIM疑難雜症排姐
                    </IconHoveredLink>
                  </div>
                </MenuItem>

                <Divider />

                <MenuItem setActive={setActive} active={active} item="限時特惠">
                  <div className="flex flex-col space-y-4">
                    <IconHoveredLink href="/promo/summer">
                      暑期旅遊祭 88 折
                    </IconHoveredLink>
                    <IconHoveredLink href="/promo/new-member">
                      新會員首購優惠
                    </IconHoveredLink>
                  </div>
                </MenuItem>

                <Divider />

                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="啟用教學"
                  href="/operation"
                >
                  <div className="flex flex-col space-y-4">
                    <IconHoveredLink href="/operation">
                      iOS 設定教學
                    </IconHoveredLink>
                    <IconHoveredLink href="/operation">
                      Android 設定教學
                    </IconHoveredLink>
                    <IconHoveredLink href="/operation">
                      Pixel 設定教學
                    </IconHoveredLink>
                    <IconHoveredLink href="/operation">
                      支援裝置列表
                    </IconHoveredLink>
                  </div>
                </MenuItem>

                <Divider />

                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="關於我們"
                  href="/about"
                >
                  <div className="flex flex-col space-y-4">
                    <IconHoveredLink href="/company">品牌故事</IconHoveredLink>
                    <IconHoveredLink href="/partners">合作夥伴</IconHoveredLink>
                    <IconHoveredLink href="/contact">聯絡客服</IconHoveredLink>
                  </div>
                </MenuItem>

                <Divider />
              </div>

              {/* 手機版：Re.MEDIA 點擊展開熱銷商品 */}
              <button
                type="button"
                onClick={() => {
                  setMobileHotOpen((v) => !v);
                  setMobileOpen(false);
                  setActive(null);
                }}
                className="md:hidden text-sm px-3 py-1 text-white/90 font-semibold tracking-wide active:scale-95 transition"
              >
                Hot.eSIM
              </button>
            </Menu>
          </div>

          <div className="relative z-50 flex items-center gap-2">
            <div className="hidden sm:flex">
              <div className="flex rounded-full overflow-hidden shadow-md border border-black/10 bg-white">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="px-4 py-2 flex items-center gap-1 text-sm font-semibold text-[#0D66D0] hover:bg-neutral-100 transition"
                >
                  <UserIcon className="w-5 h-5" />
                  {isLoggedIn && (
                    <span className="text-xs text-slate-600 max-w-[80px] truncate">
                      {userName || "會員"}
                    </span>
                  )}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                <Link
                  href="/Cart"
                  className="px-4 py-2 flex items-center justify-center bg-[#0D66D0] hover:brightness-110 transition"
                >
                  <ShoppingCartIcon className="w-5 h-5 text-white" />
                </Link>
              </div>
            </div>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[52px] w-[210px] rounded-xl bg-white shadow-lg border border-black/5 py-2 z-[999]"
                >
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 pb-2 text-xs text-neutral-500">
                        歡迎，{" "}
                        <span className="font-semibold">
                          {userName || "會員"}
                        </span>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                      >
                        會員中心
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        登出 Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                      >
                        登入 Login
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                      >
                        註冊 Register
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => {
                setMobileOpen((v) => !v);
                setMobileHotOpen(false);
                setUserMenuOpen(false);
              }}
              className="md:hidden ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white backdrop-blur shadow-sm hover:bg-white/20 transition"
            >
              <span className="sr-only">開啟選單</span>
              <div className="space-y-1.5">
                <span
                  className={cn(
                    "block h-[2px] w-5 rounded-full bg-white transition-transform duration-200",
                    mobileOpen && "translate-y-[6px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "block h-[2px] w-5 rounded-full bg-white transition-opacity duration-200",
                    mobileOpen && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "block h-[2px] w-5 rounded-full bg-white transition-transform duration-200",
                    mobileOpen && "-translate-y-[6px] -rotate-45"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ✅ 手機版展開選單（主選單）：與電腦版結構一致 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // 修正寬度：與 Header 寬度一致 (w-[94%] + mx-auto)，左右間距就會對齊
            className="fixed top-[80px] left-0 right-0 w-[94%] mx-auto z-[9999999999] md:hidden rounded-2xl bg-white shadow-xl border border-black/5 px-5 py-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex flex-col gap-5 text-sm text-neutral-800">
              <MobileGroup title="首頁">
                <MobileLink href="/news" onClick={() => setMobileOpen(false)}>
                  最新優惠活動
                </MobileLink>
                <MobileLink
                  href="/coverage"
                  onClick={() => setMobileOpen(false)}
                >
                  全球訊號覆蓋範圍
                </MobileLink>
                <MobileLink
                  href="/support"
                  onClick={() => setMobileOpen(false)}
                >
                  幫助中心
                </MobileLink>
              </MobileGroup>

              {/* 這裡的連結對應電腦版「精選方案」內的 featured cards，為了手機好點選，轉為文字列表 */}
              <MobileGroup title="精選方案">
                <MobileLink
                  href="/esim/japan-5days"
                  onClick={() => setMobileOpen(false)}
                >
                  日本 5 日吃到飽
                </MobileLink>
                <MobileLink
                  href="/esim/korea-daily"
                  onClick={() => setMobileOpen(false)}
                >
                  韓國 每日 3GB
                </MobileLink>
                <MobileLink
                  href="/esim/europe-30days"
                  onClick={() => setMobileOpen(false)}
                >
                  歐洲 30 國通用
                </MobileLink>
                <MobileLink
                  href="/esim/global"
                  onClick={() => setMobileOpen(false)}
                >
                  全球周遊券
                </MobileLink>
              </MobileGroup>

              <MobileGroup title="旅遊文章｜須知">
                <MobileLink href="/blog" onClick={() => setMobileOpen(false)}>
                  熱門旅遊景點
                </MobileLink>
                <MobileLink href="/blog" onClick={() => setMobileOpen(false)}>
                  出國須知
                </MobileLink>
                <MobileLink href="/blog" onClick={() => setMobileOpen(false)}>
                  eSIM疑難雜症排姐
                </MobileLink>
              </MobileGroup>

              <MobileGroup title="限時特惠">
                <MobileLink
                  href="/promo/summer"
                  onClick={() => setMobileOpen(false)}
                >
                  暑期旅遊祭 88 折
                </MobileLink>
                <MobileLink
                  href="/promo/new-member"
                  onClick={() => setMobileOpen(false)}
                >
                  新會員首購優惠
                </MobileLink>
              </MobileGroup>

              <MobileGroup title="啟用教學">
                <MobileLink
                  href="/operation"
                  onClick={() => setMobileOpen(false)}
                >
                  iOS 設定教學
                </MobileLink>
                <MobileLink
                  href="/operation"
                  onClick={() => setMobileOpen(false)}
                >
                  Android 設定教學
                </MobileLink>
                <MobileLink
                  href="/operation"
                  onClick={() => setMobileOpen(false)}
                >
                  Pixel 設定教學
                </MobileLink>
                <MobileLink
                  href="/operation"
                  onClick={() => setMobileOpen(false)}
                >
                  支援裝置列表
                </MobileLink>
              </MobileGroup>

              <MobileGroup title="關於我們">
                <MobileLink
                  href="/company"
                  onClick={() => setMobileOpen(false)}
                >
                  品牌故事
                </MobileLink>
                <MobileLink
                  href="/partners"
                  onClick={() => setMobileOpen(false)}
                >
                  合作夥伴
                </MobileLink>
                <MobileLink
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                >
                  聯絡客服
                </MobileLink>
              </MobileGroup>

              {/* 手機版 CTA */}
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-gray-100">
                <Link
                  href="https://line.me/"
                  className="w-full rounded-full bg-[#1EBE4D] px-4 py-2.5 text-center text-sm font-semibold text-white hover:brightness-110 transition shadow-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  LINE 線上客服
                </Link>
                <Link
                  href="/esim/all"
                  className="w-full rounded-full bg-[#0D66D0] px-4 py-2.5 text-center text-sm font-semibold text-white hover:brightness-110 transition shadow-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  立即購買 eSIM
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ✅ 手機版：Hot.eSIM 熱銷選單 (同樣修正寬度) */}
      <AnimatePresence>
        {mobileHotOpen && (
          <motion.nav
            key="mobile-hot-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // 修正寬度：與 Header 寬度一致 (w-[94%] + mx-auto)
            className="fixed top-[80px] left-0 right-0 w-[94%] mx-auto z-[9999999999] md:hidden rounded-2xl bg-white shadow-xl border border-black/5 px-5 py-4"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-2">
              本週熱銷排行
            </p>
            <div className="space-y-1.5">
              <MobileLink
                href="/esim/japan-7days"
                onClick={() => setMobileHotOpen(false)}
              >
                日本 5 日吃到飽 (NT$399)
              </MobileLink>
              <MobileLink
                href="/esim/korea-5days"
                onClick={() => setMobileHotOpen(false)}
              >
                韓國 SKT 高速方案
              </MobileLink>
              <MobileLink
                href="/esim/china-vpn"
                onClick={() => setMobileHotOpen(false)}
              >
                中港澳免翻牆卡
              </MobileLink>
              <MobileLink
                href="/esim/global-pass"
                onClick={() => setMobileHotOpen(false)}
              >
                全球 10 日商務通
              </MobileLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="mx-2 h-5 w-px bg-white/60"
      style={{
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
        mixBlendMode: "soft-light",
      }}
    />
  );
}

function MobileGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[12px] font-bold tracking-[0.05em] text-[#0A6CD0] bg-blue-50/50 px-2 py-1 rounded mb-1.5 inline-block">
        {title}
      </p>
      <div className="space-y-1 pl-1 border-l-2 border-gray-100 ml-1">
        {children}
      </div>
    </div>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-[14px] text-gray-600 hover:text-black hover:bg-neutral-50 transition active:bg-neutral-100"
    >
      {children}
    </Link>
  );
}

function FeaturedCard({
  href,
  img,
  title,
  subtitle,
  description,
}: {
  href: string;
  img: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        group rounded-2xl overflow-hidden
        border border-black/10 bg-white/100
        hover:bg-white transition
        shadow-[0_10px_25px_-12px_rgba(0,0,0,0.28)]
      "
    >
      <div className="relative aspect-[4.4/5] overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 right-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
          Hot
        </div>
      </div>
      <div className="p-4">
        <div className="text-[15px] font-extrabold text-slate-900 leading-snug">
          {title}
        </div>
        <div className="mt-1 text-xs font-semibold text-sky-700">
          {subtitle}
        </div>
        <p className="mt-2 text-[12px] leading-6 text-slate-600 line-clamp-2">
          {description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-800">
            立即查看
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-500 text-white transition group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
