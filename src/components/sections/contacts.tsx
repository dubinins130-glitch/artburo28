import { company, navigation } from "@/content/site";
import { InquiryForm } from "../inquiry-form";
import { QuizTrigger } from "../project-quiz";
import { Arrow } from "../ui/arrow";
import { Brand } from "../ui/brand";

function ContactLinks() {
  const links = [
    company.phoneHref ? { href: `tel:${company.phoneHref}`, label: company.phone } : null,
    company.whatsapp ? { href: `https://wa.me/${company.whatsapp}`, label: "WhatsApp" } : null,
    company.telegram ? { href: `https://t.me/${company.telegram}`, label: "Telegram" } : null,
  ].filter((link): link is { href: string; label: string } => link !== null);
  if (!links.length) return null;
  return (
    <p className="contacts-links">
      {links.map(({ href, label }) => <a key={label} href={href} rel="noopener noreferrer">{label}</a>)}
    </p>
  );
}

export function Contacts() {
  return (
    <section className="contacts" id="contacts" tabIndex={-1} aria-labelledby="contacts-title">
      <div className="section-shell contacts-layout">
        <div className="contacts-copy" data-reveal>
          <p className="section-label">Контакты</p>
          <h2 className="section-title" id="contacts-title">Давайте обсудим ваш ремонт.</h2>
          <p data-reveal-text>Расскажите, в каком состоянии квартира и что вы хотите изменить. С этого начинается разговор о смете и сроках.</p>
          <p className="contacts-city">{company.address ? `${company.city}, ${company.address}` : company.city}</p>
          <ContactLinks />
          <QuizTrigger className="button button--light contacts-quiz-trigger" />
        </div>
        <InquiryForm />
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="footer-main">
          <div>
            <Brand />
            <p>{company.activity}</p>
          </div>
          <nav aria-label="Навигация в подвале">
            {navigation.map(({ id, label }) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <div className="footer-contact">
            <p>{company.address ? `${company.city}, ${company.address}` : company.city}</p>
            {company.phoneHref && <p><a href={`tel:${company.phoneHref}`}>{company.phone}</a></p>}
            {company.email && <p>{company.email}</p>}
            <small>{company.contactNote}</small>
          </div>
          <a className="back-to-top" href="#top" aria-label="Вернуться к началу"><Arrow direction="up" /></a>
        </div>
        <div className="footer-meta">
          <span>{company.demoLabel}</span>
          <span>Разработка · {company.developer}</span>
        </div>
      </div>
    </footer>
  );
}
