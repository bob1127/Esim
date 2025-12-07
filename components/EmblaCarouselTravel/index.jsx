import React from "react";
import EmblaCarousel from "./EmblaCarousel";
import Header from "./Header";
import Footer from "./Footer";

const OPTIONS = { dragFree: true, loop: true };

// Define an array of slide objects with iframe content
const SLIDES = [
  {
    image: "/images/日本-01.png",
    title: "日本京都自由行",
    description: "日本京都自由行全攻略，帶你玩透日本京都",
  },
  {
    image: "/images/日本-01.png",
    title: "日本京都自由行",
    description: "日本京都自由行全攻略，帶你玩透日本京都",
  },
  {
    image: "/images/日本-01.png",
    title: "日本京都自由行",
    description: "日本京都自由行全攻略，帶你玩透日本京都",
  },
  {
    image: "/images/日本-01.png",
    title: "日本京都自由行",
    description: "日本京都自由行全攻略，帶你玩透日本京都",
  },
  {
    image: "/images/日本-01.png",
    title: "日本京都自由行",
    description: "日本京都自由行全攻略，帶你玩透日本京都",
  },
  {
    image: "/images/日本-01.png",
    title: "日本京都自由行",
    description: "日本京都自由行全攻略，帶你玩透日本京都",
  },
  {
    image: "/images/日本-01.png",
    title: "日本京都自由行",
    description: "日本京都自由行全攻略，帶你玩透日本京都",
  },
  {
    image: "/images/日本-01.png",
    title: "日本京都自由行",
    description: "日本京都自由行全攻略，帶你玩透日本京都",
  },
];

const App = () => (
  <>
    {/* Uncomment the lines below if you have header and footer components */}
    {/* <Header /> */}
    <EmblaCarousel slides={SLIDES} options={OPTIONS} />
    {/* <Footer /> */}
  </>
);

export default App;
