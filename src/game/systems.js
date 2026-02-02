import { assoc, clamp } from "../engine/fp.js";
import { addComponent, get, entitiesWith, firstEntityWithTag, removeEntity, tagIds } from "../engine/ecs.js";
import { spawnBullet, spawnEnemy } from "./prefabs.js";

export const TimeSystem = () => (dt) => (world) => {
  if (world.resources.gameOver) return { world, effects: [] };
  const elapsed = (world.resources.elapsed ?? 0) + dt;
  return { world: assoc(world, { resources: assoc(world.resources, { elapsed }) }), effects: [] };
};

export const RestartSystem = () => (dt) => (world) => {
  const input = world.resources.input;
  if (!world.resources.gameOver || !input) return { world, effects: [] };

  const wantRestart = input.keys.has("KeyR") || input.mouse.clicked;
  if (!wantRestart) return { world, effects: [] };

  const nextResources = assoc(world.resources, { resetRequested: true });
  return { world: assoc(world, { resources: nextResources }), effects: [] };
};

// Player control
export const PlayerControlSystem = (cfg) => (dt) => (world) => {
  if (world.resources.gameOver) return { world, effects: [] };

  const input = world.resources.input;
  if (!input) return { world, effects: [] };

  const pid = firstEntityWithTag(world, "Player");
  if (!pid) return { world, effects: [] };

  const keys = input.keys;
  const speed = cfg.playerSpeed;

  const dir = {
    x: (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0),
    y: (keys.has("ArrowDown")  || keys.has("KeyS") ? 1 : 0) - (keys.has("ArrowUp")   || keys.has("KeyW") ? 1 : 0),
  };

  const len = Math.hypot(dir.x, dir.y) || 1;
  let w = addComponent(world, "Velocity", pid, { vx: (dir.x / len) * speed, vy: (dir.y / len) * speed });

  const wantShoot = keys.has("Space") || input.mouse.clicked;
  const canShoot = (w.resources.cooldown ?? 0) <= 0;

  if (wantShoot && canShoot) {
    const ppos = get(w, "Position", pid);
    const mx = input.mouse.x, my = input.mouse.y;
    const dx = mx - ppos.x, dy = my - ppos.y;
    const dlen = Math.hypot(dx, dy) || 1;

    w = spawnBullet(cfg, { x: ppos.x, y: ppos.y }, { vx: (dx/dlen)*cfg.bulletSpeed, vy: (dy/dlen)*cfg.bulletSpeed })(w);
    w = assoc(w, { resources: assoc(w.resources, { cooldown: cfg.shootCooldown }) });
  }

  const cd = w.resources.cooldown ?? 0;
  if (cd > 0) w = assoc(w, { resources: assoc(w.resources, { cooldown: Math.max(0, cd - dt) }) });

  return { world: w, effects: [] };
};

// Physics
export const PhysicsSystem = (bounds) => (dt) => (world) => {
  if (world.resources.gameOver) return { world, effects: [] };

  const ids = entitiesWith(world, "Position", "Velocity");
  const w2 = ids.reduce((w, id) => {
    const p = get(w, "Position", id);
    const v = get(w, "Velocity", id);
    const nx = clamp(bounds.minX, bounds.maxX, p.x + v.vx * dt);
    const ny = clamp(bounds.minY, bounds.maxY, p.y + v.vy * dt);
    return addComponent(w, "Position", id, { x: nx, y: ny });
  }, world);

  return { world: w2, effects: [] };
};

// Enemy AI
export const EnemyAISystem = (cfg) => (dt) => (world) => {
  if (world.resources.gameOver) return { world, effects: [] };

  const pid = firstEntityWithTag(world, "Player");
  if (!pid) return { world, effects: [] };

  const pp = get(world, "Position", pid);
  const enemies = tagIds(world, "Enemy");

  const w2 = enemies.reduce((w, id) => {
    const ep = get(w, "Position", id);
    if (!ep) return w;
    const dx = pp.x - ep.x, dy = pp.y - ep.y;
    const len = Math.hypot(dx, dy) || 1;
    return addComponent(w, "Velocity", id, { vx: (dx/len)*cfg.enemySpeed, vy: (dy/len)*cfg.enemySpeed });
  }, world);

  return { world: w2, effects: [] };
};

