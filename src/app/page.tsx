import About from "@/components/sections/About";
import Achievements from "@/components/sections/Achievements";
import BestStudents from "@/components/sections/BestStudents";
import Contact from "@/components/sections/Contact";
import Feedback from "@/components/sections/Feedback";
import Hero from "@/components/sections/Hero";
import QuickLinks from "@/components/sections/QuickLinks";
import Schedule from "@/components/sections/Schedule";
import Services from "@/components/sections/Services";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Achievements />
      <Feedback />
      <BestStudents />
      <Schedule />
      <QuickLinks />
      <Contact />
    </>
  );
}
