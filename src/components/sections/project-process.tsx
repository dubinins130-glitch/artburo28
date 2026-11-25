import Image from "next/image";
import { processPhotos, steps, terms } from "@/content/site";

export function ProjectProcess() {
  return (
    <>
      <section className="steps section-shell" id="steps" tabIndex={-1} aria-labelledby="steps-title">
        <div className="steps-copy" data-reveal>
          <h2 className="section-title" id="steps-title">Как проходит ремонт</h2>
          <p data-reveal-text>От первого разговора до совместной приёмки квартиры.</p>
          <div className="process-photos">
            {processPhotos.map((photo) => (
              <figure key={photo.image}>
                <div className="process-photo" data-image-reveal>
                  <Image fill src={photo.image} alt={photo.alt} quality={85} sizes="(max-width: 700px) 45vw, 16vw" />
                </div>
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <ol className="steps-list">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="step-number" aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="terms band" aria-labelledby="terms-title">
        <div className="section-shell terms-layout">
          <div data-reveal>
            <h2 className="section-title" id="terms-title">Условия работы</h2>
            <p data-reveal-text>Что студия сообщает о своей работе в 2ГИС и о чём стоит договориться до начала ремонта.</p>
          </div>
          <div className="terms-list">
            {terms.map((term) => (
              <details key={term.title}>
                <summary>{term.title}<span className="plus" aria-hidden="true" /></summary>
                <p>{term.description}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
