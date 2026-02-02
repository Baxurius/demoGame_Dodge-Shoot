export const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

export const clamp = (min, max, v) => Math.max(min, Math.min(max, v));
export const nowMs = () => performance.now();

export const assoc = (obj, patch) => ({ ...obj, ...patch });

export const mapSet = (m, k, v) => {
  const n = new Map(m);
  n.set(k, v);
  return n;
};

export const mapDel = (m, k) => {
  const n = new Map(m);
  n.delete(k);
  return n;
};

export const effect = (type, payload) => ({ type, payload });
