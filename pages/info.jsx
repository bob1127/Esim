import React from "react";
import Layout from "./Layout";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function InfoPage() {
  return (
    <Layout>
      <section className="flex w-[98%] mx-x-auto">
        <div className="left w-1/2"></div>
        <div className="right w-1/2"></div>
      </section>
    </Layout>
  );
}
