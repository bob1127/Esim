import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./Layout";
import RegisterForm from "../components/RegisterForm";

const LoginRegisterPage = () => {
  const router = useRouter();
  const [selected, setSelected] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token && userInfo) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [token, userInfo]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("登入中...");
    try {
      const res = await fetch(
        "https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/jwt-auth/v1/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        fetchUser(data.token);
        setMessage("登入成功！");
      } else {
        setMessage(data.message || "登入失敗");
      }
    } catch (err) {
      setMessage("登入失敗: " + err.message);
    }
  };

  const fetchUser = async (jwt) => {
    try {
      const res = await fetch(
        "https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/wp/v2/users/me",
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      const data = await res.json();
      if (!data.code) setUserInfo(data);
    } catch (err) {
      console.error("無法取得使用者資訊", err);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen pt-[100px]">
        <div className="w-full max-w-md p-8 border rounded-xl shadow-lg">
          {!token ? (
            <div>
              <div className="flex justify-around mb-6">
                <button
                  onClick={() => setSelected("login")}
                  className={`px-4 py-2 rounded-t-lg font-bold transition-all duration-200 ${
                    selected === "login"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  登入
                </button>
                <button
                  onClick={() => setSelected("sign-up")}
                  className={`px-4 py-2 rounded-t-lg font-bold transition-all duration-200 ${
                    selected === "sign-up"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  註冊
                </button>
              </div>
              {selected === "login" ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      帳號
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      密碼
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-600 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition"
                  >
                    登入
                  </button>
                  {message && (
                    <p className="text-sm text-center text-red-500">
                      {message}
                    </p>
                  )}
                </form>
              ) : (
                <RegisterForm onSuccess={() => setSelected("login")} />
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">歡迎回來，{userInfo?.name}</h2>
              {message && <p className="text-sm text-center">{message}</p>}
              <span>等待跳轉至首頁，繼續購物</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LoginRegisterPage;