// Spawner
export const SpawnerSystem = (cfg, bounds) => (dt) => (world) => {
  if (world.resources.gameOver) return { world, effects: [] };

  const t = (world.resources.spawnTimer ?? 0) - dt;
  if (t > 0) return { world: assoc(world, { resources: assoc(world.resources, { spawnTimer: t }) }), effects: [] };

  let w = spawnEnemy(cfg, bounds)(world);
  w = assoc(w, { resources: assoc(w.resources, { spawnTimer: cfg.spawnEvery }) });
  return { world: w, effects: [] };
};

// Collisions
export const CollisionSystem = (cfg) => (dt) => (world) => {
  if (world.resources.gameOver) return { world, effects: [] };

  const pid = firstEntityWithTag(world, "Player");
  if (!pid) return { world, effects: [] };

  let w = world;

  const pr = get(w, "Collider", pid)?.r ?? 14;
  const pp = get(w, "Position", pid);
  if (!pp) return { world: w, effects: [] };

  const bullets = tagIds(w, "Bullet");
  const enemies0 = tagIds(w, "Enemy");

  const hits = bullets.flatMap((bid) => {
    const bp = get(w, "Position", bid);
    const br = get(w, "Collider", bid)?.r ?? 4;
    if (!bp) return [];

    return enemies0
      .map((eid) => {
        const ep = get(w, "Position", eid);
        const er = get(w, "Collider", eid)?.r ?? 14;
        if (!ep) return null;
        const d = Math.hypot(bp.x - ep.x, bp.y - ep.y);
        return d <= (br + er) ? { bid, eid } : null;
      })
      .filter(Boolean);
  });

  w = hits.reduce((acc, { bid, eid }) => {
    let ww = acc;

    if (ww.entities.has(bid)) ww = removeEntity(ww, bid);

    if (!ww.entities.has(eid)) return ww;

    const h0 = get(ww, "Health", eid) ?? { hp: 1, maxHp: 1 };
    const hp1 = (h0.hp ?? 1) - (cfg.bulletDamage ?? 1);

    if (hp1 <= 0) {
      ww = removeEntity(ww, eid);
      const score = (ww.resources.score ?? 0) + 10;
      ww = assoc(ww, { resources: assoc(ww.resources, { score }) });
      return ww;
    }

    return addComponent(ww, "Health", eid, { ...h0, hp: hp1 });
  }, w);

  const enemies = tagIds(w, "Enemy");

  const touchingEnemies = enemies.filter((eid) => {
    const ep = get(w, "Position", eid);
    const er = get(w, "Collider", eid)?.r ?? 14;
    if (!ep) return false;
    return Math.hypot(pp.x - ep.x, pp.y - ep.y) <= (pr + er);
  });

  if (touchingEnemies.length > 0) {
    w = touchingEnemies.reduce((acc, eid) => removeEntity(acc, eid), w);

    const pH0 = get(w, "Health", pid) ?? { hp: 0, maxHp: 5 };
    const dmg = touchingEnemies.length;
    const hp1 = Math.max(0, (pH0.hp ?? 0) - dmg);

    w = addComponent(w, "Health", pid, { ...pH0, hp: hp1 });

    if (hp1 <= 0) {
      w = assoc(w, { resources: assoc(w.resources, { gameOver: true }) });
    }
  }

  return { world: w, effects: [] };
};



// (6) Lifetime
export const LifetimeSystem = () => (dt) => (world) => {
  if (world.resources.gameOver) return { world, effects: [] };

  const ids = entitiesWith(world, "Lifetime");
  const w2 = ids.reduce((w, id) => {
    const lt = get(w, "Lifetime", id);
    const next = lt.t - dt;
    return next <= 0 ? removeEntity(w, id) : addComponent(w, "Lifetime", id, { t: next });
  }, world);

  return { world: w2, effects: [] };
};
