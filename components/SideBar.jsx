import React, { Component } from "react";
import {
  FiBarChart,
  FiChevronDown,
  FiChevronsRight,
  FiDollarSign,
  FiHome,
  FiMonitor,
  FiShoppingCart,
  FiTag,
  FiUsers,
} from "react-icons/fi";
import { motion } from "framer-motion";
import NavbarTestSideBar from "../components/NavbarTestSideBar.jsx";
class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false, // 默认侧边栏是关闭的
      selected: "Dashboard",
    };
  }

  ToggleClose = () => {
    this.setState((prevState) => {
      const newState = { open: !prevState.open };
      if (newState.open) {
        // 禁止滚动
        document.body.style.overflow = "hidden";
      } else {
        // 恢复滚动
        document.body.style.overflow = "auto";
      }
      return newState;
    });
  };

  setSelected = (title) => {
    this.setState({ selected: title });
  };

  Option = ({ Icon, title, notifs }) => {
    const { open, selected } = this.state;
    return (
      <motion.button
        layout
        onClick={() => this.setSelected(title)}
        className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
          selected === title
            ? "bg-indigo-100 text-indigo-800"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <motion.div
          layout
          className="grid h-full w-10 place-content-center text-lg"
        >
          <Icon />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            {title}
          </motion.span>
        )}

        {notifs && open && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ y: "-50%" }}
            transition={{ delay: 0.5 }}
            className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
          >
            {notifs}
          </motion.span>
        )}
      </motion.button>
    );
  };

  TitleSection = () => {
    const { open } = this.state;
    return (
      <div className="mb-3  border-b border-slate-300   pb-3">
        <div className="flex cursor-pointer pt-[40px] items-center justify-between rounded-md transition-colors hover:bg-slate-100">
          <div className="flex items-center p-3 gap-2">
            {open && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.125 }}
              >
                <span className="block text-black text-xs font-semibold">
                  商品導覽
                </span>
                <span className="block text-black text-xs text-slate-500">
                  選擇您需要的商品
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  };

  Logo = () => {
    return (
      <motion.div
        layout
        className="grid size-10 shrink-0 place-content-center rounded-md bg-indigo-600"
      >
        <svg
          width="24"
          height="auto"
          viewBox="0 0 50 39"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-slate-50"
        >
          <path
            d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
            stopColor="#000000"
          ></path>
          <path
            d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
            stopColor="#000000"
          ></path>
        </svg>
      </motion.div>
    );
  };

  render() {
    const { open, selected } = this.state;

    return (
      <div className="flex">
        {/* 独立的收起按钮 */}
        <motion.button
          layout
          onClick={this.ToggleClose}
          className="absolute top-8 right-4 mt-3 rounded-[100px] z-[999999999] border-t border-slate-300 w-[100px] h-[45px] bg-[#91AD9E] transition-colors hover:bg-[#667b70]"
        >
          <div className="flex items-center pb-2">
            <motion.div
              layout
              className="grid size-10 place-content-center text-lg"
            >
              <FiChevronsRight
                className={`transition-transform ${open && "rotate-180"}`}
              />
            </motion.div>
            {open ? (
              <motion.span
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.125 }}
                className="text-xs font-medium"
              >
                關閉
              </motion.span>
            ) : (
              <motion.span
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.125 }}
                className="text-xs font-medium"
              >
                選單
              </motion.span>
            )}
          </div>
        </motion.button>

        {/* 透明黑色背景 */}
        {open && (
          <motion.div
            layout
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-[9998]"
            onClick={this.ToggleClose}
          ></motion.div>
        )}

        {/* 侧边栏 */}
        <motion.nav
          layout
          className="sticky top-12 h-screen shrink-0 border-r border-slate-300 bg-white z-[9999]"
          style={{
            width: open ? "370px" : "0px",
          }}
        >
          <this.TitleSection />
          <div className="p-5">
            {/* 传递 ToggleClose 方法给 NavbarTestSideBar */}
            <NavbarTestSideBar closeSidebar={this.ToggleClose} />
          </div>
        </motion.nav>
        <div className="h-[100vh] fix top-0 w-full"></div>
      </div>
    );
  }
}

export default Example;
