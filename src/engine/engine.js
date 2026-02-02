import { nowMs } from "./fp.js";

export const makeEngine = ({ systems, runEffects }) => {
  let running = false;
  let last = nowMs();
  let world = null;

  const step = () => {
    if (!running) return;

    const t = nowMs();
    const dt = (t - last) / 1000;
    last = t;

    const out = systems.reduce(
      ({ world: w, effects }, sys) => {
        const res = sys(dt)(w);
        return { world: res.world, effects: effects.concat(res.effects) };
      },
      { world, effects: [] }
    );

    world = out.world;

    const maybeNewWorld = runEffects(out.effects, world);
    if (maybeNewWorld) world = maybeNewWorld;

    requestAnimationFrame(step);
  };

  return {
    start: (initialWorld) => {
      world = initialWorld;
      running = true;
      last = nowMs();
      requestAnimationFrame(step);
    },
    stop: () => {
      running = false;
    },
  };
};
