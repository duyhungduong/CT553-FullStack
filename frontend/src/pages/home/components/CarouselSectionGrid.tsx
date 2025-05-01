import SectionGridSkeleton from "./SectionGridSkeleton";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type CarouselSectionGridProps = {
  title: string;
  songs: Song[];
  isLoading: boolean;
};

const CarouselSectionGrid = ({
  songs,
  title,
  isLoading,
}: CarouselSectionGridProps) => {
  if (isLoading) return <SectionGridSkeleton />;

  return (
    <Carousel opts={{ align: "start", loop: true }} className="w-full mb-10">
      <div className="w-full flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-wide text-white">{title}</h2>
        <Button
          variant="link"
          className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
        >
          Show all
        </Button>
      </div>

      <CarouselContent className="-ml-2 md:-ml-4">
        {songs.map((song) => (
          <CarouselItem
            key={song._id}
            className="pl-6 basis-auto sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <div className="p-1">
              <Card className="rounded-xl hover:bg-zinc-700/50 shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105 group cursor-pointer">
                <CardContent className="p-5">
                  {/* Image */}
                  <div className="relative rounded-lg overflow-hidden shadow-md w-full h-auto max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayButton song={song} songs={songs} />
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <h3 className="font-medium text-lg text-white mb-1 truncate">
                    {song.title}
                  </h3>
                  <p className="text-sm text-zinc-400 truncate">
                    {song.artists[0].name}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default CarouselSectionGrid;
