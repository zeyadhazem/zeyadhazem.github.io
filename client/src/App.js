import { useCallback } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Projects from './components/Projects/Projects';
import Footer from './components/Footer/Footer';
import { useLoadSequence, STEP_HERO, STEP_ABOUT, STEP_FIRST_MODEL } from './loadSequence';

function App() {
  // Assets load top-down in reading order rather than on scroll: hero photo,
  // then the About photo, then each project model in turn. See loadSequence.js.
  const [step, advance] = useLoadSequence();

  const handleHeroSettled = useCallback(() => advance(STEP_HERO), [advance]);
  const handleAboutSettled = useCallback(() => advance(STEP_ABOUT), [advance]);
  const handleModelSettled = useCallback(
    (index) => advance(STEP_FIRST_MODEL + index),
    [advance]
  );

  return (
    <div className="App">
      <Navigation />
      <Hero onSettled={handleHeroSettled} />
      <About canLoad={step >= STEP_ABOUT} onSettled={handleAboutSettled} />
      <Projects
        // Model index i starts at step STEP_FIRST_MODEL + i, so the count of
        // models permitted to start is (step - STEP_FIRST_MODEL) + 1 once the
        // sequence reaches the models at all.
        loadedModelCount={Math.max(0, step - STEP_FIRST_MODEL + 1)}
        onModelSettled={handleModelSettled}
      />
      <Footer />
    </div>
  );
}

export default App;
