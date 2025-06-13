// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock global fetch se ainda não estiver definido
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Node 20+ não possui setImmediate por padrão em env JSDOM; adiciona polyfill.
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}
