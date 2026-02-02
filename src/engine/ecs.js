import { assoc, mapSet, mapDel } from "./fp.js";

export const createWorld = (resources = {}) => ({
  nextId: 1,
  entities: new Set(),
  components: {
    Position: new Map(),
    Velocity: new Map(),
    Sprite: new Map(),
    Collider: new Map(),
    Health: new Map(),
    Lifetime: new Map(),
    Tag: new Map(),
  },
  resources,
});

export const addEntity = (world) => {
  const id = world.nextId;
  const entities = new Set(world.entities);
  entities.add(id);
  return [{ ...world, nextId: id + 1, entities }, id];
};

export const removeEntity = (world, id) => {
  const entities = new Set(world.entities);
  entities.delete(id);

  const components = Object.entries(world.components).reduce((acc, [name, cmap]) => {
    acc[name] = mapDel(cmap, id);
    return acc;
  }, {});

  return { ...world, entities, components };
};

export const addComponent = (world, type, id, data) => ({
  ...world,
  components: assoc(world.components, { [type]: mapSet(world.components[type], id, data) }),
});

export const updateComponent = (world, type, id, fn) => {
  const cmap = world.components[type];
  const curr = cmap.get(id);
  if (!curr) return world;
  return addComponent(world, type, id, fn(curr));
};

export const get = (world, type, id) => world.components[type].get(id);

export const entitiesWith = (world, ...types) =>
  Array.from(world.entities).filter((id) => types.every((t) => world.components[t].has(id)));

export const tagIds = (world, kind) =>
  Array.from(world.components.Tag.entries())
    .filter(([, t]) => t.kind === kind)
    .map(([id]) => id);

export const firstEntityWithTag = (world, kind) =>
  Array.from(world.components.Tag.entries()).find(([, t]) => t.kind === kind)?.[0] ?? null;
