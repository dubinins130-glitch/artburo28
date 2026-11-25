import { Header } from "@/components/header";
import { ProjectQuiz } from "@/components/project-quiz";
import { SectionMotion } from "@/components/section-motion";
import { Contacts, Footer } from "@/components/sections/contacts";
import { Hero } from "@/components/sections/hero";
import { About, Projects, Services } from "@/components/sections/overview";
import { ProjectProcess } from "@/components/sections/project-process";
import { Transformation } from "@/components/sections/transformation";

export default function Home() {
  return (
    <ProjectQuiz>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Projects />
        <Services />
        <Transformation />
        <ProjectProcess />
        <Contacts />
      </main>
      <SectionMotion />
      <Footer />
    </ProjectQuiz>
  );
}
