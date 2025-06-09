// /pages/account.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "./Layout.js";
import Image from "next/image";

const AccountPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // ✅ 取得使用者資訊
    fetch("https://starislandbaby.com/test/wp-json/wp/v2/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setUserInfo)
      .catch(() => router.push("/login"));

    // ✅ 取得 WooCommerce 訂單
    fetch("https://starislandbaby.com/test/wp-json/wc/v3/orders?customer=me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setOrders);

    // ✅ 取得我的最愛（從 localStorage 模擬）
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  if (!userInfo) return <p></p>;

  return (
    <Layout>
      <div className="min-h-screen mt-[150px] flex flex-col justify-start items-center pt-10">
        <div className="p-8 max-w-3xl w-full mx-auto">
          <h1 className="text-2xl font-bold mb-4">會員中心</h1>
          <p>姓名：{userInfo.name}</p>
          <p>Email：{userInfo.email}</p>

          <h2 className="text-xl font-semibold mt-6 mb-2">❤️ 我的最愛</h2>
          {favorites.length === 0 ? (
            <p>尚未加入任何商品至我的最愛。</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 border p-4 rounded shadow-sm"
                >
                  <Image
                    src={item.image || "/images/default.jpg"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded"
                  />
                  <p className="text-sm font-medium">{item.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
