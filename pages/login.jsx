// pages/login.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./Layout";
import RegisterForm from "../components/RegisterForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

const LoginRegisterPage = () => {
  const router = useRouter();
  const [selected, setSelected] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });

  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUserInfo(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const stripTags = (html) =>
    typeof html === "string"
      ? html
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";

  const safeParseJSON = async (res) => {
    try {
      return await res.json();
    } catch {
      const text = await res.text();
      return { message: stripTags(text) || "登入失敗" };
    }
  };

  const fetchUser = async (jwt) => {
    const res = await fetch(
      "https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/wp/v2/users/me?context=edit",
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    const data = await res.json();
    if (!data?.code) return data;
    throw new Error(data?.message || data?.code || "fetch user failed");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loggingIn) return;

    setLoggingIn(true);
    setMessage("登入中...");

    try {
      const res = await fetch(
        "https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/jwt-auth/v1/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        }
      );

      const data = await safeParseJSON(res);

      if (res.ok && data?.token) {
        // ✅ 一定要存在 localStorage（同 origin 才拿得到）
        localStorage.setItem("token", data.token);
        setToken(data.token);

        // ✅ 抓使用者並存
        const user = await fetchUser(data.token);
        localStorage.setItem("user", JSON.stringify(user));
        setUserInfo(user);

        setMessage("登入成功！正在前往會員中心...");
        // ✅ 直接去 account，方便你測 token
        router.push("/account");
        return;
      }

      if (
        data?.code === "invalid_username" ||
        data?.code === "incorrect_password"
      ) {
        setMessage("帳號或密碼錯誤");
      } else {
        setMessage(data?.message || "登入失敗，請稍後再試");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("登入失敗，請稍後再試");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <Layout>
      <div className="flex bg-[#1C82E0] flex-col items-center justify-center px-4 min-h-screen pt-[100px]">
        <div className="w-full max-w-md mx-auto text-white">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-wide">
              會員登入 / 註冊
            </h1>
            <p className="mt-1 text-sm text-white/70">
              使用同一組帳號管理您的 eSIM 訂單與 QR Code
            </p>
          </div>

          {!token ? (
            <div>
              <div className="flex justify-around mb-6 border-b border-white/30">
                <button
                  onClick={() => {
                    setSelected("login");
                    setShowForgot(false);
                  }}
                  className={`pb-2 text-sm font-semibold tracking-wide transition-colors ${
                    selected === "login"
                      ? "text-white border-b-2 border-white"
                      : "text-white/60 hover:text-white/90"
                  }`}
                >
                  登入
                </button>
                <button
                  onClick={() => {
                    setSelected("sign-up");
                    setShowForgot(false);
                  }}
                  className={`pb-2 text-sm font-semibold tracking-wide transition-colors ${
                    selected === "sign-up"
                      ? "text-white border-b-2 border-white"
                      : "text-white/60 hover:text-white/90"
                  }`}
                >
                  註冊
                </button>
              </div>

              {selected === "login" && successMessage && (
                <div className="mb-4 rounded-md bg-emerald-500/20 px-3 py-2 text-center text-xs text-emerald-50">
                  {successMessage}
                </div>
              )}

              {selected === "login" ? (
                !showForgot ? (
                  <>
                    <form
                      onSubmit={handleLogin}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <label className="text-xs uppercase tracking-[0.15em] text-white/70">
                          帳號 / Email
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
                          className="mt-1 block w-full bg-transparent border-0 border-b border-white/70 py-2 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0"
                          required
                          placeholder="請輸入帳號或 Email"
                          autoComplete="username"
                        />
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-[0.15em] text-white/70">
                          密碼
                        </label>
                        <input
                          type="password"
                          name="password"
                          placeholder="請輸入密碼"
                          value={form.password}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full bg-transparent border-0 border-b border-white/70 py-2 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0"
                          required
                          autoComplete="current-password"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loggingIn}
                        className={`mt-2 w-full rounded-full bg-white/95 py-2.5 text-sm font-semibold text-[#1C82E0] tracking-wide shadow-sm transition hover:bg-white ${
                          loggingIn ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {loggingIn ? "登入中…" : "登入"}
                      </button>
                    </form>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-white/80 underline underline-offset-4 hover:text-white"
                      >
                        忘記密碼？
                      </button>
                    </div>

                    {message && (
                      <p className="mt-3 text-center text-xs text-red-100">
                        {message}
                      </p>
                    )}
                  </>
                ) : (
                  <ForgotPasswordForm onClose={() => setShowForgot(false)} />
                )
              ) : (
                <RegisterForm
                  onSuccess={(msg) => {
                    setSelected("login");
                    setSuccessMessage(msg);
                    setShowForgot(false);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-xl font-semibold">
                  已登入：{userInfo?.name || "會員"}
                </h2>
                <p className="mt-1 text-xs text-white/70">
                  若你要測 token，請開 Console 執行
                  localStorage.getItem("token")
                </p>
              </div>

              <button
                onClick={() => router.push("/account")}
                className="w-full rounded-full bg-white/95 py-2.5 text-sm font-semibold text-[#1C82E0] tracking-wide shadow-sm transition hover:bg-white"
              >
                前往會員中心
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  setToken(null);
                  setUserInfo(null);
                }}
                className="w-full rounded-full border border-white/70 py-2.5 text-sm font-semibold text-white tracking-wide transition hover:bg-white/10"
              >
                登出（清除 token）
              </button>
            </div>
          )}

          <div className="mt-10 text-center">
            <span className="block text-[12px] leading-relaxed text-white/70">
              備註：請填入正確的 Email
              <br />此 Email 將作為發送 eSIM QR Code 與訂單通知的依據
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginRegisterPage;
