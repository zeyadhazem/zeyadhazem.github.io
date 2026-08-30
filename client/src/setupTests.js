// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom implements neither of these, and both are reached during a plain
// render of <App />: GSAP's ScrollTrigger calls matchMedia at registration
// time (gsap/dist/gsap.js MatchMedia.add), and every section component sets
// up an IntersectionObserver in useEffect. Without the shims the suite fails
// at import time, before a single assertion runs.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
  global.IntersectionObserver = window.IntersectionObserver;
}

// react-three-fiber's <Canvas> measures its container with react-use-measure,
// which constructs a ResizeObserver unconditionally. jsdom has none, so without
// this the component throws before rendering. It never reports a size, and
// r3f only creates a WebGL root once the measured rect is non-zero
// (react-three-fiber.esm.js: `if (containerRect.width > 0 && ...)`), so the
// canvas stays an inert DOM element and no WebGL context is ever needed.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.ResizeObserver = window.ResizeObserver;
}
