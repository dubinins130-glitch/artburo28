"use client";

import { gsap } from "gsap";
import Image, { getImageProps } from "next/image";
import { useLayoutEffect, useRef } from "react";
import { hero } from "@/content/site";
import { motion as timing } from "@/lib/motion";
import { QuizTrigger } from "../project-quiz";
import { Arrow } from "../ui/arrow";

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const { props: mobilePhoto } = getImageProps({
    src: hero.mobileImage, alt: hero.imageAlt, fill: true, sizes: "100vw", quality: 85,
  });

  useLayoutEffect(() => {
    const element = section.current;
    if (!element) return;

    const intro = document.documentElement.classList;
    const motion = gsap.matchMedia();
    motion.add(timing.allowed, () => {
      if (element.getBoundingClientRect().bottom < 200) {
        intro.remove("intro");
        return;
      }
      const compact = window.matchMedia("(max-width: 700px)").matches;
      // Одна композиция: фото, заголовок, линия, описание, кнопки и навигация идут от общего начала.
      // Вся последовательность занимает около 1,4 секунды и не блокирует страницу.
      const photoDuration = compact ? 1 : timing.image;
      const titleStart = { y: compact ? 12 : 22, opacity: 0.7 };
      const titleEnd = { y: 0, opacity: 1, duration: timing.reveal, clearProps: "transform,opacity" };
      const lateStart = { y: 8, opacity: 0.5 };
      const lateEnd = { y: 0, opacity: 1, duration: 0.7, clearProps: "transform,opacity" };

      gsap.timeline({ defaults: { ease: timing.ease } })
        .fromTo(".hero-media", { clipPath: "inset(0% 0% 4% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: photoDuration, clearProps: "clipPath" }, 0)
        .fromTo(".hero-image", { scale: 1.035 }, { scale: 1, duration: photoDuration + 0.2, clearProps: "transform" }, 0)
        .fromTo(".hero-title-first .hero-title-line", titleStart, titleEnd, 0.12)
        .fromTo(".hero-title-secondary .hero-title-line", titleStart, { ...titleEnd, stagger: timing.stagger }, 0.12 + timing.stagger)
        .fromTo(".hero-base", { "--line-x": 0 }, { "--line-x": 1, duration: timing.line, ease: timing.inOut, clearProps: "--line-x" }, 0.3)
        .fromTo(".hero-description", lateStart, lateEnd, 0.5)
        .fromTo(".hero-actions > *", lateStart, { ...lateEnd, stagger: timing.stagger }, 0.5)
        // Шапка лежит вне секции, поэтому берём элементы напрямую, а не по селектору внутри секции.
        .fromTo(document.querySelectorAll(".site-header .brand, .site-header .header-nav a, .site-header .header-cta, .site-header .menu-toggle"),
          { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.05, ease: timing.easeSoft, clearProps: "opacity" }, 0.4);

      // Стартовые значения уже записаны в style, поэтому стартовый класс можно снять без скачка.
      intro.remove("intro");
    }, element);
    return () => {
      intro.remove("intro");
      motion.revert();
    };
  }, []);

  return (
    <section className="hero" id="home" tabIndex={-1} aria-labelledby="hero-title" ref={section}>
      <picture className="hero-media">
        <source media="(max-width: 700px)" srcSet={mobilePhoto.srcSet ?? mobilePhoto.src} sizes={mobilePhoto.sizes} />
        <Image className="hero-image" data-parallax="hero" fill src={hero.image} alt={hero.imageAlt} sizes="100vw" quality={85} loading="eager" fetchPriority="high" />
      </picture>
      <div className="hero-shell section-shell">
        <div className="hero-content">
          <h1 id="hero-title">
            <span className="hero-title-mask hero-title-first"><span className="hero-title-line">{hero.title[0]}</span></span>{" "}
            <span className="hero-title-secondary">
              <span className="hero-title-mask"><span className="hero-title-line">{hero.title[1]}</span></span>{" "}
              <span className="hero-title-mask"><span className="hero-title-line">{hero.title[2]}</span></span>
            </span>
          </h1>
          <div className="hero-base">
            <p className="hero-description">{hero.description}</p>
            <div className="hero-actions hero-actions--with-quiz">
              <QuizTrigger className="button button--light" />
              <a className="hero-text-link" href="#inquiry">Обсудить проект <Arrow /></a>
              <a className="hero-text-link" href="#projects">Смотреть работы <Arrow direction="down" /></a>
            </div>
          </div>
          <p className="hero-caption">{hero.caption} · Стоковое фото</p>
        </div>
      </div>
    </section>
  );
}
