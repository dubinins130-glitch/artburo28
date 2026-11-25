"use client";

import { gsap } from "gsap";
import { useEffect } from "react";
import { loadScrollMotion, motion } from "@/lib/motion";

// Свойства, которые анимации временно записывают в style элемента.
const settled = "opacity,transform,--line-x,--line-y";

export function SectionMotion() {
  useEffect(() => {
    const preference = window.matchMedia(motion.allowed);
    const main = document.getElementById("main");
    if (!main) return;

    let disposed = false;
    let revert: (() => void) | undefined;
    let request = 0;

    const setup = async () => {
      const revision = ++request;
      revert?.();
      revert = undefined;
      if (!preference.matches) return;

      try {
        const [{ ScrollTrigger }, { SplitText }] = await Promise.all([loadScrollMotion(), import("gsap/SplitText")]);
        if (disposed || revision !== request) return;
        gsap.registerPlugin(ScrollTrigger, SplitText);

        const compact = window.matchMedia("(max-width: 700px)").matches;
        const distance = compact ? 9 : 17;
        const contexts = new Set<gsap.Context>();
        const imageListeners = new Map<HTMLImageElement, () => void>();
        const matchMedia = gsap.matchMedia();

        function play(element: HTMLElement, animate: () => void) {
          const rect = element.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top >= window.innerHeight) return;
          const context = gsap.context(animate, element);
          contexts.add(context);
        }

        // Элемент ниже экрана: пока пользователь его не видит, прячем стартовое состояние.
        const belowFold = (element: Element) => element.getBoundingClientRect().top >= window.innerHeight;
        const all = <T extends Element>(root: ParentNode, selector: string) => Array.from(root.querySelectorAll<T>(selector));

        // Запускает сценарий один раз при приближении секции. Если пользователь прыгнул дальше
        // (например, по якорной ссылке), сразу снимает стартовое состояние без анимации.
        function onceNear(
          trigger: HTMLElement,
          start: string,
          targets: Element[],
          build: (timeline: gsap.core.Timeline) => void,
        ) {
          const settle = () => gsap.set(targets, { clearProps: settled });
          ScrollTrigger.create({
            trigger,
            start,
            once: true,
            onEnter: () => {
              if (trigger.getBoundingClientRect().bottom < 0) {
                settle();
                return;
              }
              const context = gsap.context(() => {
                build(gsap.timeline({ defaults: { ease: motion.ease }, onComplete: settle }));
              }, trigger);
              contexts.add(context);
            },
          });
        }

        const triggers = gsap.context(() => {
          // 1. Общие появления: заголовки через маски строк, текст через небольшой сдвиг, фото через маску.
          const targets = main.querySelectorAll<HTMLElement>("[data-reveal], [data-image-reveal]");
          targets.forEach((element) => {
            // Leave above-the-fold and deep-linked content readable during hydration.
            if (element.getBoundingClientRect().top < window.innerHeight) return;

            ScrollTrigger.create({
              trigger: element,
              start: "top 91%",
              once: true,
              onEnter: () => {
                if (element.hasAttribute("data-image-reveal")) {
                  const image = element.querySelector("img");
                  if (!image) return;

                  const reveal = () => {
                    imageListeners.delete(image);
                    play(element, () => {
                      element.dataset.revealing = "true";
                      gsap.timeline({
                        defaults: { ease: motion.ease, duration: compact ? motion.imageCompact : motion.image },
                        onComplete: () => { delete element.dataset.revealing; },
                      })
                        .fromTo(element, { clipPath: "inset(0% 0% 12% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", clearProps: "clipPath" }, 0)
                        .fromTo(image, { scale: 1.045 }, { scale: 1, clearProps: "transform" }, 0);
                    });
                  };

                  if (image.complete && image.naturalWidth) reveal();
                  else {
                    image.addEventListener("load", reveal, { once: true });
                    imageListeners.set(image, reveal);
                  }
                  return;
                }

                play(element, () => {
                  const heading = element.querySelector("h2");
                  const text = element.querySelectorAll<HTMLElement>("[data-reveal-text]");
                  const split = heading && document.fonts.status === "loaded"
                    ? SplitText.create(heading, { type: "lines", tag: "span", linesClass: "reveal-line", mask: "lines" })
                    : null;
                  const title = split?.lines ?? (heading ? [heading] : []);
                  const reveal = gsap.timeline({
                    defaults: { ease: motion.ease },
                    onComplete: () => split?.revert(),
                  });

                  if (title.length) reveal.fromTo(title, { y: distance, opacity: 0.65 }, {
                    y: 0, opacity: 1, duration: motion.reveal, stagger: motion.stagger, clearProps: "opacity,transform",
                  });
                  if (text.length) reveal.fromTo(text, { y: distance * 0.55, opacity: 0.68 }, {
                    y: 0, opacity: 1, duration: motion.reveal * 0.8, stagger: motion.stagger, clearProps: "opacity,transform",
                  }, title.length ? 0.16 : 0);

                  return () => split?.revert();
                });
              },
            });
          });

          // 2. Проекты: линия над секцией и подписи под фото. Само фото раскрывается маской выше.
          const projects = main.querySelector<HTMLElement>(".projects");
          if (projects && belowFold(projects)) {
            gsap.set(projects, { "--line-x": 0 });
            onceNear(projects, "top 88%", [projects], (timeline) => {
              timeline.to(projects, { "--line-x": 1, duration: motion.line, ease: motion.inOut });
            });
          }

          all<HTMLElement>(main, ".project").forEach((project) => {
            const caption = all<HTMLElement>(project, "figcaption h3, figcaption p");
            if (!caption.length || !belowFold(project)) return;
            gsap.set(caption, { y: 10, opacity: 0.4 });
            // Подпись появляется чуть позже фото, когда маска уже почти раскрыта.
            onceNear(project, "top 88%", caption, (timeline) => {
              timeline.to(caption, { y: 0, opacity: 1, duration: 0.7, stagger: motion.stagger }, 0.35);
            });
          });

          // 3. Услуги: линии сетки и колонки раскрываются вместе, колонки идут слева направо.
          const grid = main.querySelector<HTMLElement>(".service-grid");
          if (grid && belowFold(grid)) {
            const services = all<HTMLElement>(grid, ".service");
            const columns = services.map((service) => Array.from(service.children));
            gsap.set(grid, { "--line-x": 0 });
            gsap.set(services, { "--line-x": 0, "--line-y": 0 });
            gsap.set(columns.flat(), { y: 10, opacity: 0.4 });
            onceNear(grid, "top 85%", [grid, ...services, ...columns.flat()], (timeline) => {
              timeline.to(grid, { "--line-x": 1, duration: motion.line, ease: motion.inOut }, 0);
              services.forEach((service, index) => {
                const start = 0.1 + index * motion.stagger;
                timeline.to(service, { "--line-x": 1, "--line-y": 1, duration: motion.line, ease: motion.inOut }, start);
                timeline.to(columns[index], { y: 0, opacity: 1, duration: 0.75, stagger: 0.04 }, start + 0.12);
              });
            });
          }

          // 4. Как проходит ремонт: линия списка, затем у каждого этапа линия, номер и текст вместе.
          const steps = main.querySelector<HTMLElement>(".steps-list");
          if (steps) {
            const items = all<HTMLElement>(steps, "li");
            if (belowFold(steps)) {
              gsap.set(steps, { "--line-x": 0 });
              onceNear(steps, "top 90%", [steps], (timeline) => {
                timeline.to(steps, { "--line-x": 1, duration: motion.line, ease: motion.inOut });
              });
            }
            items.forEach((item) => {
              if (!belowFold(item)) return;
              const number = item.querySelector<HTMLElement>(".step-number");
              const body = all<HTMLElement>(item, "div > *");
              gsap.set(item, { "--line-x": 0 });
              if (number) gsap.set(number, { y: 6, opacity: 0 });
              gsap.set(body, { y: 10, opacity: 0.4 });
              onceNear(item, "top 90%", [item, ...(number ? [number] : []), ...body], (timeline) => {
                timeline.to(item, { "--line-x": 1, duration: motion.line, ease: motion.inOut }, 0);
                if (number) timeline.to(number, { y: 0, opacity: 1, duration: 0.6 }, 0.08);
                timeline.to(body, { y: 0, opacity: 1, duration: 0.75, stagger: motion.stagger }, 0.14);
              });
            });
          }

          // 5. Условия работы: линии списка рисуются сверху вниз, названия появляются вместе с ними.
          const terms = main.querySelector<HTMLElement>(".terms-list");
          if (terms && belowFold(terms)) {
            const rows = all<HTMLElement>(terms, "details");
            const labels = rows.map((row) => row.querySelector<HTMLElement>("summary")).filter((label): label is HTMLElement => Boolean(label));
            gsap.set(terms, { "--line-x": 0 });
            gsap.set(rows, { "--line-x": 0 });
            gsap.set(labels, { y: 8, opacity: 0.4 });
            onceNear(terms, "top 88%", [terms, ...rows, ...labels], (timeline) => {
              timeline.to(terms, { "--line-x": 1, duration: motion.line, ease: motion.inOut }, 0);
              rows.forEach((row, index) => {
                const start = 0.1 + index * motion.stagger;
                timeline.to(row, { "--line-x": 1, duration: motion.line, ease: motion.inOut }, start);
                timeline.to(labels[index], { y: 0, opacity: 1, duration: 0.7 }, start + 0.08);
              });
            });
          }

          // 6. Форма заявки: поля появляются по очереди, без сдвига раскладки.
          const form = main.querySelector<HTMLElement>(".inquiry-fields");
          if (form && belowFold(form)) {
            const fields = all<HTMLElement>(form, "label");
            gsap.set(fields, { y: 8, opacity: 0.4 });
            onceNear(form, "top 90%", fields, (timeline) => {
              timeline.to(fields, { y: 0, opacity: 1, duration: 0.7, stagger: motion.stagger });
            });
          }
        }, main);

        // 7. Очень лёгкий параллакс только на двух крупных фото: сдвигается кадрирование внутри контейнера,
        // поэтому изображение не выходит за свои границы. Прокрутка не перехватывается (scrub без сглаживания).
        matchMedia.add("(min-width: 1001px)", () => {
          const photos = main.querySelectorAll<HTMLElement>("[data-parallax]");
          photos.forEach((photo) => {
            const hero = photo.dataset.parallax === "hero";
            const area = hero ? main.querySelector<HTMLElement>("#home") : photo.closest<HTMLElement>(".project");
            if (!area) return;
            gsap.fromTo(photo, { objectPosition: hero ? "50% 55%" : "50% 38%" }, {
              objectPosition: hero ? "50% 70%" : "50% 62%",
              ease: "none",
              scrollTrigger: { trigger: area, start: hero ? "top top" : "top bottom", end: "bottom top", scrub: true },
            });
          });
        });

        revert = () => {
          matchMedia.revert();
          triggers.revert();
          contexts.forEach((context) => context.revert());
          imageListeners.forEach((listener, image) => image.removeEventListener("load", listener));
          main.querySelectorAll<HTMLElement>("[data-revealing]").forEach((element) => delete element.dataset.revealing);
        };
      } catch {
        // The default page stays visible when optional motion cannot load.
      }
    };

    void setup();
    preference.addEventListener("change", setup);
    return () => {
      disposed = true;
      preference.removeEventListener("change", setup);
      revert?.();
    };
  }, []);

  return null;
}
