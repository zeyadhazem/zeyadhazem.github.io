import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';
import { projects } from '../constants';
import './Projects.css';
import Loader from '../Loader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const Model = ({ modelPath, scale = 1, position = [0, 0, 0] }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={scale} position={position} />;
};

const ProjectCard = ({ project, index }) => {
  const cardRef = useRef(null);

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
      <div className="project-visual">
        <div className="model-container">
          <Canvas camera={{
            position: project.cameraPosition,
            fov: 45
          }}>
            <Suspense fallback={<Loader />}>
              <Stage environment="city" intensity={0.8} adjustCamera={false}>
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
            </Suspense>
          </Canvas>
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