import { useState } from "react";
import { Input, Button } from "@heroui/react";

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
        "https://starislandbaby.com/test/wp-json/custom/v1/register",
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
      <Input
        isRequired
        name="username"
        label="帳號"
        placeholder="請輸入帳號"
        value={form.username}
        onChange={handleChange}
        type="text"
      />
      <Input
        isRequired
        name="email"
        label="Email"
        placeholder="請輸入 Email"
        value={form.email}
        onChange={handleChange}
        type="email"
      />
      <Input
        isRequired
        name="password"
        label="密碼"
        placeholder="請輸入密碼"
        value={form.password}
        onChange={handleChange}
        type="password"
      />
      <div className="flex gap-2 justify-end">
        <Button fullWidth color="primary" type="submit">
          註冊
        </Button>
      </div>
      {message && <p className="text-sm text-center">{message}</p>}
    </form>
  );
};

export default RegisterForm;
