import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion"; // Only need motion since AnimatePresence is moved to CreateConversationDialog
import CreateConversationDialog from "./CreateConversationDialog"; // Import CreateConversationDialog


const NoConversationPlaceholder = () => {

  const images = [
    "/banner1.png",
    "/banner2.png",
    "/banner3.png",
    "/banner4.png",
    "/banner5.png",
    "/banner6.png",
    "/banner7.png",
    "/banner8.png",
    "/banner9.png",
    "/banner10.png",
    "/banner.png",
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-500 to-indigo-700 space-y-4 p-6 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Section */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.img
          src="/logo.jpg"
          alt="Melodia"
          className="w-16 h-16 rounded-full object-cover"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" as const }}
        />
        <motion.h1
          className="text-2xl font-bold mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Melodia
        </motion.h1>
      </motion.div>

      {/* Slider Section */}
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Slider {...settings}>
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={image}
                alt={`Banner ${index + 1}`}
                className="rounded-lg w-full object-cover shadow-lg"
              />
            </motion.div>
          ))}
        </Slider>
      </motion.div>

      {/* Text Section */}
      <motion.div
        className="text-center space-y-1"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h3 className="text-lg font-medium">No conversation selected</h3>
        <p className="text-sm">
          Choose a friend to start chatting, or invite new friends to join Melodia!
        </p>
      </motion.div>

      {/* Buttons Section */}
      <motion.div
        className="space-x-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
          className="text-zinc-300 px-6 py-2 hover:text-emerald-400 border-zinc-700 bg-zinc-800/50">
            <CreateConversationDialog /> Conversation
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NoConversationPlaceholder;