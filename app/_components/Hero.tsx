

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight } from "lucide-react";
import React from "react";
import ThreeD from "./ThreeD";

const Hero = () => {
  return (
    <section className="relative bg-black text-white h-screen overflow-hidden">
      {/* 3D Background Element */}
      <ThreeD />

      {/* Content Layer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-3xl text-center px-4">
        <h1 className="t p-2 text-3xl font-extrabold text-transparent sm:text-7xl">
          CANVAS AND WIREFRAMING
        </h1>
        <p className="sm:block text-8xl font-bold">
          {" "}
          COLLABORATE AND CREATE{" "}
        </p>

        <p className="mx-auto mt-4 max-w-xl sm:text-base/relaxed">
          All-in-one markdown editor, collaborative canvas, and
          diagram-as-code builder
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <LoginLink className="flex items-center w-full rounded-lg border border-white bg-neutral-100 px-4 py-2 text-sm font-medium text-black hover:bg-neutral-300 hover:text-neutral-900 focus:outline-none focus:ring active:text-opacity-75 sm:w-auto">
            Get Started
            <p className="ml-2">
              <ArrowRight size={24} />
            </p>
          </LoginLink>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-black to-transparent z-10"></div>
      {/* also make a left and a right side of the screen */}
      <div className="absolute top-0 left-0 w-[20%] h-full bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-[20%] h-full bg-gradient-to-l from-black to-transparent z-10"></div>
    </section>
  );
};

export default Hero;
