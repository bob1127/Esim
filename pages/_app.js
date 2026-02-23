// pages/_app.js
import '../src/globals.css'; // 确保路径正确
import Head from 'next/head'; // ★★★ 引入 Next.js 的 Head 元件 ★★★
import { NextUIProvider } from '@nextui-org/react'; // 如果使用 NextUI 的 Provider
import { AuthProvider } from '../components/AuthProvider';
import { CartProvider } from "../components/context/CartContext"; // 引入 CartProvider

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* ★★★ 新增 PWA 需要的全域 Head 宣告 ★★★ */}
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
        <meta name="theme-color" content="#147AD7" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>

      <AuthProvider>
        <NextUIProvider>
          <CartProvider>
            <Component {...pageProps} />
          </CartProvider>
        </NextUIProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;