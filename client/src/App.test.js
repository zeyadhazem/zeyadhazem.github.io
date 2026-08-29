import { render, screen } from '@testing-library/react';
import App from './App';

// The jsdom shims these tests depend on (matchMedia for GSAP's ScrollTrigger,
// IntersectionObserver for every section) live in src/setupTests.js.
// IntersectionObserver never fires there, so the deferred <Canvas> elements are
// never mounted and no WebGL context is required.

test('renders the hero name and role', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /zeyad saleh/i })).toBeInTheDocument();
  expect(screen.getAllByText(/staff software engineer at apple/i).length).toBeGreaterThan(0);
});

test('hero photo reserves its box and is prioritised', () => {
  render(<App />);
  const photo = screen.getByAltText(/zeyad saleh - staff software engineer at apple/i);
  expect(photo).toHaveAttribute('width', '800');
  expect(photo).toHaveAttribute('height', '1089');
  expect(photo).toHaveAttribute('decoding', 'async');
  expect(photo).toHaveAttribute('fetchpriority', 'high');
});

test('about photo reserves its box and is deferred', () => {
  render(<App />);
  const photo = screen.getByAltText(/^zeyad saleh$/i);
  expect(photo).toHaveAttribute('width', '1000');
  expect(photo).toHaveAttribute('height', '1333');
  expect(photo).toHaveAttribute('loading', 'lazy');
});

test('both photos offer AVIF and WebP ahead of the JPEG fallback', () => {
  const { container } = render(<App />);
  const pictures = container.querySelectorAll('picture');
  expect(pictures).toHaveLength(2);
  pictures.forEach((picture) => {
    const types = [...picture.querySelectorAll('source')].map((s) => s.type);
    expect(types).toEqual(['image/avif', 'image/webp']);
    expect(picture.querySelector('img').getAttribute('src')).toMatch(/\.jpg$/);
  });
});

test('each model canvas reserves its box with a skeleton before the model loads', () => {
  const { container } = render(<App />);
  // IntersectionObserver is stubbed and never fires, so this is the pre-load state.
  expect(container.querySelectorAll('.model-skeleton')).toHaveLength(3);
  expect(container.querySelectorAll('.model-skeleton.is-hidden')).toHaveLength(0);
  expect(container.querySelectorAll('canvas')).toHaveLength(0);
});
