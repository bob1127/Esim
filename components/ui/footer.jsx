export default function Footer() {
  return (
    <footer className="relative bg-[#111111] py-[100px]">
      {/* SVG 中間圓弧突起 */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[100px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C400,150 800,-50 1200,0 L1200,100 L0,100 Z"
            fill="#111111"
          />
        </svg>
      </div>

      {/* Footer內容 */}
      <div className="relative z-10 px-6 py-20 text-white text-center">
        <div>
          <div className="left w-1/2"></div>
          <div className="right w-1/2"></div>
        </div>
        <p className="text-lg font-semibold">This is the footer area</p>
        <p className="text-sm text-center text-gray-400">
          網頁設計與系統開發由{" "}
          <a
            href="https://www.jeek-webdesign.com.tw"
            target="_blank"
            className="underline hover:text-white"
          >
            極客網頁設計
          </a>{" "}
          製作，版權所有 © {new Date().getFullYear()}。
        </p>
      </div>
    </footer>
  );
}
