import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-[#fdf6ef] via-white to-[#e8f3ff] text-gray-800">
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-10 text-center md:text-left">
        {/* LOGO & 主選單區域 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 border-b border-gray-200 pb-8">
          <Link href="/" className="flex justify-center md:justify-start">
            {/* 建議換成 Re.MEDIA 的 Logo */}
            <Image
              src="/images/logo-neoai.svg"
              alt="Re.MEDIA Logo"
              width={160}
              height={60}
              className="h-auto w-[160px]"
            />
          </Link>

          {/* 主選單 */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link
              href="/esim/all"
              className="hover:text-sky-500 transition-colors"
            >
              所有 eSIM 方案
            </Link>
            <Link
              href="/guide"
              className="hover:text-sky-500 transition-colors"
            >
              安裝教學
            </Link>
            <Link
              href="/support"
              className="hover:text-sky-500 transition-colors"
            >
              常見問題
            </Link>
            <Link
              href="/company"
              className="hover:text-sky-500 transition-colors"
            >
              關於我們
            </Link>
            <Link
              href="/contact"
              className="hover:text-sky-500 transition-colors"
            >
              聯絡客服
            </Link>
          </nav>
        </div>

        {/* 地址與認證標章 */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-10 gap-6 text-sm">
          <div className="text-gray-600 leading-relaxed text-center md:text-left">
            <p>eSIM數位漫遊科技股份有限公司</p>
            <p>110 台(營運中心)</p>
            <p className="mt-1">客服信箱：support@re-media.com</p>
          </div>

          <div className="flex items-center gap-4">
            {/* 這裡通常放 SSL 安全憑證或支付安全標章 */}
            <Image
              src="/images/sgs.png"
              alt="Secure Payment"
              width={60}
              height={60}
              className="object-contain opacity-80 hover:opacity-100 transition"
            />
            <Image
              src="/images/isms.png"
              alt="Data Privacy"
              width={60}
              height={60}
              className="object-contain opacity-80 hover:opacity-100 transition"
            />
          </div>
        </div>

        {/* Scroll Top 按鈕 */}
        <div className="mt-10 flex justify-center md:justify-end">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-sky-500 text-sm hover:underline group"
          >
            返回頂部
            <span className="inline-block w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center group-hover:-translate-y-1 transition-transform">
              ↑
            </span>
          </button>
        </div>

        {/* 底部資訊列 (Copyright & Policy) */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-gray-700">
              隱私權政策
            </Link>
            <Link href="/terms" className="hover:text-gray-700">
              服務條款
            </Link>
            <Link href="/refund-policy" className="hover:text-gray-700">
              退換貨政策
            </Link>
          </div>
          <div>© 2025 Re.MEDIA Inc. All Rights Reserved.</div>
        </div>
      </div>

      {/* 淡淡漸層背景裝飾 (保留原設計) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#f8d6b1]/40 via-white to-[#a8d4ff]/40 blur-3xl opacity-70"></div>
    </footer>
  );
}
