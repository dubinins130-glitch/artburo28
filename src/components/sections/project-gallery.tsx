"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { projects } from "@/content/site";
import { motion } from "@/lib/motion";
import { Arrow } from "../ui/arrow";

const projectWidths = { wide: "51vw", portrait: "36vw", compact: "36vw", landscape: "51vw" };

export function ProjectGallery() {
  const panel = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const request = useRef(0);
  const intendedIndex = useRef(0);
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<{ index: number; previous: number | null }>({ index: 0, previous: null });
  const current = projects[selection.index];

  useEffect(() => {
    const dialog = panel.current;
    return () => {
      if (dialog?.open) document.documentElement.classList.remove("gallery-open");
    };
  }, []);

  useLayoutEffect(() => {
    const dialog = panel.current;
    if (!dialog || !open || !window.matchMedia(motion.allowed).matches) return;

    const context = gsap.context(() => {
      if (selection.previous === null) {
        gsap.fromTo(".gallery-controls", { opacity: 0.65, y: 4 }, {
          opacity: 1, y: 0, duration: 0.32, ease: motion.ease, clearProps: "opacity,transform",
        });
        return;
      }
      gsap.timeline({ defaults: { duration: motion.swap, ease: motion.swapEase } })
        .fromTo(".gallery-current", { opacity: 0 }, { opacity: 1, clearProps: "opacity" }, 0)
        .fromTo(".gallery-caption", { opacity: 0.65, y: 4 }, { opacity: 1, y: 0, clearProps: "opacity,transform" }, 0);
    }, dialog);
    return () => context.revert();
  }, [open, selection]);

  function openGallery(index: number, button: HTMLButtonElement) {
    if (!panel.current || panel.current.open) return;
    opener.current = button;
    intendedIndex.current = index;
    setSelection({ index, previous: null });
    setOpen(true);
    panel.current.showModal();
    document.documentElement.classList.add("gallery-open");
    closeButton.current?.focus({ preventScroll: true });
  }

  function closeGallery() {
    request.current++;
    panel.current?.close();
    document.documentElement.classList.remove("gallery-open");
    setOpen(false);
    opener.current?.focus({ preventScroll: true });
  }

  async function move(direction: number) {
    const index = (intendedIndex.current + direction + projects.length) % projects.length;
    intendedIndex.current = index;
    const revision = ++request.current;
    const photo = new window.Image();
    photo.src = projects[index].image;
    await photo.decode().catch(() => undefined);
    if (revision !== request.current || !panel.current?.open) return;
    setSelection((shown) => shown.index === index ? shown : { index, previous: shown.index });
  }

  return (
    <>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <article className={`project project--${project.layout}`} key={project.name}>
            <figure>
              <button
                type="button" className="project-image" data-image-reveal aria-haspopup="dialog"
                aria-label={`Смотреть фото проекта «${project.name}»`}
                onClick={(event) => openGallery(index, event.currentTarget)}
              >
                <Image
                  data-parallax={project.layout === "landscape" ? "photo" : undefined}
                  fill src={project.image} alt={project.alt} quality={85}
                  sizes={`(max-width: 700px) calc(100vw - 48px), ${projectWidths[project.layout]}`}
                />
                <span className="project-expand" aria-hidden="true"><Arrow /></span>
              </button>
              <figcaption>
                <h3 className="project-heading">{project.name}</h3>
                <p className="project-type">{project.type}</p>
                <p className="project-description">{project.description}</p>
              </figcaption>
            </figure>
          </article>
        ))}
      </div>
      <dialog
        className="project-gallery" aria-label="Фотографии проектов" ref={panel}
        onCancel={(event) => { event.preventDefault(); closeGallery(); }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          void move(event.key === "ArrowLeft" ? -1 : 1);
        }}
      >
        <div className="gallery-header">
          <p>Фотографии проектов</p>
          <button type="button" className="menu-close" ref={closeButton} onClick={closeGallery}>
            Закрыть <span className="menu-close-icon" aria-hidden="true" />
          </button>
        </div>
        <figure>
          <div className="gallery-photo">
            {open && selection.previous !== null && (
              <Image key={projects[selection.previous].image} fill src={projects[selection.previous].image} alt="" unoptimized />
            )}
            {open && <Image key={current.image} className="gallery-current" fill src={current.image} alt={current.alt} unoptimized loading="eager" />}
          </div>
          <figcaption className="gallery-footer">
            <div className="gallery-caption" aria-live="polite" aria-atomic="true">
              <p className="gallery-count">{String(selection.index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p>
              <h2>{current.name}</h2>
              <p className="gallery-type">{current.type}</p>
            </div>
            <div className="gallery-controls">
              <button className="gallery-prev" type="button" aria-label="Предыдущий проект" onClick={() => void move(-1)}><Arrow direction="right" /></button>
              <button type="button" aria-label="Следующий проект" onClick={() => void move(1)}><Arrow direction="right" /></button>
            </div>
          </figcaption>
        </figure>
      </dialog>
    </>
  );
}
