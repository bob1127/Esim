import Logo from "./logo";
// import { Cloudinary } from "@cloudinary/url-gen";
import Image from "next/image";

import footerMobile from "./footerMobile.jsx";
import { Import } from "lucide-react";
import Link from "next/link";

// const myLoader = ({ src, width, quality, placeholder }) => {
//   return `https://www.ultraehp.com/images/Products-Detail-Img/UH-2/${src}?w=${width}?p=${placeholder}`
// }

const myLoader = ({ src, width, quality, placeholder }) => {
  return `https://www.ultraehp.com/images/footer/${src}?w=${width}?p=${placeholder}`;
};

export default function Footer() {
  return <footer className="bg-[#3894d6] h-[700px]"></footer>;
}
