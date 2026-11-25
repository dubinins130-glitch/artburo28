import type { Metadata } from "next";
import Script from "next/script";
import { company, hero } from "@/content/site";
import "@fontsource-variable/manrope/wght.css";
import "./globals.css";
import "./project-quiz.css";

const title = `${company.name} — дизайн интерьеров и ремонт ${company.location}`;

const socialImage = new URL(hero.image, company.siteUrl).href;

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title,
  description: company.description,
  // Demo site: keep it out of search indexes.
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description: company.description,
    type: "website",
    locale: "ru_RU",
    siteName: company.name,
    images: [{ url: socialImage, width: hero.imageWidth, height: hero.imageHeight, alt: hero.imageAlt }],
  },
  twitter: { card: "summary_large_image", title, description: company.description, images: [socialImage] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body id="top">
        {/* До первой отрисовки задаёт стартовое состояние первого экрана, чтобы шапка и текст не мелькали
            перед анимацией. Класс снимается при запуске анимации или через 3,5 секунды на всякий случай. */}
        <Script
          id="intro-state"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "(function(){try{var d=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: no-preference)').matches&&!location.hash&&window.scrollY<10){d.classList.add('intro');setTimeout(function(){d.classList.remove('intro')},3500)}}catch(e){}})()",
          }}
        />
        {children}
      </body>
    </html>
  );
}
