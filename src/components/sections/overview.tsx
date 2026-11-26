import { services } from "@/content/site";
import { QuizTrigger } from "../project-quiz";
import { Arrow } from "../ui/arrow";
import { ProjectGallery } from "./project-gallery";

export function About() {
  return (
    <section className="about section-shell" id="about" tabIndex={-1} aria-labelledby="about-title">
      <p className="section-label">О компании</p>
      <div data-reveal>
        <h2 className="section-title about-title" id="about-title">Хороший ремонт<br className="desktop-break" /> начинается с плана.</h2>
        <div className="about-copy">
          <p data-reveal-text>Разбираемся, как вы пользуетесь квартирой, и заранее продумываем планировку, материалы и порядок работ.</p>
          <p data-reveal-text>Согласовываем смету до начала ремонта. Проверяем скрытые работы и качество отделки.</p>
        </div>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section className="projects section-shell" id="projects" tabIndex={-1} aria-labelledby="projects-title">
      <div className="section-intro" data-reveal>
        <h2 className="section-title" id="projects-title">Проекты</h2>
        <p data-reveal-text>Примеры планировок и отделки на стоковых фотографиях.</p>
      </div>
      <ProjectGallery />
    </section>
  );
}

export function Services() {
  return (
    <section className="services band" id="services" tabIndex={-1} aria-labelledby="services-title">
      <div className="section-shell">
        <div className="section-intro" data-reveal>
          <h2 className="section-title" id="services-title">Услуги и стоимость</h2>
          <p data-reveal-text>Стоимость рассчитываем после консультации и замера.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service" key={service.name}>
              <h3>{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
              {service.price ? <p className="service-price"><span>Пример стоимости</span>от {service.price} ₽/м²</p> : <p className="service-price"><span>Стоимость</span>рассчитывается после замера</p>}
            </article>
          ))}
        </div>
        <div className="service-footer">
          <p>Смета зависит от состояния квартиры, материалов и объёма работ.</p>
          <div className="service-quiz-actions">
            <QuizTrigger />
            <a className="service-inquiry-link" href="#inquiry">Рассчитать мой ремонт <Arrow /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
