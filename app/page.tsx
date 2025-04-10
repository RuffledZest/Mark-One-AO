"use client";

import Footer from "./_components/Footer";
import Header from "./_components/Header";
import Hero from "./_components/Hero";
import About from "./_components/About";
import Features from "./_components/Features";
export default function Home() {
  return (
    <div className="relative">
      <Header />
      <Hero />
      <About />
      <Features />
      {/* <Footer /> */}
    </div>
  );
}
