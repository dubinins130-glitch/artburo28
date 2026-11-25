"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { isValidInquiryPhone, submitInquiry, whatsappEnabled } from "@/lib/inquiries";
import { Arrow } from "./ui/arrow";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function InquiryForm() {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    const phone = String(data.get("phone")).trim();
    const description = String(data.get("description")).trim();

    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;
    const descriptionInput = form.elements.namedItem("description") as HTMLTextAreaElement;
    nameInput.setCustomValidity(name ? "" : "Введите ваше имя.");
    phoneInput.setCustomValidity(isValidInquiryPhone(phone) ? "" : "Введите номер телефона с 10 цифрами или с кодом +7.");
    descriptionInput.setCustomValidity(description ? "" : "Кратко опишите задачу.");
    if (!form.reportValidity()) return;

    setBusy(true);
    setMessage("");
    try {
      const result = await submitInquiry({ name, phone, description, consent: data.has("consent") });
      setMessage(result.message);
      if (result.status === "sent") form.reset();
    } catch {
      setMessage("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="inquiry-form" id="inquiry" tabIndex={-1} onSubmit={handleSubmit} onInput={() => setMessage("")}>
      <div className="inquiry-fields">
        <label htmlFor="inquiry-name">Имя
          <input id="inquiry-name" name="name" autoComplete="name" placeholder="Как к вам обращаться" maxLength={100} required onChange={(event) => event.target.setCustomValidity("")} />
        </label>
        <label htmlFor="inquiry-phone">Телефон
          <input id="inquiry-phone" name="phone" type="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" maxLength={24} required onChange={(event) => event.target.setCustomValidity("")} />
        </label>
        <label className="inquiry-description" htmlFor="inquiry-description">Кратко о задаче
          <textarea id="inquiry-description" name="description" rows={3} placeholder="Например, ремонт двухкомнатной квартиры в новостройке" maxLength={2000} required onChange={(event) => event.target.setCustomValidity("")} />
        </label>
      </div>
      <label className="inquiry-consent">
        <input name="consent" type="checkbox" required aria-describedby="form-note" />
        <span>Согласен на обработку персональных данных</span>
      </label>
      <p className="form-note" id="form-note">
        {whatsappEnabled ? "После проверки откроется WhatsApp с готовым текстом заявки." : "Демо-форма. Введённые данные остаются в браузере."}
      </p>
      <button className="button button--light" type="submit" disabled={!ready || busy}>
        {busy ? "Проверяем…" : whatsappEnabled ? "Отправить в WhatsApp" : "Проверить заявку"} <Arrow />
      </button>
      <p className="form-status" role="status">{message}</p>
    </form>
  );
}
