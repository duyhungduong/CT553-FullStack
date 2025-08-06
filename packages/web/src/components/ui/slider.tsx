import * as React from "react";
import {
  Slider as SliderPrimitiveRoot,
  SliderTrack as SliderPrimitiveTrack,
  SliderRange as SliderPrimitiveRange,
  SliderThumb as SliderPrimitiveThumb,
} from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitiveRoot>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitiveRoot>
>(({ className, ...props }, ref) => (
  <SliderPrimitiveRoot
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group cursor-pointer",
      className
    )}
    {...props}
  >
    {/* Track - mỏng, xám nhạt */}
    <SliderPrimitiveTrack className="relative h-[2px] w-full grow overflow-hidden bg-zinc-700/50">
      {/* Range - màu cam SoundCloud */}
      <SliderPrimitiveRange className="absolute h-full bg-[#87DF2C]" />
    </SliderPrimitiveTrack>
    {/* Thumb - nhỏ, trắng, chỉ hiện khi hover hoặc focus */}
    <SliderPrimitiveThumb className="block h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-100 cursor-grab disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitiveRoot>
));

Slider.displayName = SliderPrimitiveRoot.displayName;

export { Slider };