import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-section">
              <h3 className="footer-title">Connect</h3>
              <ul className="footer-links">
                <li>
                  <a href="mailto:zeyadhazemsaleh@gmail.com" className="footer-link">
                    Email
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/zeyadsaleh/" target="_blank" rel="noopener noreferrer" className="footer-link">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://github.com/zeyadhazem" target="_blank" rel="noopener noreferrer" className="footer-link">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3 className="footer-title">Navigation</h3>
              <ul className="footer-links">
                <li>
                  <a href="#about" className="footer-link">
                    About
                  </a>
                </li>
                <li>
                  <a href="#projects" className="footer-link">
                    Projects
                  </a>
                </li>
                <li>
                  <a href="/Zeyad_Saleh_Resume_2025(2).pdf" target="_blank" rel="noopener noreferrer" className="footer-link">
                    Resume
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3 className="footer-title">Apple</h3>
              <ul className="footer-links">
                <li>
                  <span className="footer-text">Senior Software Engineer</span>
                </li>
                <li>
                  <span className="footer-text">Apple Intelligence</span>
                </li>
                <li>
                  <span className="footer-text">Media Architecture</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>© {currentYear} Zeyad Saleh. All rights reserved.</p>
            </div>
            <div className="footer-legal">
              <span className="footer-text">Built with passion for innovation</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;