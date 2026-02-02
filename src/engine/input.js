import { assoc } from "./fp.js";

export const makeInput = (canvas) => {
  const buffer = {
    keyDown: new Set(),
    keyUp: new Set(),
    mouse: { x: 0, y: 0, down: false, clicked: false },
  };

  const onKeyDown = (e) => buffer.keyDown.add(e.code);
  const onKeyUp = (e) => buffer.keyUp.add(e.code);

  const onMouseMove = (e) => {
    const r = canvas.getBoundingClientRect();
    buffer.mouse = assoc(buffer.mouse, {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    });
  };

  const onMouseDown = () => (buffer.mouse = assoc(buffer.mouse, { down: true, clicked: true }));
  const onMouseUp = () => (buffer.mouse = assoc(buffer.mouse, { down: false }));

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);

  const drain = () => {
    const snapshot = {
      keyDown: new Set(buffer.keyDown),
      keyUp: new Set(buffer.keyUp),
      mouse: buffer.mouse,
    };
    buffer.keyDown.clear();
    buffer.keyUp.clear();
    buffer.mouse = assoc(buffer.mouse, { clicked: false });
    return snapshot;
  };

  return { drain };
};

// UI System
export const UISystem = (inputDevice) => (dt) => (world) => {
  const drained = inputDevice.drain();

  const prev =
    world.resources.input ?? { keys: new Set(), mouse: { x: 0, y: 0, down: false, clicked: false } };

  const keysAfterDown = Array.from(drained.keyDown).reduce((s, code) => {
    const n = new Set(s);
    n.add(code);
    return n;
  }, prev.keys);

  const keysAfterUp = Array.from(drained.keyUp).reduce((s, code) => {
    const n = new Set(s);
    n.delete(code);
    return n;
  }, keysAfterDown);

  const nextInput = { keys: keysAfterUp, mouse: drained.mouse };

  return {
    world: assoc(world, { resources: assoc(world.resources, { input: nextInput }) }),
    effects: [],
  };
};
