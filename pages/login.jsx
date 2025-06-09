import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RegisterForm from "../components/RegisterForm";
import React from "react";
import { Tabs, Tab, Input, Link, Button, Card, CardBody } from "@heroui/react";
import Layout from "./Layout";

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
        router.push("/"); // 三秒後跳轉首頁
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [token, userInfo]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("登入中...");

    try {
      const res = await fetch(
        "https://starislandbaby.com/test/wp-json/jwt-auth/v1/token",
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
        "https://starislandbaby.com/test/wp-json/wp/v2/users/me",
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserInfo(null);
    setMessage("已登出");
  };

  return (
    <Layout>
      <div className="flex mt-[100px] flex-col items-center justify-center min-h-screen">
        <div className="p-8 h-[450px] shadow-lg border rounded-xl border-gray-200">
          {!token ? (
            <Card className="max-w-full w-[340px]">
              <CardBody className="overflow-hidden">
                <Tabs
                  fullWidth
                  aria-label="Tabs form"
                  selectedKey={selected}
                  size="md"
                  onSelectionChange={setSelected}
                >
                  <Tab key="login" title="登入">
                    <form
                      onSubmit={handleLogin}
                      className="flex flex-col gap-4"
                    >
                      <Input
                        isRequired
                        label="帳號"
                        name="username"
                        placeholder="請輸入帳號"
                        value={form.username}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                      />
                      <Input
                        isRequired
                        className="!border-none"
                        label="密碼"
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
                      />
                      <p className="text-center text-small">
                        還沒有帳號？
                        <Link size="sm" onPress={() => setSelected("sign-up")}>
                          註冊
                        </Link>
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button type="submit" fullWidth color="primary">
                          登入
                        </Button>
                      </div>
                      {message && (
                        <p className="text-sm text-center text-red-500">
                          {message}
                        </p>
                      )}
                    </form>
                  </Tab>
                  <Tab key="sign-up" title="註冊">
                    <RegisterForm onSuccess={() => setSelected("login")} />
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
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
