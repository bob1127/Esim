import { useState, useEffect } from "react";

const RESEND_WAIT_SECONDS = 60; // 幾秒後才顯示「沒收到？重新寄送」

const RegisterForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    code: "",
  });

  const [message, setMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  // 防止連點與倒數
  const [cooldown, setCooldown] = useState(0); // 發送按鈕冷卻（10s）
  const [resendWait, setResendWait] = useState(0); // 顯示「重新寄送」前的等待（60s）
  const [sending, setSending] = useState(false); // 正在送出「寄送驗證碼」
  const [verifying, setVerifying] = useState(false); // 正在驗證中
  const [registering, setRegistering] = useState(false); // 正在註冊中

  useEffect(() => {
    let t;
    if (cooldown > 0) t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    let t;
    if (resendWait > 0) t = setTimeout(() => setResendWait((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendWait]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 共用：呼叫 /api/send-code
  const sendCode = async (action = "new") => {
    if (sending || cooldown > 0) return;
    if (!form.email) return setMessage("請先輸入 Email");

    setSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, action }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(
          action === "resend"
            ? "已重新寄送驗證碼，請查收 Email"
            : "驗證碼已寄出，請查收 Email"
        );
        setIsCodeSent(true);
        setIsCodeVerified(false); // 重新寄送後一定要重驗
        setForm((prev) => ({ ...prev, code: "" })); // 清空輸入框
        setCooldown(data.cooldown ?? 10); // 伺服器回的冷卻秒數（預設 10）
        setResendWait(RESEND_WAIT_SECONDS); // 再等一段時間才顯示「重新寄送」
      } else {
        setMessage(data.message || "驗證碼寄送失敗");
      }
    } catch (err) {
      setMessage("錯誤：" + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSendCode = () => sendCode("new");
  const handleResend = () => sendCode("resend");

  const handleVerifyCode = async () => {
    if (verifying) return;
    if (!form.email || !form.code) {
      return setMessage("請輸入 Email 與驗證碼");
    }

    setVerifying(true);
    setMessage("");
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: form.code }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("✅ 驗證成功，請繼續註冊");
        setIsCodeVerified(true);
      } else {
        setMessage(data.message || "驗證碼錯誤或已過期");
      }
    } catch (err) {
      setMessage("錯誤：" + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registering) return;
    if (!isCodeVerified) return setMessage("請先完成 Email 驗證");

    setRegistering(true);
    setMessage("註冊中...");
    try {
      const res = await fetch(
        "https://inf.fjg.mybluehost.me/website_d17cf1ea/wp-json/custom/v1/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.user_id) {
        setShowSuccessPopup(true);
        setMessage("");
        onSuccess?.("註冊成功！請登入會員");
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        setMessage(data.message || "註冊失敗");
      }
    } catch (err) {
      setMessage("錯誤：" + err.message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="relative text-white">
      {showSuccessPopup && (
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm">
          註冊成功！
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-5">
        {/* 帳號 */}
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-white/70">
            帳號
          </label>
          <input
            required
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="mt-1 block w-full bg-transparent border-0 border-b border-white/70 py-2 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0"
            placeholder="請輸入帳號"
          />
        </div>

        {/* Email + 發送驗證碼 */}
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-white/70">
            Email
          </label>
          <div className="mt-1 flex gap-2">
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="flex-1 bg-transparent border-0 border-b border-white/70 py-2 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0"
              placeholder="請輸入 Email"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending || cooldown > 0}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold shadow-sm transition ${
                sending || cooldown > 0
                  ? "bg-white/30 text-white/70 cursor-not-allowed"
                  : "bg-white/95 text-[#1C82E0] hover:bg-white"
              }`}
            >
              {sending
                ? "寄送中..."
                : cooldown > 0
                ? `請稍候 ${cooldown}s`
                : "發送驗證碼"}
            </button>
          </div>
        </div>

        {/* 驗證碼 + 驗證按鈕 */}
        {isCodeSent && (
          <>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/70">
                驗證碼
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="flex-1 bg-transparent border-0 border-b border-white/70 py-2 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0"
                  placeholder="請輸入驗證碼"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifying}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold shadow-sm transition ${
                    verifying
                      ? "bg-white/30 text-white/70 cursor-not-allowed"
                      : "bg-white/95 text-[#1C82E0] hover:bg-white"
                  }`}
                >
                  {verifying ? "驗證中..." : "驗證"}
                </button>
              </div>
            </div>

            {/* 沒收到驗證碼？重新寄送 */}
            <div className="text-xs text-white/70">
              {resendWait > 0 ? (
                <span>若未收到，可於 {resendWait}s 後重新寄送</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={sending || cooldown > 0}
                  className="underline underline-offset-2 hover:text-white disabled:text-white/40"
                >
                  沒收到驗證碼？重新寄送
                </button>
              )}
            </div>
          </>
        )}

        {/* 密碼 */}
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-white/70">
            密碼
          </label>
          <input
            required
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full bg-transparent border-0 border-b border-white/70 py-2 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-0"
            placeholder="請輸入密碼"
          />
        </div>

        {/* 註冊按鈕 */}
        <button
          type="submit"
          disabled={registering}
          className={`mt-2 w-full rounded-full py-2.5 text-sm font-semibold tracking-wide shadow-sm transition ${
            registering
              ? "bg-white/40 text-[#1C82E0] cursor-not-allowed"
              : "bg-white/95 text-[#1C82E0] hover:bg-white"
          }`}
        >
          {registering ? "註冊中..." : "註冊"}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-center text-xs text-amber-100">{message}</p>
      )}
    </div>
  );
};

export default RegisterForm;
