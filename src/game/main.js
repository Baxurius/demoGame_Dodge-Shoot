import { createWorld } from "../engine/ecs.js";
import { effect } from "../engine/fp.js";
import { makeEngine } from "../engine/engine.js";
import { makeInput, UISystem } from "../engine/input.js";
import { makeRenderer, RenderingSystem } from "../engine/render.js";

import { config, makeBounds } from "./config.js";
import { spawnPlayer } from "./prefabs.js";
import {
  RestartSystem,
  PlayerControlSystem,
  PhysicsSystem,
  EnemyAISystem,
  SpawnerSystem,
  CollisionSystem,
  LifetimeSystem,
  TimeSystem,
} from "./systems.js";

const canvas = document.getElementById("c");
const bounds = makeBounds(canvas);

const inputDevice = makeInput(canvas);
const renderer = makeRenderer(canvas);

const makeInitialWorld = () => {
  let w = createWorld({
    input: { keys: new Set(), mouse: { x: 0, y: 0, down: false, clicked: false } },
    score: 0,
    cooldown: 0,
    spawnTimer: 0,
    elapsed: 0,
    gameOver: false,
    resetRequested: false,
  });

  w = spawnPlayer({ x: canvas.width / 2, y: canvas.height / 2 })(w);
  return w;
};

const ApplyResetSystem = (makeWorld) => (dt) => (world) => {
  if (world.resources.resetRequested) {
    return { world: makeWorld(), effects: [] };
  }
  return { world, effects: [] };
};

const systems = [
  UISystem(inputDevice),
  RestartSystem(),
  ApplyResetSystem(makeInitialWorld),
  TimeSystem ? TimeSystem() : (dt) => (w) => ({ world: w, effects: [] }),
  PlayerControlSystem(config),
  EnemyAISystem(config),
  SpawnerSystem(config, bounds),
  PhysicsSystem(bounds),
  CollisionSystem(config),
  LifetimeSystem(),
  RenderingSystem(renderer, effect),
];

const runEffects = (effects) => {
  effects.forEach((e) => {
    if (e.type === "render") renderer.draw(e.payload.world);
  });
};

const engine = makeEngine({ systems, runEffects });
engine.start(makeInitialWorld());
