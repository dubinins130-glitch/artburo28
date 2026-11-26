import { company } from "@/content/site";

export function Brand() {
  return (
    <a href="#top" className="brand" aria-label={`${company.name}, к началу страницы`}>
      <span className="brand-mark" aria-hidden="true" />
      <span>{company.name}</span>
    </a>
  );
}
