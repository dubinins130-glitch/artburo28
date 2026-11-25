"use client";

import { gsap } from "gsap";
import Image from "next/image";
import {
  createContext, useContext, useEffect, useLayoutEffect, useRef, useState,
  type FormEvent, type ReactNode,
} from "react";
import { quizQuestions, type QuizOption } from "@/content/project-quiz";
import { company } from "@/content/site";
import { isValidInquiryPhone } from "@/lib/inquiries";
import { motion } from "@/lib/motion";
import { Arrow } from "./ui/arrow";

const openQuizContext = createContext<(trigger: HTMLButtonElement) => void>(() => {});
const budgetStep = quizQuestions.length;
const contactStep = budgetStep + 1;
const stepCount = contactStep + 1;
const stepNumbers = Array.from({ length: stepCount }, (_, index) => index + 1);
const revealStart = "inset(100% -6px 0 -6px)";
const revealEnd = "inset(0% -6px 0 -6px)";
const panelStart = "inset(0 0 100% 0)";
const panelEnd = "inset(0 0 0 0)";

type Contact = { name: string; phone: string };

export function QuizTrigger({
  className = "button button--dark",
}: { className?: string }) {
  const open = useContext(openQuizContext);
  return (
    <button type="button" className={className} aria-haspopup="dialog" aria-controls="project-quiz"
      onClick={(event) => open(event.currentTarget)}>
      Подобрать дизайн-проект <Arrow />
    </button>
  );
}

function Choice({
  option, step, selected, choose,
}: { option: QuizOption; step: number; selected: boolean; choose: () => void }) {
  return (
    <label className="quiz-choice quiz-reveal">
      <input className="quiz-radio" type="radio" name={"quiz-choice-" + step}
        value={option.label} checked={selected} onChange={choose} />
      {option.image && (
        <span className="quiz-choice-photo">
          <Image src={option.image} alt="" fill sizes="(max-width: 700px) 46vw, (max-width: 900px) 31vw, 290px" loading="eager" />
        </span>
      )}
      <span className="quiz-choice-caption">
        <span>{option.label}</span>
        <span className="quiz-choice-mark" aria-hidden="true" />
      </span>
    </label>
  );
}

