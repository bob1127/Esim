// components/context/UserContext.js
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserInfo(storedToken);
    }
  }, []);

  const fetchUserInfo = async (jwt) => {
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
      console.error("Failed to fetch user info:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserInfo(null);
  };

  return (
    <UserContext.Provider value={{ token, userInfo, setToken, setUserInfo, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
