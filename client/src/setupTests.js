// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom implements none of the three browser APIs a plain render of <App />
// touches. matchMedia is queried by three/drei; IntersectionObserver drives the
// section reveals and the viewport-gated 3D chunk; ResizeObserver is constructed
// unconditionally by react-use-measure inside react-three-fiber's <Canvas>.
// Without these the suite fails at import time, before any assertion runs.
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

// Records every observer so a test can fire one deliberately. Nothing fires on
// its own, so the default state in every test is "nothing has scrolled into
// view" — which is exactly the state the load-order invariants care about.
global.__observers = [];
beforeEach(() => {
  global.__observers.length = 0;
});

class TestIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.targets = [];
    global.__observers.push(this);
  }
  observe(el) {
    this.targets.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords() {
    return [];
  }
  /** Pretend every observed target scrolled into view. */
  trigger() {
    this.callback(
      this.targets.map((target) => ({ target, isIntersecting: true, intersectionRatio: 1 })),
      this
    );
  }
}
window.IntersectionObserver = TestIntersectionObserver;
global.IntersectionObserver = TestIntersectionObserver;

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.ResizeObserver = window.ResizeObserver;
}

// The models start on the frame after first paint, so the suite needs a real
// requestAnimationFrame. jsdom only provides one in visual mode; fall back to a
// timer so the trigger is exercised either way.
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  global.requestAnimationFrame = window.requestAnimationFrame;
  global.cancelAnimationFrame = window.cancelAnimationFrame;
}
