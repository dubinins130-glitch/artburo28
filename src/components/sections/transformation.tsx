"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { transformation } from "@/content/site";
import { loadScrollMotion, motion } from "@/lib/motion";

const desktopMotion = `(min-width: 1001px) and (min-height: 690px) and ${motion.allowed} and (scripting: enabled)`;
// На телефонах и планшетах сцена тоже закрепляется и листается вместе со страницей, как на компьютере.
const compactMotion = `(max-width: 1000px) and (min-height: 600px) and ${motion.allowed} and (scripting: enabled)`;
// Точки прокрутки (доля пути сцены), к которым ведут кнопки стадий в режиме закрепления.
const stagePoints = [0, 0.46, 1];
const { photoSet, stages } = transformation;

export function Transformation() {
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const comparison = useRef<0 | 1>(0);
  const pinned = useRef<{ start: number; end: number } | null>(null);
  const currentStage = useRef(0);
  const [activeStage, setActiveStage] = useState(0);
  const [nearScene, setNearScene] = useState(false);

  const showProgress = useCallback((progress: number, animate = false, pair: 0 | 1 = progress > 1 ? 1 : 0, dividerOpacity = 1) => {
    const middle = Math.min(1, progress);
    const final = Math.max(0, progress - 1);
    const percentage = Math.round((progress - pair) * 100);
    comparison.current = pair;
    if (scene.current) {
      scene.current.toggleAttribute("data-stage-transition", animate);
      scene.current.style.setProperty("--concept-reveal", `${middle * 100}%`);
      scene.current.style.setProperty("--result-reveal", `${final * 100}%`);
      scene.current.style.setProperty("--divider-position", `${percentage}%`);
      scene.current.style.setProperty("--divider-opacity", String(dividerOpacity));
    }
    if (slider.current) {
      slider.current.value = String(percentage);
      slider.current.setAttribute("aria-valuetext", `${stages[pair].label} → ${stages[pair + 1].label}, ${percentage}%`);
    }

    const stage = Math.round(progress);
    if (currentStage.current !== stage) {
      currentStage.current = stage;
      setActiveStage(stage);
    }
  }, []);

  useEffect(() => {
    const element = section.current;
    const scrollTrack = track.current;
    if (!photoSet || !element || !scrollTrack) return;

    const desktop = window.matchMedia(desktopMotion);
    const compact = window.matchMedia(compactMotion);
    let near = false;
    let loadingMotion = false;
    let disposed = false;
    let revert: (() => void) | undefined;

    const loadMotion = async () => {
      if (!near || (!desktop.matches && !compact.matches) || loadingMotion) return;
      loadingMotion = true;

      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), loadScrollMotion()]);
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        revert = () => media.revert();

        const headerHeight = () => document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
        const follow = ({ progress }: { progress: number }) => {
          if (document.activeElement === slider.current) return;
          // Hold each complete image briefly between the two spatial wipes.
          const first = gsap.utils.clamp(0, 1, (progress - 0.08) / 0.32);
          const second = gsap.utils.clamp(0, 1, (progress - 0.53) / 0.35);
          const phase = first + second;
          // Fade out where the completed concept becomes the base for the next wipe.
          showProgress(phase, false, undefined, Math.min(1, Math.abs(phase - 1) * 8));
        };

        media.add(desktopMotion, () => {
          ScrollTrigger.create({
            trigger: scrollTrack,
            start: () => `top top+=${headerHeight()}`,
            end: () => `+=${scrollTrack.offsetHeight - element.offsetHeight}`,
            onUpdate: follow,
          });
        });

        media.add(compactMotion, () => {
          // Сцена должна целиком помещаться под шапкой, иначе закрепление обрежет её. Тогда остаются кнопки стадий.
          if (element.offsetHeight > window.innerHeight - headerHeight()) return;
          scrollTrack.dataset.scrollScene = "true";
          const instance = ScrollTrigger.create({
            trigger: scrollTrack,
            start: () => `top top+=${headerHeight()}`,
            end: () => `+=${scrollTrack.offsetHeight - element.offsetHeight}`,
            onUpdate: follow,
          });
          pinned.current = instance;
          return () => {
            pinned.current = null;
            delete scrollTrack.dataset.scrollScene;
          };
        });
      } catch {
        // The scene remains available through its stage controls.
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      near = true;
      setNearScene(true);
      void loadMotion();
    }, { rootMargin: "900px" });
    observer.observe(element);
    desktop.addEventListener("change", loadMotion);
    compact.addEventListener("change", loadMotion);

    return () => {
      disposed = true;
      observer.disconnect();
      desktop.removeEventListener("change", loadMotion);
      compact.removeEventListener("change", loadMotion);
      revert?.();
    };
  }, [showProgress]);

  // В режиме закрепления кнопка стадии прокручивает страницу к нужному месту сцены, а не подменяет кадр.
  // Так положение страницы и показанная стадия всегда совпадают.
  const chooseStage = (index: number) => {
    const pin = pinned.current;
    if (pin) {
      window.scrollTo({ top: pin.start + (pin.end - pin.start) * stagePoints[index], behavior: "smooth" });
      return;
    }
    showProgress(index, true, index === 0 ? 0 : 1);
  };

  return (
    <div className="transformation-track" data-has-photos={photoSet ? "true" : undefined} ref={track}>
      <section className="transformation" id="transformation" ref={section} aria-labelledby="transformation-title">
        <div className="section-shell transformation-layout">
          <div className="transformation-copy" data-reveal>
            <h2 className="section-title" id="transformation-title">От идеи до реализации.</h2>
            <p data-reveal-text>{photoSet
              ? "Сравните эскиз, цветовую концепцию и фотографию готового интерьера с одного ракурса."
              : "Для сравнения эскиза, концепции и готовой отделки нужны три изображения одного помещения с одного ракурса."}</p>
            <div className="stage-controls" role="group" aria-label="Стадии проекта">
              {stages.map((stage, index) => (
                <button
                  key={stage.label} type="button" aria-controls="transformation-image"
                  aria-pressed={activeStage === index} onClick={() => chooseStage(index)}
                >
                  <span className="stage-number" aria-hidden="true">0{index + 1}</span>{stage.label}
                </button>
              ))}
            </div>
          </div>
          <figure className="transformation-figure">
            {photoSet ? (
              <div className="scene" id="transformation-image" ref={scene}>
                <div className="scene-media" role="img" aria-label={photoSet.photos[activeStage].alt}>
                  {photoSet.photos.map((photo, index) => (
                    <div className={`scene-layer scene-layer--${index}`} key={photo.image} aria-hidden="true">
                      <Image fill src={photo.image} alt="" sizes="(max-width: 1000px) 92vw, 61vw" quality={85} loading={nearScene ? "eager" : "lazy"} />
                    </div>
                  ))}
                </div>
                <div className="scene-divider" aria-hidden="true" />
                <div className="scene-handle-track" aria-hidden="true"><span className="scene-handle" /></div>
                <input
                  className="scene-range" ref={slider} type="range" min="0" max="100" defaultValue="0"
                  aria-label="Разделитель между стадиями" aria-valuetext="Эскиз → Концепция, 0%"
                  onChange={(event) => showProgress(comparison.current + event.currentTarget.valueAsNumber / 100, false, comparison.current)}
                />
              </div>
            ) : (
              <div className="scene scene-placeholder" id="transformation-image" aria-live="polite">
                <div>
                  <p className="scene-placeholder-title">{stages[activeStage].placeholder}</p>
                  <p>{stages[activeStage].description}</p>
                </div>
              </div>
            )}
            <figcaption>
              <span>{photoSet?.project ?? "Пример трёх стадий"}</span>
              {photoSet ? photoSet.caption && <span>{photoSet.caption}</span> : <span>Один ракурс</span>}
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
