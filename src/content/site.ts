const city = "Благовещенск";
const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const publicImage = (name: string) => basePath + "/images/" + name;
const location = "в Благовещенске";

export const company = {
  name: "ArtBuro28",
  developer: "KeetsCode",
  city,
  location,
  activity: "Студия дизайна интерьеров и ремонта помещений",
  description: `ArtBuro28: дизайн интерьеров и ремонт полного цикла ${location}. Бесплатный замер.`,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  phone,
  phoneHref: phone.replace(/[^\d+]/g, ""),
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "",
  // Номер WhatsApp без плюса и пробелов, например "79000000000". Пусто, пока контакты не заданы.
  whatsapp: "",
  // Имя Telegram без @, например "kontur_blg". Пусто, пока контакты не заданы.
  telegram: "",
  // "demo": форма только проверяет поля. "whatsapp": после проверки открывает WhatsApp с текстом заявки.
  inquiryMode: "demo" as "demo" | "whatsapp",
  contactNote: "Часы приёма по данным 2ГИС: 09:00–18:00, по предварительному звонку.",
  demoLabel: "Демонстрационный сайт",
};

export const navigation = [
  { id: "projects", label: "Проекты" },
  { id: "services", label: "Услуги" },
  { id: "about", label: "О компании" },
  { id: "steps", label: "Этапы работы" },
  { id: "contacts", label: "Контакты" },
] as const;

export const menuNavigation = [
  { id: "home", label: "Главная" },
  { id: "projects", label: "Проекты" },
  { id: "services", label: "Услуги и цены" },
  { id: "about", label: "О компании" },
  { id: "contacts", label: "Контакты" },
] as const;

export const images = {
  hero: publicImage("neutral-bedroom.webp"),
  heroMobile: publicImage("neutral-bedroom-mobile.webp"),
  livingRoom: publicImage("apartment-living-room.webp"),
  kitchen: publicImage("compact-kitchen.webp"),
  kitchenSketch: publicImage("compact-kitchen-rough-sketch.webp"),
  kitchenConcept: publicImage("compact-kitchen-material-study.webp"),
  bathroom: publicImage("compact-bathroom.webp"),
  studio: publicImage("studio-apartment.webp"),
  bedroom: publicImage("neutral-bedroom.webp"),
  wallFinishing: publicImage("wall-finishing.webp"),
  flooringSamples: publicImage("flooring-samples.webp"),
};

export const hero = {
  title: ["Дизайн и ремонт", "под ключ", "в Благовещенске"],
  description: "Работаем от эскиза до визуализации, чтобы вы увидели результат до начала ремонта. Замер бесплатный.",
  image: images.hero,
  mobileImage: images.heroMobile,
  imageWidth: 1400,
  imageHeight: 935,
  imageAlt: "Светлая спальня с мягким изголовьем, стеновыми панелями и плотными шторами",
  caption: "Спальня",
};

export const projects = [
  {
    name: "Компактная кухня",
    type: "Двухрядная планировка",
    description: "Белые фасады и деревянные столешницы по обе стороны прохода.",
    image: images.kitchen,
    alt: "Узкая кухня с белыми шкафами, деревянным полом и столешницами",
    layout: "wide",
  },
  {
    name: "Компактный санузел",
    type: "Совмещённый санузел",
    description: "Стеклянная перегородка отделяет душевую и сохраняет свет в помещении.",
    image: images.bathroom,
    alt: "Узкий санузел с подвесным унитазом, стеклянной душевой и плиткой под дерево на полу",
    layout: "portrait",
  },
  {
    name: "Гостиная в тёплых тонах",
    type: "Светлая отделка",
    description: "Светлые стены, мягкий диван и дневной свет от большого окна.",
    image: images.livingRoom,
    alt: "Гостиная с мягким диваном, торшером и большим окном с римской шторой",
    layout: "compact",
  },
  {
    name: "Гостиная в студии",
    type: "Открытая планировка",
    description: "Светлый пол объединяет кухню и гостиную, а обеденный стол разделяет зоны.",
    image: images.studio,
    alt: "Студия с белым диваном, компактной кухней и небольшим деревянным столом между ними",
    layout: "landscape",
  },
] as const;

