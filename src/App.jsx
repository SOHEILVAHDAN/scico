import Navbar from './sections/Navbar.jsx';
import Hero from './sections/Hero.jsx';
import Manifesto from './sections/Manifesto.jsx';
import Work from './sections/Work.jsx';
import Process from './sections/Process.jsx';
import Studio from './sections/Studio.jsx';
import Contact from './sections/Contact.jsx';
import Footer from './sections/Footer.jsx';
import GrainOverlay from './components/GrainOverlay.jsx';
import { LanguageProvider } from './i18n/index.js';
import useSmoothScroll from './hooks/useSmoothScroll.js';

const Shell = () => {
  useSmoothScroll();

  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main className="page">
        <Hero />
        <Manifesto />
        <Work />
        <Process />
        <Studio />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

const App = () => (
  <LanguageProvider>
    <Shell />
  </LanguageProvider>
);

export default App;
