// Единая система движения. Числа в секундах, как в GSAP.
// Микроинтеракции: 0.25-0.4. Раскрытие контента: 0.6-0.9. Раскрытие фото: 0.8-1.2.
// Меню: 0.6-0.8. Пауза между связанными элементами: 0.06-0.1.
export const motion = {
  allowed: "(prefers-reduced-motion: no-preference)",
  ease: "power3.out",
  easeSoft: "power2.out",
  inOut: "power3.inOut",
  swapEase: "power2.inOut",
  micro: 0.3,
  reveal: 0.82,
  line: 0.9,
  image: 1.1,
  imageCompact: 0.9,
  menu: 0.7,
  stagger: 0.08,
  swap: 0.46,
};

let scrollMotion: Promise<typeof import("gsap/ScrollTrigger")> | undefined;

export function loadScrollMotion() {
  scrollMotion ??= import("gsap/ScrollTrigger");
  return scrollMotion;
}
