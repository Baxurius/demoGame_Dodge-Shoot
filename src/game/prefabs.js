import { addEntity, addComponent } from "../engine/ecs.js";

export const spawnPlayer = (pos) => (world) => {
  let w, id;
  [w, id] = addEntity(world);

  w = addComponent(w, "Tag", id, { kind: "Player" });
  w = addComponent(w, "Position", id, pos);
  w = addComponent(w, "Velocity", id, { vx: 0, vy: 0 });
  w = addComponent(w, "Sprite", id, { w: 26, h: 26, color: "#7cf29a" });
  w = addComponent(w, "Collider", id, { r: 14 });
  w = addComponent(w, "Health", id, { hp: 5 });

  return w;
};

export const spawnEnemy = (cfg, bounds) => (world) => {
  const side = Math.floor(Math.random() * 4);

  const x =
    side === 0
      ? bounds.minX
      : side === 1
      ? bounds.maxX
      : bounds.minX + Math.random() * (bounds.maxX - bounds.minX);

  const y =
    side === 2
      ? bounds.minY
      : side === 3
      ? bounds.maxY
      : bounds.minY + Math.random() * (bounds.maxY - bounds.minY);

  const elapsed = world.resources.elapsed ?? 0;
  const rampSteps = Math.floor(elapsed / cfg.enemyHpRampEvery);
  const hp = cfg.enemyBaseHp + rampSteps * cfg.enemyHpRampAmount;

  let w, id;
  [w, id] = addEntity(world);

  w = addComponent(w, "Tag", id, { kind: "Enemy" });
  w = addComponent(w, "Position", id, { x, y });
  w = addComponent(w, "Velocity", id, { vx: 0, vy: 0 });
  w = addComponent(w, "Sprite", id, { w: 24, h: 24, color: "#ff6b6b" });
  w = addComponent(w, "Collider", id, { r: 14 });

  w = addComponent(w, "Health", id, { hp, maxHp: hp });

  return w;
};

export const spawnBullet = (cfg, pos, vel) => (world) => {
  let w, id;
  [w, id] = addEntity(world);

  w = addComponent(w, "Tag", id, { kind: "Bullet" });
  w = addComponent(w, "Position", id, pos);
  w = addComponent(w, "Velocity", id, vel);
  w = addComponent(w, "Sprite", id, { w: 8, h: 8, color: "#ffd166" });
  w = addComponent(w, "Collider", id, { r: 5 });
  w = addComponent(w, "Lifetime", id, { t: cfg.bulletLifetime });

  return w;
};
