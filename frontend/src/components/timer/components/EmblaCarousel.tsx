import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import { IosPickerItem } from "./EmblaCarouselIosPickerItem";
import "../../../App.css";
type PropType = {
  loop?: EmblaOptionsType["loop"];
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { loop } = props;

  return (
    <div className="embla">
      <IosPickerItem
        slideCount={24}
        perspective="left"
        loop={loop}
        label="hours"
      />
      <IosPickerItem
        slideCount={60}
        perspective="right"
        loop={loop}
        label="min"
      />
    </div>
  );
};

export default EmblaCarousel;
