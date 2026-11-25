import { company } from "@/content/site";

export type Inquiry = {
  name: string;
  phone: string;
  description: string;
  consent: boolean;
};

type InquiryResult = { status: "demo" | "sent"; message: string };
type InquiryHandler = (inquiry: Inquiry) => Promise<InquiryResult>;

export function isValidInquiryPhone(phone: string) {
  return /^[+\d()\s-]+$/.test(phone) && /^(?:[78])?\d{10}$/.test(phone.replace(/\D/g, ""));
}

export const whatsappEnabled = company.inquiryMode === "whatsapp" && Boolean(company.whatsapp);

// Демо: поля проверяются, заявка никуда не уходит.
// WhatsApp: открывается чат компании с готовым текстом, человек отправляет его сам.
// Для сайта с собственным сервером замените адаптер вызовом серверного обработчика.
export const submitInquiry: InquiryHandler = async (inquiry) => {
  if (whatsappEnabled) {
    const text = [
      `Заявка с сайта «${company.name}»`,
      `Имя: ${inquiry.name}`,
      `Телефон: ${inquiry.phone}`,
      `Задача: ${inquiry.description}`,
    ].join("\n");
    const url = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    return { status: "sent", message: "Открыли WhatsApp. Отправьте сообщение, чтобы заявка дошла до компании." };
  }
  return {
    status: "demo",
    message: "Поля проверены. Заявка не отправлена: это демонстрационная форма.",
  };
};
