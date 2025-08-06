import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { Music, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input"; // Thêm import cho Input
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Thêm import cho Collapsible
import { motion, AnimatePresence } from "framer-motion";

const AllInstruments = () => {
  const { instruments, fetchInstruments, isLoading } = useMusicStore();
  const [searchTerm, setSearchTerm] = useState(""); // State cho thanh tìm kiếm
  const [isOpen, setIsOpen] = useState(false); // State cho Collapsible
  const INITIAL_DISPLAY_COUNT = 12; // Giới hạn số nhạc cụ hiển thị ban đầu

  useEffect(() => {
    if (!instruments.length) {
      fetchInstruments();
    }
  }, [fetchInstruments, instruments.length]);

  // Lọc danh sách nhạc cụ dựa trên từ khóa tìm kiếm
  const filteredInstruments = instruments.filter((instrument) =>
    instrument.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex items-center justify-center text-white bg-zinc-950"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-2"
        >
          <Music className="h-6 w-6 text-green-500" />
          <span>Loading instruments...</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full w-full bg-zinc-950 text-white overflow-hidden"
    >
      {/* Header */}
      <motion.header
        variants={headerVariants}
        className="sticky top-0 z-30 flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-lg shadow-md"
      >
        <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
        <Separator orientation="vertical" className="h-6 bg-zinc-800" />
        <Breadcrumb>
          <BreadcrumbList className="text-zinc-400">
            <BreadcrumbItem>
              <BreadcrumbLink className="hover:text-sky-500 transition-colors">
                <Link to={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-600" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-sky-500 font-semibold">
                <Link to={`/instruments`}>Instruments</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.header>

      <ScrollArea className="h-[calc(100vh-134px)]">
        <div className="relative min-h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          {/* Hero Section */}
          <motion.section
            variants={heroVariants}
            className="relative h-[40vh] flex items-center justify-center bg-gradient-to-br from-sky-500/20 via-zinc-900 to-black"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
            <motion.div variants={containerVariants} className="relative z-10 text-center">
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg"
              >
                Explore All Instruments
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-2 text-lg text-zinc-300 max-w-2xl"
              >
                Discover a world of music with {instruments.length} unique instruments to
                explore.
              </motion.p>
            </motion.div>
          </motion.section>

          {/* Instruments Section */}
          <motion.div
            variants={containerVariants}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <div className="flex justify-between items-center mb-8">
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold text-white flex items-center gap-3"
              >
                <Music className="h-6 w-6 text-green-500" /> All Instruments
              </motion.h2>
              <motion.div variants={itemVariants} className="w-full max-w-xs">
                <Input
                  placeholder="Search instruments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                />
              </motion.div>
            </div>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredInstruments.slice(0, INITIAL_DISPLAY_COUNT).map((instrument) => (
                <motion.div key={instrument._id} variants={itemVariants}>
                  <Card className="group rounded-xl bg-zinc-800/50 h-full border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-4 relative">
                      <div className="relative mb-3">
                        <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                          <img
                            src={
                              instrument.imageUrl || "https://via.placeholder.com/300x300"
                            }
                            alt={instrument.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <Button
                          size="icon"
                          className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-green-500 hover:bg-green-400 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          asChild
                        >
                          <Link to={`/instruments/${instrument._id}`}>
                            <Music className="h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                      <div className="text-center">
                        <Link
                          to={`/instruments/${instrument._id}`}
                          className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                        >
                          {instrument.name}
                        </Link>
                        <p className="text-xs text-zinc-400">
                         {instrument?.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Collapsible Section */}
            {filteredInstruments.length > INITIAL_DISPLAY_COUNT && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-8">
                <AnimatePresence>
                  {isOpen && (
                    <CollapsibleContent asChild>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6"
                        >
                          {filteredInstruments.slice(INITIAL_DISPLAY_COUNT).map((instrument) => (
                            <motion.div key={instrument._id} variants={itemVariants}>
                              <Card className="group rounded-xl bg-zinc-800/50 h-full border-zinc-700 shadow-md hover:shadow-xl hover:bg-zinc-700/90 transition-all duration-300 overflow-hidden">
                                <CardContent className="p-4 relative">
                                  <div className="relative mb-3">
                                    <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                      <img
                                        src={
                                          instrument.imageUrl || "https://via.placeholder.com/300x300"
                                        }
                                        alt={instrument.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <Button
                                      size="icon"
                                      className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-green-500 hover:bg-green-400 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                      asChild
                                    >
                                      <Link to={`/instruments/${instrument._id}`}>
                                        <Music className="h-5 w-5" />
                                      </Link>
                                    </Button>
                                  </div>
                                  <div className="text-center">
                                    <Link
                                      to={`/instruments/${instrument._id}`}
                                      className="font-medium text-base text-white hover:text-sky-400 transition-colors duration-200 truncate block"
                                    >
                                      {instrument.name}
                                    </Link>
                                    <p className="text-xs text-zinc-400">
                                    {instrument?.description}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    </CollapsibleContent>
                  )}
                </AnimatePresence>
                <CollapsibleTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex justify-center mt-6"
                  >
                    <Button
                      variant="outline"
                      className="group relative px-6 py-2 bg-zinc-900/50 text-zinc-200 border-zinc-700 rounded-full shadow-md hover:bg-zinc-800/80 hover:text-white transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isOpen ? (
                          <>
                            Show Less
                            <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                          </>
                        ) : (
                          <>
                            Show More ({filteredInstruments.length - INITIAL_DISPLAY_COUNT})
                            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                          </>
                        )}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-sky-500/20 opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>
                </CollapsibleTrigger>
              </Collapsible>
            )}

            {filteredInstruments.length === 0 && (
              <motion.p
                variants={itemVariants}
                className="text-center text-zinc-400 mt-8 col-span-full"
              >
                No instruments found.
              </motion.p>
            )}
          </motion.div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default AllInstruments;