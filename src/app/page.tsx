import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Clients } from "@/components/Clients";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col">
        <Hero />
        <Stats />
        <About />
        <Services />
        <Clients />
      </main>
      <Footer />
    </div>
  );
}
