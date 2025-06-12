import { useState } from "react";

const RegisterForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("註冊中...");

    try {
      const res = await fetch(
        "https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/custom/v1/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (res.ok && data.user_id) {
        setMessage("註冊成功！請登入");
        if (onSuccess) onSuccess();
      } else {
        setMessage(data.message || "註冊失敗");
      }
    } catch (err) {
      setMessage("錯誤：" + err.message);
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          帳號
        </label>
        <input
          required
          type="text"
          name="username"
          id="username"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50"
          placeholder="請輸入帳號"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          required
          type="email"
          name="email"
          id="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50"
          placeholder="請輸入 Email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          密碼
        </label>
        <input
          required
          type="password"
          name="password"
          id="password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50"
          placeholder="請輸入密碼"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 mt-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
      >
        註冊
      </button>

      {message && (
        <p className="text-sm text-center text-red-600 mt-2">{message}</p>
      )}
    </form>
  );
};

export default RegisterForm;
