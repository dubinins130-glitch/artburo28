import { images } from "./site";

export type QuizOption = {
  label: string;
  image?: string;
};

export const quizQuestions = [
  {
    title: "Что будем оформлять?",
    label: "Тип помещения",
    options: [
      { label: "Квартира" },
      { label: "Частный дом" },
      { label: "Коммерческое помещение" },
    ],
  },
  {
    title: "Какая площадь помещения?",
    label: "Площадь",
    options: [
      { label: "До 50 м²" },
      { label: "От 50 до 100 м²" },
      { label: "От 100 до 150 м²" },
      { label: "Более 150 м²" },
    ],
  },
  {
    title: "Какой стиль вам ближе?",
    label: "Стиль",
    options: [
      { label: "Минимализм", image: images.studio },
      { label: "Современный", image: images.livingRoom },
      { label: "Неоклассика", image: images.bedroom },
      { label: "Пока не определился", image: images.kitchen },
    ],
  },
  {
    title: "Какие услуги нужны?",
    label: "Услуги",
    options: [
      { label: "Дизайн-проект" },
      { label: "Ремонт под ключ" },
      { label: "Дизайн и ремонт" },
    ],
  },
] as const satisfies readonly {
  title: string;
  label: string;
  options: readonly QuizOption[];
}[];
