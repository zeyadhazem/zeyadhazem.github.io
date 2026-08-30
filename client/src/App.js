import './App.css';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Projects from './components/Projects/Projects';
import Footer from './components/Footer/Footer';

// No load-sequencing state here any more. Ordering used to be a JS chain in
// which each asset started only after the previous one settled, which made a
// slow hero photo block About and all three models. Ordering is now expressed
// as priority — the hero is preloaded with fetchpriority="high", About is
// lazy/low, and the 3D chunk waits on the viewport — so every section mounts
// immediately and nothing can be blocked behind another asset's completion.
function App() {
  return (
    <div className="App">
      <Navigation />
      <Hero />
      <About />
      <Projects />
      <Footer />
    </div>
  );
}

export default App;
