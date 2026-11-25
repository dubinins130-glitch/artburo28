"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { company, menuNavigation, navigation } from "@/content/site";
import { motion as timing } from "@/lib/motion";
import { Arrow } from "./ui/arrow";
import { Brand } from "./ui/brand";

export function Header() {
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const animation = useRef<gsap.Context | null>(null);
  const closing = useRef(false);
  const destination = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = header.current;
    const hero = document.getElementById("home");
    if (!element || !hero) return;

    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.overHero = String(entry.isIntersecting);
    }, { rootMargin: `-${element.offsetHeight}px 0px 0px` });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const panel = dialog.current;
    return () => {
      animation.current?.revert();
      if (panel?.open) {
        panel.close();
        document.documentElement.classList.remove("menu-open");
      }
    };
  }, []);

  function finishClose() {
    const target = destination.current;
    destination.current = null;
    closing.current = false;
    dialog.current?.close();
    animation.current?.revert();
    animation.current = null;
    timeline.current = null;
    document.documentElement.classList.remove("menu-open");
    setOpen(false);

    if (!target) {
      toggle.current?.focus({ preventScroll: true });
      return;
    }

    const hash = `#${target.id}`;
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  }

  function openMenu() {
    const panel = dialog.current;
    if (!panel || panel.open) return;

    document.documentElement.classList.add("menu-open");
    panel.showModal();
    panel.scrollTop = 0;
    closeButton.current?.focus({ preventScroll: true });
    setOpen(true);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const compact = window.matchMedia("(max-width: 700px)").matches;

    animation.current = gsap.context(() => {
      timeline.current = gsap.timeline({ defaults: { ease: timing.ease }, onReverseComplete: finishClose })
        .from(".menu-surface", { scaleY: 0, transformOrigin: "top", duration: 0.6, ease: timing.inOut }, 0)
        .from(".menu-close", { autoAlpha: 0.55, duration: 0.3 }, 0.08)
        .from(".menu-link-label", { opacity: 0, y: compact ? 10 : 18, duration: 0.5, stagger: timing.stagger }, 0.22)
        .from(".menu-rule", { scaleX: 0, transformOrigin: "left", duration: 0.6, stagger: timing.stagger }, 0.26)
        .from(".menu-index", { autoAlpha: 0, duration: 0.4, stagger: timing.stagger }, 0.28)
        .from(".menu-brand, .menu-location", { autoAlpha: 0, y: 5, duration: 0.4 }, 0.45);
    }, panel);
  }

  function closeMenu(target: HTMLElement | null = null) {
    if (!dialog.current?.open || closing.current) return;
    closing.current = true;
    destination.current = target;

    const motion = timeline.current;
    if (!motion || motion.progress() === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishClose();
      return;
    }
    motion.timeScale(1.6).reverse();
  }

  function followLink(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    closeMenu(target);
  }

  function keepFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]");
    const first = controls[0];
    const last = controls[controls.length - 1];
    const focused = document.activeElement;
    if (event.shiftKey && focused === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && focused === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <>
      <header className="site-header" ref={header}>
        <a className="skip-link" href="#main">Перейти к содержанию</a>
        <div className="header-inner section-shell">
          <Brand />
          <nav className="header-nav" aria-label="Разделы сайта">
            {navigation.map(({ id, label }) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <a className="header-cta" href="#inquiry" aria-label="Связаться и обсудить проект">Связаться</a>
            <button
              type="button" className="menu-toggle" aria-controls="primary-menu"
              aria-haspopup="dialog" aria-expanded={open} onClick={openMenu} ref={toggle}
            >
              Меню <span className="menu-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <dialog
        className="menu-dialog" id="primary-menu" aria-label="Меню сайта" ref={dialog}
        onCancel={(event) => { event.preventDefault(); closeMenu(); }} onKeyDown={keepFocus}
      >
        <div className="menu-surface" aria-hidden="true" />
        <div className="menu-shell section-shell">
          <div className="menu-top">
            <span className="brand menu-brand"><span className="brand-mark" aria-hidden="true" />{company.name}</span>
            <button type="button" className="menu-close" onClick={() => closeMenu()} ref={closeButton}>
              Закрыть <span className="menu-close-icon" aria-hidden="true" />
            </button>
          </div>
          <nav className="menu-nav" aria-label="Основная навигация">
            <ol>
              {menuNavigation.map(({ id, label }, index) => (
                <li key={id}>
                  <a className="menu-link" href={`#${id}`} onClick={(event) => followLink(event, id)}>
                    <span className="menu-index" aria-hidden="true">0{index + 1}</span>
                    <span className="menu-rule" aria-hidden="true" />
                    <span className="menu-link-label">{label}</span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <p className="menu-location">{company.city} · Амурская область</p>
        </div>
      </dialog>
    </>
  );
}
