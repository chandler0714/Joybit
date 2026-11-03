import { JSDOM } from 'jsdom';

export function mountGame(html) {
  let now = 1000;
  let nextId = 1;
  const timeouts = new Map();
  const intervals = new Map();
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.Date.now = () => now;
      window.setTimeout = (callback, delay = 0) => {
        const id = nextId++;
        timeouts.set(id, { callback, delay });
        return id;
      };
      window.clearTimeout = id => timeouts.delete(id);
      window.setInterval = callback => { const id = nextId++; intervals.set(id, callback); return id; };
      window.clearInterval = id => intervals.delete(id);
    },
  });
  return {
    document: dom.window.document,
    window: dom.window,
    advance(ms) { now += ms; },
    fireNextTimeout() {
      const [id, timer] = timeouts.entries().next().value ?? [];
      if (!timer) throw new Error('No pending timeout');
      timeouts.delete(id);
      now += timer.delay;
      timer.callback();
    },
    tickIntervals() { now += 1000; [...intervals.values()].forEach(callback => callback()); },
    close() { dom.window.close(); },
  };
}
