import React from "react";
import EmblaCarousel from "./EmblaCarousel";
import Header from "./Header";
import Footer from "./Footer";

const OPTIONS = { dragFree: true, loop: true };

// Define an array of slide objects with iframe content
const SLIDES = [
  {
    image: "/images/japan.jpg", // Image for the first slide
    title: "Japan",
    description: "日本eSIM│5G高速固定流量│5、7、15、30天",
  },
  {
    image: "/images/japan.jpg", // Image for the first slide
    title: "Japan",
    description: "日本eSIM│5G高速固定流量│5、7、15、30天",
  },
  {
    image: "/images/japan.jpg", // Image for the first slide
    title: "Japan",
    description: "日本eSIM│5G高速固定流量│5、7、15、30天",
  },
  {
    image: "/images/japan.jpg", // Image for the first slide
    title: "Japan",
    description: "日本eSIM│5G高速固定流量│5、7、15、30天",
  },
  {
    image: "/images/japan.jpg", // Image for the first slide
    title: "Japan",
    description: "日本eSIM│5G高速固定流量│5、7、15、30天",
  },
  {
    image: "/images/japan.jpg", // Image for the first slide
    title: "Japan",
    description: "日本eSIM│5G高速固定流量│5、7、15、30天",
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
