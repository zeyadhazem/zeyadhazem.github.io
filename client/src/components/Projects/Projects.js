import React, { Suspense, useRef, useEffect, useState, useCallback, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';
import { projects } from '../constants';
import './Projects.css';
import Loader from '../Loader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Self-hosted copy of the environment map drei's environment="city" preset uses.
// The preset resolves to https://raw.githack.com/pmndrs/drei-assets/<sha>/hdri/
// (useEnvironment.js:8) — free, rate-limited third-party hosting on the critical
// path of every card. Byte-identical file, served from our own origin.
const ENVIRONMENT = { files: process.env.PUBLIC_URL + '/hdri/potsdamer_platz_1k.hdr' };

const Model = ({ modelPath, scale = 1, position = [0, 0, 0] }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={scale} position={position} />;
};

// Rendered as a Suspense child, so it can only mount once the model's fetch has
// resolved. That is the signal used to retire the skeleton.
const ModelReady = ({ onReady }) => {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
};

// react-three-fiber re-throws anything the canvas subtree throws into the outer
// React tree (react-three-fiber.esm.js:62, `if (error) throw error`). Without a
// boundary a single failed asset fetch unmounts the whole React root and the
// page goes blank. Scoped to one canvas so a failure costs one card, not the site.
class CanvasErrorBoundary extends Component {
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

const ProjectCard = ({ project, index }) => {
  const cardRef = useRef(null);
  const visualRef = useRef(null);
  const [modelInView, setModelInView] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelFailed, setModelFailed] = useState(false);
  // Stable identity so <ModelReady>'s effect does not re-run on every render.
  const handleModelReady = useCallback(() => setModelReady(true), []);
  const handleModelFail = useCallback(() => {
    setModelFailed(true);
    setModelReady(false);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Defer the .glb fetch until the canvas is close to the viewport, so several
  // MB of model data never competes with first paint.
  useEffect(() => {
    const node = visualRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setModelInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
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
      <div className="project-visual" ref={visualRef}>
        <div className="model-container">
          <div
            className={`model-skeleton${modelReady ? ' is-hidden' : ''}${modelFailed ? ' is-static' : ''}`}
            aria-hidden="true"
          />
          {modelInView && !modelFailed && (
            <CanvasErrorBoundary onFail={handleModelFail}>
              <Canvas camera={{
                position: project.cameraPosition,
                fov: 45
              }}>
                <Suspense fallback={<Loader />}>
                  <Stage environment={ENVIRONMENT} intensity={0.8} adjustCamera={false}>
                    <Model
                      modelPath={project.model}
                      scale={project.scale}
                      position={project.position}
                      rotation={project.rotation}
                    />
                  </Stage>
                  <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={2}
                    enablePan={false}
                    maxPolarAngle={project.title === 'HomePod Evolution' ? Math.PI / 2 : Math.PI / 2}
                    minPolarAngle={project.title === 'HomePod Evolution' ? Math.PI / 3 : Math.PI / 3}
                    target={project.title === 'HomePod Evolution' ? [0, 0, 0] : [0, 0, 0]}
                  />
                  <ModelReady onReady={handleModelReady} />
                </Suspense>
              </Canvas>
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
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;