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
  const [editingEmail, setEditingEmail] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const savedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
  }, [token, userInfo, router]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("登入中...");
    try {
      const res = await fetch(
        "https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/jwt-auth/v1/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await safeParseJSON(res);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        fetchUser(data.token);
        setMessage("登入成功！");
      } else {
        if (
          data?.code === "invalid_username" ||
          data?.code === "incorrect_password"
        ) {
          setMessage("帳號或密碼錯誤");
        } else {
          setMessage("帳號或密碼錯誤");
        }
      }
    } catch (err) {
      setMessage("登入失敗，請稍後再試");
      console.error("Login error:", err);
    }
  };

  const fetchUser = async (jwt) => {
    try {
      const res = await fetch(
        "https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/wp/v2/users/me",
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      const data = await res.json();
      if (!data.code) {
        setUserInfo(data);
        localStorage.setItem("user", JSON.stringify(data));
        setEditingEmail(data.email || "");
      } else {
        console.error("取使用者失敗：", data);
      }
    } catch (err) {
      console.error("無法取得使用者資訊", err);
    }
  };

  const handleEmailUpdate = async () => {
    if (!editingEmail) {
      alert("請輸入 Email");
      return;
    }
    try {
      const res = await fetch(
        `https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/wp/v2/users/${userInfo.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: editingEmail }),
        }
      );
      const data = await res.json();
      if (!data.code) {
        setUserInfo(data);
        localStorage.setItem("user", JSON.stringify(data));
        setEditMode(false);
        setMessage("Email 更新成功");
      } else {
        alert(data.message || "更新失敗");
      }
    } catch (err) {
      console.error("更新 email 發生錯誤", err);
    }
  };

  return (
    <Layout>
      {/* 整頁藍色背景，表單極簡白字＋底線 input */}
      <div className="flex bg-[#1C82E0] flex-col items-center justify-center px-4 min-h-screen pt-[100px]">
        <div className="w-full max-w-md mx-auto text-white">
          {/* 標題區 */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-wide">
              會員登入 / 註冊
            </h1>
            <p className="mt-1 text-sm text-white/70">
              使用同一組帳號管理您的 eSIM 訂單與 QR Code
            </p>
          </div>

          {/* TAB：登入 / 註冊 */}
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
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (loggingIn) return;
                        setLoggingIn(true);
                        await handleLogin(e);
                        setLoggingIn(false);
                      }}
                      className="flex flex-col gap-5"
                    >
                      {/* 帳號 / Email */}
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

                      {/* 密碼 */}
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

                      {/* 登入按鈕 */}
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

                    {/* 忘記密碼 */}
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-white/80 underline underline-offset-4 hover:text-white"
                      >
                        忘記密碼？
                      </button>
                    </div>

                    {/* 訊息 */}
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
            // 已登入狀態
            <div className="text-center space-y-5">
              <div>
                <h2 className="text-xl font-semibold">
                  歡迎回來，{userInfo?.name || "會員"}
                </h2>
                <p className="mt-1 text-xs text-white/70">
                  您將在數秒後自動返回首頁，繼續選購 eSIM
                </p>
              </div>

              <div className="text-sm text-white/80">
                {editMode ? (
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-[0.15em] text-white/70 text-left">
                      Email
                    </div>
                    <input
                      type="email"
                      value={editingEmail}
                      onChange={(e) => setEditingEmail(e.target.value)}
                      className="mt-1 block w-full bg-transparent border-0 border-b border-white/70 py-2 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0"
                      placeholder="請輸入 Email"
                    />
                    <div className="flex justify-center gap-3 text-xs">
                      <button
                        onClick={handleEmailUpdate}
                        className="rounded-full bg-white/95 px-4 py-1.5 font-semibold text-[#1C82E0] hover:bg白"
                      >
                        儲存
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="rounded-full border border-white/60 px-4 py-1.5 text白/80 hover:bg白/10"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">
                      Email：
                      <span className="text-white font-medium">
                        {userInfo?.email || "(未填寫)"}
                      </span>
                    </p>
                    <button
                      onClick={() => setEditMode(true)}
                      className="mt-2 text-xs text-white/80 underline underline-offset-4 hover:text-white"
                    >
                      修改 Email
                    </button>
                  </div>
                )}
              </div>

              {message && (
                <p className="text-xs text-center text-emerald-100">
                  {message}
                </p>
              )}
            </div>
          )}

          {/* 備註說明 */}
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
