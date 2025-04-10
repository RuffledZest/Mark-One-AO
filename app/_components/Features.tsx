"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Code, GitBranch, Users, Zap } from "lucide-react";

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Code-First Design",
      description: "Create beautiful diagrams using code, making version control and collaboration seamless.",
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time, seeing changes as they happen.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Management",
      description: "Easily manage team members, permissions, and project access.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Experience smooth performance even with complex diagrams and large teams.",
    },
  ];

  return (
    <section className="relative bg-black text-white py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/50 to-black z-0"></div>
      
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold  ">
            Powerful Features
          </h2>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to create, collaborate, and succeed
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Features; 