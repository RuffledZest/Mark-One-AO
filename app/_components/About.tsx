"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="relative bg-black text-white py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-0"></div>
      
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            About Our Platform
          </h2>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            A revolutionary space where creativity meets collaboration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
            <p className="text-gray-300">
              We envision a world where teams can seamlessly collaborate on visual projects,
              breaking down the barriers between design and development. Our platform brings
              together the best of both worlds in one intuitive interface.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-300">
              To empower teams with tools that make collaboration effortless and enjoyable.
              We're building a platform that understands the needs of modern teams and
              provides solutions that just work.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-red-600 flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default About; 