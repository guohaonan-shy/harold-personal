import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Upcoming from "./components/Upcoming";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-page">
      <Hero />
      <Projects />
      <Upcoming />
      <Footer />
    </main>
  );
}
