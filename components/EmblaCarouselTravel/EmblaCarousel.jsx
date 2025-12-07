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
        "--slide-height": "3rem",
        "--slide-spacing": "1rem",
        "--slide-size": "28%", // Default value for larger screens
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>
        {`
        /* 超橢圓卡片：用 64 點 polygon 近似，支援 Safari/Chrome */
.superellipse-card{
  position: relative;
  /* 給陰影、背景、邊框圓角的視覺一致性 */
  background-color: #f8fafc;            /* tailwind 的 slate-50 */
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  /* 重點：clip 成超橢圓 */
  -webkit-clip-path: polygon(
    100% 50%, 99.97% 47.7%, 99.86% 45.4%, 99.68% 43.1%, 99.41% 40.8%,
    99.06% 38.5%, 98.63% 36.3%, 98.12% 34.1%, 97.53% 32.0%, 96.86% 29.9%,
    96.12% 27.9%, 95.31% 25.9%, 94.43% 24.0%, 93.49% 22.2%, 92.49% 20.4%,
    91.43% 18.7%, 90.31% 17.1%, 89.15% 15.6%, 87.93% 14.2%, 86.68% 12.9%,
    85.38% 11.7%, 84.04% 10.6%, 82.67% 9.6%, 81.27% 8.7%, 79.84% 7.9%,
    78.38% 7.2%, 76.91% 6.6%, 75.41% 6.1%, 73.90% 5.7%, 72.38% 5.4%,
    70.85% 5.2%, 69.31% 5.1%, 30.69% 5.1%, 29.15% 5.2%, 27.62% 5.4%,
    26.10% 5.7%, 24.59% 6.1%, 23.09% 6.6%, 21.62% 7.2%, 20.16% 7.9%,
    18.73% 8.7%, 17.33% 9.6%, 15.96% 10.6%, 14.62% 11.7%, 13.32% 12.9%,
    12.07% 14.2%, 10.85% 15.6%, 9.69% 17.1%, 8.57% 18.7%, 7.51% 20.4%,
    6.51% 22.2%, 5.57% 24.0%, 4.69% 25.9%, 3.88% 27.9%, 3.14% 29.9%,
    2.47% 32.0%, 1.88% 34.1%, 1.37% 36.3%, 0.94% 38.5%, 0.59% 40.8%,
    0.32% 43.1%, 0.14% 45.4%, 0.03% 47.7%, 0% 50%, 0.03% 52.3%, 0.14% 54.6%,
    0.32% 56.9%, 0.59% 59.2%, 0.94% 61.5%, 1.37% 63.7%, 1.88% 65.9%,
    2.47% 68.0%, 3.14% 70.1%, 3.88% 72.1%, 4.69% 74.1%, 5.57% 76.0%,
    6.51% 77.8%, 7.51% 79.6%, 8.57% 81.3%, 9.69% 82.9%, 10.85% 84.4%,
    12.07% 85.8%, 13.32% 87.1%, 14.62% 88.3%, 15.96% 89.4%, 17.33% 90.4%,
    18.73% 91.3%, 20.16% 92.1%, 21.62% 92.8%, 23.09% 93.4%, 24.59% 93.9%,
    26.10% 94.3%, 27.62% 94.6%, 29.15% 94.8%, 30.69% 94.9%, 69.31% 94.9%,
    70.85% 94.8%, 72.38% 94.6%, 73.90% 94.3%, 75.41% 93.9%, 76.91% 93.4%,
    78.38% 92.8%, 79.84% 92.1%, 81.27% 91.3%, 82.67% 90.4%, 84.04% 89.4%,
    85.38% 88.3%, 86.68% 87.1%, 87.93% 85.8%, 89.15% 84.4%, 90.31% 82.9%,
    91.43% 81.3%, 92.49% 79.6%, 93.49% 77.8%, 94.43% 76.0%, 95.31% 74.1%,
    96.12% 72.1%, 96.86% 70.1%, 97.53% 68.0%, 98.12% 65.9%, 98.63% 63.7%,
    99.06% 61.5%, 99.41% 59.2%, 99.68% 56.9%, 99.86% 54.6%, 99.97% 52.3%
  );
  clip-path: polygon(
    100% 50%, 99.97% 47.7%, 99.86% 45.4%, 99.68% 43.1%, 99.41% 40.8%,
    99.06% 38.5%, 98.63% 36.3%, 98.12% 34.1%, 97.53% 32.0%, 96.86% 29.9%,
    96.12% 27.9%, 95.31% 25.9%, 94.43% 24.0%, 93.49% 22.2%, 92.49% 20.4%,
    91.43% 18.7%, 90.31% 17.1%, 89.15% 15.6%, 87.93% 14.2%, 86.68% 12.9%,
    85.38% 11.7%, 84.04% 10.6%, 82.67% 9.6%, 81.27% 8.7%, 79.84% 7.9%,
    78.38% 7.2%, 76.91% 6.6%, 75.41% 6.1%, 73.90% 5.7%, 72.38% 5.4%,
    70.85% 5.2%, 69.31% 5.1%, 30.69% 5.1%, 29.15% 5.2%, 27.62% 5.4%,
    26.10% 5.7%, 24.59% 6.1%, 23.09% 6.6%, 21.62% 7.2%, 20.16% 7.9%,
    18.73% 8.7%, 17.33% 9.6%, 15.96% 10.6%, 14.62% 11.7%, 13.32% 12.9%,
    12.07% 14.2%, 10.85% 15.6%, 9.69% 17.1%, 8.57% 18.7%, 7.51% 20.4%,
    6.51% 22.2%, 5.57% 24.0%, 4.69% 25.9%, 3.88% 27.9%, 3.14% 29.9%,
    2.47% 32.0%, 1.88% 34.1%, 1.37% 36.3%, 0.94% 38.5%, 0.59% 40.8%,
    0.32% 43.1%, 0.14% 45.4%, 0.03% 47.7%, 0% 50%, 0.03% 52.3%, 0.14% 54.6%,
    0.32% 56.9%, 0.59% 59.2%, 0.94% 61.5%, 1.37% 63.7%, 1.88% 65.9%,
    2.47% 68.0%, 3.14% 70.1%, 3.88% 72.1%, 4.69% 74.1%, 5.57% 76.0%,
    6.51% 77.8%, 7.51% 79.6%, 8.57% 81.3%, 9.69% 82.9%, 10.85% 84.4%,
    12.07% 85.8%, 13.32% 87.1%, 14.62% 88.3%, 15.96% 89.4%, 17.33% 90.4%,
    18.73% 91.3%, 20.16% 92.1%, 21.62% 92.8%, 23.09% 93.4%, 24.59% 93.9%,
    26.10% 94.3%, 27.62% 94.6%, 29.15% 94.8%, 30.69% 94.9%, 69.31% 94.9%,
    70.85% 94.8%, 72.38% 94.6%, 73.90% 94.3%, 75.41% 93.9%, 76.91% 93.4%,
    78.38% 92.8%, 79.84% 92.1%, 81.27% 91.3%, 82.67% 90.4%, 84.04% 89.4%,
    85.38% 88.3%, 86.68% 87.1%, 87.93% 85.8%, 89.15% 84.4%, 90.31% 82.9%,
    91.43% 81.3%, 92.49% 79.6%, 93.49% 77.8%, 94.43% 76.0%, 95.31% 74.1%,
    96.12% 72.1%, 96.86% 70.1%, 97.53% 68.0%, 98.12% 65.9%, 98.63% 63.7%,
    99.06% 61.5%, 99.41% 59.2%, 99.68% 56.9%, 99.86% 54.6%, 99.97% 52.3%
  );
  overflow: hidden; /* 讓內部圖片的 hover 不會溢出 */
  transition: transform .4s ease, box-shadow .4s ease;
}

.superellipse-card img{
  display:block;
  width:100%;
  height:auto;
  object-fit: cover;
}

/* 可選：hover 更有質感 */
.superellipse-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.10);
}

         @media (max-width: 1700px) {
        .embla__viewport {
          --slide-size: 32%;
        }
      }
          @media (max-width: 1000px) {
        .embla__viewport {
          --slide-size: 36%;
        }
      }
      @media (max-width: 550px) {
        .embla__viewport {
          --slide-size: 80%;
        }
      }
    `}
      </style>
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <div
          className="embla__container flex touch-pan-y touch-pinch-zoom h-auto"
          style={{ marginLeft: "calc(var(--slide-spacing) * -1)" }}
        >
          {slides.map((slide, index) => (
            <div
              className="embla__slide  transform flex-none h-full min-w-0"
              key={index}
              style={{
                transform: "translate3d(0, 0, 0)",
                flex: "0 0 var(--slide-size)",
                paddingLeft: "var(--slide-spacing)",
              }}
            >
              <div
                className="embla__slide__number border-3 overflow-hidden border-none md:border  pb-8 md:border-black flex flex-col items-center justify-center font-semibold"
                style={{
                  boxShadow: "inset 0 0 0 0.2rem var(--detail-medium-contrast)",

                  fontSize: "4rem",
                  height: "100%",
                  userSelect: "none",
                }}
              >
                <a href="/" className=" bg-slate-50 p-8 rounded-[30px]">
                  <div
                    className="downloads-select__slide-img-wrap "
                    style={{
                      position: "relative",
                      minWidth: 384,
                      maxWidth: 384,
                    }}
                  >
                    {/* 內層：實際裁切的卡片容器（完全照你給的 polygon） */}
                    <div
                      className="u-lazy --is-loaded  hover:scale-105 mt-5 duration-500"
                      data-superellipse="{ 'points': '64' }"
                      style={{
                        position: "relative",
                        width: "100%",
                        // 高度取 384x213 的比例（≈16:9.0），用 aspect-ratio 最乾淨：
                        aspectRatio: "384 / 213.33",
                        overflow: "hidden",
                        backgroundColor: "var(--diver-x-color-gray-light-30)",
                        clipPath:
                          "polygon(100% 50%, 99.97% 77.98%, 99.86% 83.23%, 99.69% 86.7%, 99.44% 89.33%, 99.11% 91.43%, 98.7% 93.17%, 98.19% 94.62%, 97.58% 95.85%, 96.85% 96.88%, 95.97% 97.75%, 94.91% 98.45%, 93.59% 99.02%, 91.9% 99.45%, 89.59% 99.76%, 85.88% 99.94%, 50.24% 100%, 14.12% 99.94%, 10.41% 99.76%, 8.1% 99.45%, 6.41% 99.02%, 5.09% 98.45%, 4.03% 97.75%, 3.15% 96.88%, 2.42% 95.85%, 1.81% 94.62%, 1.3% 93.17%, 0.89% 91.43%, 0.56% 89.33%, 0.31% 86.7%, 0.14% 83.23%, 0.03% 77.98%, 0% 50.01%, 0.03% 22.02%, 0.14% 16.77%, 0.31% 13.3%, 0.56% 10.67%, 0.89% 8.57%, 1.3% 6.83%, 1.81% 5.38%, 2.42% 4.15%, 3.15% 3.12%, 4.03% 2.25%, 5.09% 1.55%, 6.41% 0.98%, 8.1% 0.55%, 10.41% 0.24%, 14.12% 0.06%, 49.72% 0%, 85.88% 0.06%, 89.59% 0.24%, 91.9% 0.55%, 93.59% 0.98%, 94.91% 1.55%, 95.97% 2.25%, 96.85% 3.12%, 97.58% 4.15%, 98.19% 5.38%, 98.7% 6.83%, 99.11% 8.57%, 99.44% 10.67%, 99.69% 13.3%, 99.86% 16.77%, 99.97% 22.02%)",
                      }}
                    >
                      {/* preload 背景（可要可不要） */}
                      <div
                        className="u-lazy__preload --is-loaded --is-visible "
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundImage: slide.preview
                            ? `url(${slide.preview})`
                            : "none",
                        }}
                      />
                      {/* 圖片本體（cover 填滿） */}
                      <img
                        className="u-lazy__img u-fit downloads-select__slide-img --is-loaded"
                        alt={slide.title || "img"}
                        src={slide.image}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* 外層：描邊用的 superellipse（完全照你給的 polygon） */}
                    <div
                      className="downloads-select__slide-rect"
                      data-superellipse="{ 'points': '64', 'x': '8', 'y': '7' }"
                      style={{
                        pointerEvents: "none",
                        position: "absolute",
                        inset: 0,
                        clipPath:
                          "polygon(100% 50%, 99.97% 75.75%, 99.86% 81.35%, 99.69% 85.11%, 99.44% 88%, 99.11% 90.33%, 98.7% 92.27%, 98.19% 93.9%, 97.58% 95.29%, 96.85% 96.45%, 95.97% 97.43%, 94.91% 98.24%, 93.59% 98.88%, 91.9% 99.38%, 89.59% 99.72%, 85.88% 99.93%, 50.24% 100%, 14.12% 99.93%, 10.41% 99.72%, 8.1% 99.38%, 6.41% 98.88%, 5.09% 98.24%, 4.03% 97.43%, 3.15% 96.45%, 2.42% 95.29%, 1.81% 93.9%, 1.3% 92.27%, 0.89% 90.33%, 0.56% 88%, 0.31% 85.11%, 0.14% 81.35%, 0.03% 75.75%, 0% 50%, 0.03% 24.25%, 0.14% 18.65%, 0.31% 14.89%, 0.56% 12%, 0.89% 9.67%, 1.3% 7.73%, 1.81% 6.1%, 2.42% 4.71%, 3.15% 3.55%, 4.03% 2.57%, 5.09% 1.76%, 6.41% 1.12%, 8.1% 0.62%, 10.41% 0.28%, 14.12% 0.07%, 49.72% 0%, 85.88% 0.07%, 89.59% 0.28%, 91.9% 0.62%, 93.59% 1.12%, 94.91% 1.76%, 95.97% 2.57%, 96.85% 3.55%, 97.58% 4.71%, 98.19% 6.1%, 98.7% 7.73%, 99.11% 9.67%, 99.44% 12%, 99.69% 14.89%, 99.86% 18.65%, 99.97% 24.25%)",
                        // 用 outline 效果（看起來像你截圖的藍描邊）
                        boxShadow: slide.isActive
                          ? "0 0 0 2px #2962ff, 0 10px 30px rgba(41,98,255,.20)"
                          : "0 0 0 1px rgba(0,0,0,.08)",
                        borderRadius: 0, // 由 clip-path 控制外形
                      }}
                    />
                  </div>
                  {/* 標題 */}
                  <div className="flex flex-col items-start">
                    <h3 className="downloads-select__slide-product-ttl text-[18px] text-center mt-3">
                      {slide.title}
                    </h3>
                    <p className="text-[14px] font-normal text-gray-800">
                      {slide.description}{" "}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls absolute bottom-0 left-6 grid grid-cols-[auto_1fr] justify-between flex inline-block border border-black gap-3 mt-7">
        <div className="embla__buttons absolute left-[-50%] bottom-[10%] flex justify-center">
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

      <div
        ref={dragIndicatorRef}
        className="drag-indicator absolute top-[-5%] left-[-5%] transform  rounded-full text-white text-center text-[10px] bg-black flex items-center justify-center"
        style={{
          opacity: 0,
          scale: 0.5,
          width: "100px",
          height: "100px",
          fontSize: "20px",
        }}
      >
        <div className="flex flex-col justify-center items-center">
          <p className="text-white text-center text-[14px]">100%</p>{" "}
          <p className="text-center text-white text-[10px]">Made In Taiwan</p>
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