export const services = [
  {
    name: "Дизайн-проект",
    price: "",
    description: "Планировка, эскизы и визуализации интерьера квартиры, дома или коммерческого помещения.",
    includes: ["Планировочные решения и зонирование", "3D-визуализация интерьера", "Рабочая документация для ремонта"],
  },
  {
    name: "Ремонт полного цикла",
    price: "",
    description: "Ремонт по проекту с бесплатным замером и подбором материалов.",
    includes: ["Бесплатный замер", "Перепланировка помещений", "Подбор отделочных материалов"],
  },
  {
    name: "Сопровождение проекта",
    price: "",
    description: "Дизайнер следит, чтобы ремонт шёл точно по проекту, и помогает с комплектацией.",
    includes: ["Авторский надзор", "Подбор мебели и декора", "Комплектация объекта"],
  },
];

type StagePhoto = { image: string; alt: string };

type TransformationPhotoSet = {
  project: string;
  caption?: string;
  photos: readonly [StagePhoto, StagePhoto, StagePhoto];
};

export const transformation = {
  photoSet: {
    project: "Компактная кухня",
    photos: [
      { image: images.kitchenSketch, alt: "Быстрый карандашный набросок стен, дверного проёма и основных объёмов кухни" },
      { image: images.kitchenConcept, alt: "Концепция кухни с деревянными столешницами, светлыми фасадами и пустыми рабочими поверхностями" },
      { image: images.kitchen, alt: "Стоковая фотография готовой кухни с того же ракурса" },
    ],
  } as TransformationPhotoSet | null,
  stages: [
    { label: "Эскиз", description: "Планировка и пропорции помещения.", placeholder: "Эскиз пока не добавлен" },
    { label: "Концепция", description: "Палитра, материалы и освещение в том же помещении.", placeholder: "Визуализация пока не добавлена" },
    { label: "Результат", description: "Фотография после ремонта с того же ракурса.", placeholder: "Фотография пока не добавлена" },
  ],
} as const;

export const processPhotos = [
  { image: images.wallFinishing, alt: "Рука в перчатке выравнивает стену широким шпателем", caption: "Подготовка стен" },
  { image: images.flooringSamples, alt: "Образцы деревянных напольных покрытий разных оттенков", caption: "Образцы покрытий" },
];

export const steps = [
  { title: "Консультация дизайнера", description: "Обсуждаем задачу, образ жизни и пожелания. Приём по предварительному звонку." },
  { title: "Бесплатный замер", description: "Снимаем размеры, проверяем исходные условия и определяем объём работ." },
  { title: "Эскиз и визуализация", description: "Прорабатываем планировку и стиль, показываем интерьер на эскизах и визуализациях до начала ремонта." },
  { title: "Документация и материалы", description: "Готовим рабочую документацию и подбираем отделочные материалы под проект и бюджет." },
  { title: "Ремонт и авторский надзор", description: "Ремонт идёт по проекту, а дизайнер контролирует, что результат совпадает с визуализацией." },
];

export const terms = [
  { title: "Бесплатный замер", description: "Студия делает замер бесплатно. Это первый шаг, после которого можно оценить объём работ и стоимость." },
  { title: "Стоимость и договор", description: "Цены на услуги студия не публикует: стоимость рассчитывается индивидуально. Объём работ, сроки и порядок оплаты фиксирует договор." },
  { title: "Гарантийные условия", description: "Сроки, перечень работ и порядок обращения уточняются в договоре со студией." },
  { title: "Отзывы клиентов", description: "В 2ГИС у студии оценка 5,0. Заказчики пишут об учтённых пожеланиях, помощи с выбором материалов, авторском надзоре и комфортном общении на всём пути." },
];
