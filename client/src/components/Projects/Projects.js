import React, { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { projects } from '../constants';
import './Projects.css';

// The 3D stack (three, @react-three/*, DRACOLoader) lives in a separate chunk so
// it is not in the critical path for first paint. Nothing above this section
// waits on it. `gsap`/`ScrollTrigger` used to be imported here too and were dead
// code — registerPlugin was called and gsap was never used again — so they are
// gone entirely rather than merely deferred.
const ModelCanvas = lazy(() => import('./ModelCanvas'));

// react-three-fiber re-throws anything the canvas subtree throws into the outer
// React tree (react-three-fiber.esm.js:62, `if (error) throw error`). Without a
// boundary a single failed asset unmounts the whole React root and the page goes
// blank. Scoped to one card so a failure costs one card, not the site. It also
// catches a failed chunk import, so a dropped connection degrades to the
// placeholder. Exported for direct testing: in jsdom the canvas never gets a
// non-zero rect, so no real model load can be provoked through <Canvas>.
export class CanvasErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('3D model failed to load; falling back to placeholder.', error);
    this.props.onFail?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const ProjectCard = ({ project, index, modelsStarted }) => {
  const [modelReady, setModelReady] = useState(false);
  const [modelFailed, setModelFailed] = useState(false);
  const handleModelReady = useCallback(() => setModelReady(true), []);
  const handleModelFail = useCallback(() => {
    setModelFailed(true);
    setModelReady(false);
  }, []);

  // No IntersectionObserver and no reveal animation on the card itself. The
  // card's copy is visible from first paint (see Projects.css) so no JS stands
  // between a visitor and the text, and it cannot be outrun by its own graphic.
  return (
    <div
      className={`project-card ${index % 2 === 1 && index !== 2 ? 'reverse' : ''}`}
      style={{ '--accent-color': project.color }}
    >
      <div className="project-content">
        <div className="project-header">
          <span className="project-year">{project.year}</span>
          <h2 className="project-title">{project.title}</h2>
          <h3 className="project-subtitle">{project.subtitle}</h3>
        </div>
        <p className="project-description">{project.description}</p>
        <ul className="project-highlights">
          {project.highlights.map((highlight, idx) => (
            <li key={idx} className="highlight-item">
              <span className="highlight-bullet"></span>
              {highlight}
            </li>
          ))}
        </ul>
      </div>
      <div className="project-visual">
        <div className="model-container">
          <div
            className={`model-placeholder${modelReady ? ' is-hidden' : ''}${modelFailed ? ' is-failed' : ''}`}
            aria-hidden="true"
          />
          {modelsStarted && !modelFailed && (
            <CanvasErrorBoundary onFail={handleModelFail}>
              <Suspense fallback={null}>
                <ModelCanvas project={project} onReady={handleModelReady} />
              </Suspense>
            </CanvasErrorBoundary>
          )}
        </div>
        <div className="visual-overlay" style={{ background: `linear-gradient(135deg, ${project.color}20, ${project.color}10)` }}></div>
      </div>
    </div>
  );
};

const Projects = () => {
  const sectionRef = useRef(null);
  const [modelsStarted, setModelsStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Models start unconditionally on the first frame after the initial paint.
  // No scroll requirement: the owner asked for the 3D models to load "even if
  // the user did not scroll down to that yet", so there is deliberately no
  // IntersectionObserver anywhere in the model path.
  //
  // Double requestAnimationFrame is the trigger: the first callback runs before
  // the upcoming paint, the second after it has been committed, so the dynamic
  // import() of the 3D chunk and the .glb fetches are issued once the hero and
  // About are already on screen and their requests already in flight. That is
  // what keeps this cheap — priority ordering, not gating.
  //
  // Deliberately not window.load: that would couple model loading to the hero
  // photo finishing, which is exactly the coupling this round removed.
  // Deliberately not setTimeout: an arbitrary delay is not a paint signal.
  useEffect(() => {
    let outer = 0;
    let inner = 0;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setModelsStarted(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return (
    <section id="projects" className="projects section" ref={sectionRef}>
      <div className="container">
        <div className="projects-header">
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            Innovative solutions that power millions of Apple devices worldwide
          </p>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              modelsStarted={modelsStarted}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
