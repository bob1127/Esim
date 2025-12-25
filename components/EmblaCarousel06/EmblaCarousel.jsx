import React, { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarosuelDotButton";
import { gsap } from "gsap";

const EmblaCarousel = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const dragIndicatorRef = useRef(null);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const handleMouseEnter = () => {
    gsap.to(dragIndicatorRef.current, { opacity: 1, scale: 1, duration: 0.5 });
    document.body.style.cursor = "grab";
  };

  const handleMouseLeave = () => {
    gsap.to(dragIndicatorRef.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.5,
    });
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi
      .on("reInit", () => {})
      .on("scroll", () => {})
      .on("slideFocus", () => {});
  }, [emblaApi]);

  return (
    <div
      className="w-full py-8 mx-auto"
      style={{
        "--slide-height": "13rem",
        "--slide-spacing": "1rem",
        "--slide-size": "25%", // Default value for larger screens
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <div
          className="embla__container flex touch-pan-y touch-pinch-zoom h-[550px]"
          style={{ marginLeft: "calc(var(--slide-spacing) * -1)" }}
        >
          {slides.map((slide, index) => (
            <div
              className="embla__slide   mx-3  transform flex-none h-full min-w-0"
              key={index}
              style={{
                transform: "translate3d(0, 0, 0)",
                flex: "0 0 var(--slide-size)",
                paddingLeft: "var(--slide-spacing)",
              }}
            >
              <div
                className="embla__slide__number border-none md:border !rounded-none bg-white py-8 md:border-black flex flex-col items-center justify-center font-semibold"
                style={{
                  boxShadow: "inset 0 0 0 0.2rem var(--detail-medium-contrast)",
                  borderRadius: "1.8rem",
                  fontSize: "4rem",
                  height: "100%",
                  userSelect: "none",
                }}
              >
                <a href="/" className="">
                  <div className="flex overflow-hidden flex-col justify-center items-center">
                    {slide.content ? (
                      slide.content
                    ) : (
                      <div className="w-full px-6">
                        {/* 固定比例圖片容器：6 / 19 */}
                        <div className="aspect-[8/10] w-full overflow-hidden  ">
                          <img
                            src={slide.image}
                            alt={`Slide ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    <div className="txt mt-5 flex-col flex justify-center items-center w-4/5 mx-auto">
                      <b className="text-xl text-center">{slide.title}</b>
                      <p className="text-sm font-normal text-center">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls absolute bottom-0 left-6 grid grid-cols-[auto_1fr] justify-between flex inline-block border border-black gap-3 mt-7">
        <div className="embla__buttons flex justify-center">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={"embla__dot".concat(
                index === selectedIndex ? " embla__dot--selected" : ""
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