function ProjectSummary({ answers, budget, contact }: {
  answers: string[];
  budget: string;
  contact?: Contact;
}) {
  const summary: { label: string; value: string }[] = quizQuestions.map((question, index) => ({
    label: question.label,
    value: answers[index],
  }));
  summary.push({ label: "Бюджет", value: budget.trim() || "Не указан" });
  if (contact) {
    summary.push({ label: "Имя", value: contact.name }, { label: "Телефон", value: contact.phone });
  }

  return (
    <dl className="quiz-summary">
      {summary.map(({ label, value }) => (
        <div className="quiz-summary-row" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectQuiz({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const panelMotion = useRef<gsap.core.Tween | null>(null);
  const stepMotion = useRef<gsap.core.Timeline | null>(null);
  const pending = useRef<{ height: number; direction: number } | null>(null);
  const closing = useRef(false);
  const moving = useRef(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [contact, setContact] = useState<Contact>({ name: "", phone: "" });
  const [complete, setComplete] = useState(false);

  const question = quizQuestions[step];
  const isBudget = step === budgetStep;
  const title = question?.title ?? (isBudget ? "Какой бюджет планируете?" : complete ? "Резюме готово" : "Ваш проект");

  useEffect(() => {
    const panel = dialog.current;
    return () => {
      panelMotion.current?.kill();
      stepMotion.current?.kill();
      if (panel?.open) {
        panel.close();
        document.documentElement.classList.remove("project-quiz-open");
      }
    };
  }, []);

  useLayoutEffect(() => {
    const next = pending.current;
    const viewport = frame.current;
    const content = workspace.current;
    if (!next || !viewport || !content || !dialog.current?.open || closing.current) return;
    pending.current = null;
    if (scrollArea.current) scrollArea.current.scrollTop = 0;
    heading.current?.focus({ preventScroll: true });

    if (!window.matchMedia(motion.allowed).matches) {
      moving.current = false;
      return;
    }

    const items = content.querySelectorAll(".quiz-reveal");
    const height = Math.ceil(content.getBoundingClientRect().height);
    stepMotion.current = gsap.timeline({
      defaults: { ease: motion.ease },
      onComplete: () => {
        moving.current = false;
        stepMotion.current = null;
      },
    })
      .fromTo(viewport, { height: next.height }, { height, duration: motion.swap, clearProps: "height" }, 0)
      .fromTo(items, { clipPath: revealStart, y: 12 * next.direction, opacity: 0.25 }, {
        clipPath: revealEnd, y: 0, opacity: 1,
        duration: motion.swap, stagger: Math.min(motion.stagger, 0.05), clearProps: "clipPath,transform,opacity",
      }, 0.06);
  }, [step, complete]);

  function openQuiz(trigger: HTMLButtonElement) {
    const panel = dialog.current;
    if (!panel || panel.open) return;
    opener.current = trigger;
    panel.showModal();
    document.documentElement.classList.add("project-quiz-open");
    if (scrollArea.current) scrollArea.current.scrollTop = 0;
    heading.current?.focus({ preventScroll: true });

    if (window.matchMedia(motion.allowed).matches) {
      panelMotion.current = gsap.fromTo(panel, { clipPath: panelStart }, {
        clipPath: panelEnd, duration: motion.menu, ease: motion.inOut, clearProps: "clipPath",
      });
    }
  }

  function finishClose() {
    const panel = dialog.current;
    if (!panel) return;
    panel.close();
    gsap.set(panel, { clearProps: "clipPath" });
    gsap.set(panel.querySelectorAll(".quiz-reveal"), { clearProps: "clipPath,transform,opacity" });
    if (frame.current) gsap.set(frame.current, { clearProps: "height" });
    document.documentElement.classList.remove("project-quiz-open");
    panelMotion.current = null;
    stepMotion.current = null;
    pending.current = null;
    moving.current = false;
    closing.current = false;
    opener.current?.focus({ preventScroll: true });

    if (complete) {
      setStep(0);
      setAnswers([]);
      setBudget("");
      setContact({ name: "", phone: "" });
      setComplete(false);
    }
  }

  function closeQuiz() {
    const panel = dialog.current;
    if (!panel?.open || closing.current) return;
    closing.current = true;
    panelMotion.current?.kill();
    stepMotion.current?.kill();

    if (window.matchMedia(motion.allowed).matches) {
      panelMotion.current = gsap.fromTo(panel, { clipPath: panel.style.clipPath || panelEnd }, {
        clipPath: panelStart, duration: motion.swap, ease: motion.inOut, onComplete: finishClose,
      });
    } else {
      finishClose();
    }
  }

  function changeScreen(update: () => void, direction = 1) {
    const viewport = frame.current;
    const content = workspace.current;
    if (!viewport || !content || moving.current || closing.current) return;
    moving.current = true;

    function swap(element: HTMLDivElement) {
      pending.current = { height: Math.ceil(element.getBoundingClientRect().height), direction };
      update();
    }

    if (!window.matchMedia(motion.allowed).matches) {
      swap(viewport);
      return;
    }
    stepMotion.current = gsap.timeline({ onComplete: () => swap(viewport) })
      .to(content.querySelectorAll(".quiz-reveal"), {
        clipPath: direction === 1 ? "inset(0 -6px 100% -6px)" : revealStart,
        y: -8 * direction, opacity: 0.2, duration: motion.micro * 0.65,
        ease: motion.swapEase, stagger: 0.025,
      });
  }

  function choose(label: string) {
    if (moving.current || closing.current) return;
    setAnswers((previous) => {
      const next = [...previous];
      next[step] = label;
      return next;
    });
  }

  function goBack() {
    if (complete) changeScreen(() => setComplete(false), -1);
    else if (step > 0) changeScreen(() => setStep(step - 1), -1);
  }

  function skipBudget() {
    changeScreen(() => {
      setBudget("");
      setStep(contactStep);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (moving.current || closing.current || complete) return;
    if (step < contactStep) {
      if (!question || answers[step]) changeScreen(() => setStep(step + 1));
      return;
    }

    const form = event.currentTarget;
    const name = form.elements.namedItem("quiz-name") as HTMLInputElement;
    const phone = form.elements.namedItem("quiz-phone") as HTMLInputElement;
    name.setCustomValidity(contact.name.trim() ? "" : "Введите ваше имя.");
    phone.setCustomValidity(isValidInquiryPhone(contact.phone.trim()) ? "" : "Введите номер телефона с 10 цифрами или с кодом +7.");
    if (!form.reportValidity()) return;

    changeScreen(() => {
      setContact({ name: contact.name.trim(), phone: contact.phone.trim() });
      setComplete(true);
    });
  }

  return (
    <openQuizContext.Provider value={openQuiz}>
      {children}
      <dialog className="project-quiz" id="project-quiz" aria-label="Подбор дизайн-проекта" ref={dialog}
        onCancel={(event) => { event.preventDefault(); closeQuiz(); }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          closeQuiz();
        }}>
        <form className="quiz-layout" onSubmit={handleSubmit}>
          <header className="quiz-header">
            <div className="quiz-shell quiz-header-inner">
              <span className="brand"><span className="brand-mark" aria-hidden="true" />{company.name}</span>
              <button className="quiz-close" type="button" onClick={closeQuiz}>
                <span>Закрыть</span><span className="quiz-close-icon" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="quiz-scroll" ref={scrollArea}>
            <div className="quiz-shell quiz-main">
              <div className="quiz-progress" role="progressbar" aria-label="Шаг квиза"
                aria-valuemin={1} aria-valuemax={stepCount} aria-valuenow={step + 1}
                aria-valuetext={"Шаг " + (step + 1) + " из " + stepCount}>
                <span className="quiz-count" aria-hidden="true">
                  <span>{"0" + (step + 1)}</span><span> / {"0" + stepCount}</span>
                </span>
                <span className="quiz-progress-track" aria-hidden="true">
                  {stepNumbers.map((number) => <span key={number} data-filled={number <= step} data-current={number === step + 1} />)}
                </span>
              </div>

              <div ref={frame} className="quiz-frame">
                <div className="quiz-workspace" ref={workspace} key={title}>
                  <div className="quiz-heading quiz-reveal">
                    <h2 className="quiz-title" id="quiz-question" ref={heading} tabIndex={-1}>{title}</h2>
                    {isBudget && <p className="quiz-help">Необязательный вопрос. Можно указать сумму или диапазон в рублях.</p>}
                    {step === contactStep && <p className="quiz-help">
                      {complete ? "Вы заполнили демо-квиз. Данные остались в вашем браузере." : "Проверьте параметры проекта и добавьте контакты."}
                    </p>}
                  </div>

                  {question && (
                    <fieldset className={"quiz-choices" + (step === 2 ? " quiz-choices--photos" : "")} aria-labelledby="quiz-question">
                      {question.options.map((option) => (
                        <Choice key={option.label} option={option} step={step} selected={answers[step] === option.label}
                          choose={() => choose(option.label)} />
                      ))}
                    </fieldset>
                  )}

                  {isBudget && (
                    <div className="quiz-budget quiz-reveal">
                      <label className="quiz-field" htmlFor="quiz-budget">
                        Ваш бюджет
                        <input id="quiz-budget" value={budget} maxLength={100}
                          onChange={(event) => setBudget(event.target.value)} placeholder="Сумма или диапазон" />
                      </label>
                      <button className="quiz-text-action" type="button" onClick={skipBudget}>Пропустить</button>
                    </div>
                  )}

                  {step === contactStep && (
                    <div className="quiz-final">
                      <div className="quiz-reveal">
                        <ProjectSummary answers={answers} budget={budget} contact={complete ? contact : undefined} />
                      </div>
                      {!complete && (
                        <div className="quiz-contact quiz-reveal">
                          <label className="quiz-field" htmlFor="quiz-name">Имя
                            <input id="quiz-name" name="quiz-name" autoComplete="name" maxLength={100} required
                              value={contact.name} placeholder="Как к вам обращаться"
                              onChange={(event) => {
                                event.target.setCustomValidity("");
                                setContact({ ...contact, name: event.target.value });
                              }} />
                          </label>
                          <label className="quiz-field" htmlFor="quiz-phone">Телефон
                            <input id="quiz-phone" name="quiz-phone" type="tel" autoComplete="tel" maxLength={24} required
                              value={contact.phone} placeholder="+7 (___) ___-__-__"
                              onChange={(event) => {
                                event.target.setCustomValidity("");
                                setContact({ ...contact, phone: event.target.value });
                              }} />
                          </label>
                          <p className="quiz-note">Демо-режим. Контакты останутся в браузере.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="quiz-footer">
            <div className="quiz-shell quiz-footer-inner">
              {step > 0 && (
                <button className="quiz-back" type="button" onClick={goBack}>
                  <span className="quiz-back-icon"><Arrow direction="right" /></span>
                  {complete ? "Изменить" : "Назад"}
                </button>
              )}
              {complete ? (
                <button className="button button--dark quiz-next" type="button" onClick={closeQuiz}>Закрыть <Arrow /></button>
              ) : (
                <button className="button button--dark quiz-next" type="submit" disabled={Boolean(question && !answers[step])}>
                  {step === contactStep ? "Собрать резюме" : "Далее"} <Arrow direction="right" />
                </button>
              )}
            </div>
          </footer>
        </form>
      </dialog>
    </openQuizContext.Provider>
  );
}
