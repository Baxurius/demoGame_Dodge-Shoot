import { clamp } from "./fp.js";


export const makeRenderer = (canvas) => {
  const ctx = canvas.getContext("2d");

  const draw = (world) => {
    const W = canvas.width,
      H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const score = world.resources.score ?? 0;

    // HP player
    const pid = Array.from(world.components.Tag.entries()).find(([, t]) => t.kind === "Player")?.[0] ?? null;
    const hp = pid ? (world.components.Health.get(pid)?.hp ?? 0) : 0;

    ctx.save();
    ctx.fillStyle = "#e7eef7";
    ctx.font = "16px system-ui";
    ctx.fillText(`Score: ${score}`, 14, 22);
    ctx.fillText(`HP: ${hp}`, 14, 42);
    ctx.restore();

    Array.from(world.entities)
      .filter((id) => world.components.Position.has(id) && world.components.Sprite.has(id))
      .forEach((id) => {
        const p = world.components.Position.get(id);
        const s = world.components.Sprite.get(id);
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.fillRect(p.x - s.w / 2, p.y - s.h / 2, s.w, s.h);
        ctx.restore();
      });

      // Enemy HP
    Array.from(world.components.Tag.entries())
      .filter(([, t]) => t.kind === "Enemy") 
      .map(([id]) => id)
      .forEach((id) => {
        const p = world.components.Position.get(id);
        const s = world.components.Sprite.get(id);
        const h = world.components.Health.get(id);
        if (!p || !s || !h) return;

        const maxHp = h.maxHp ?? h.hp ?? 1;
        const ratio = clamp(0, 1, (h.hp ?? 0) / Math.max(1, maxHp));

        const barW = s.w;
        const barH = 5;
        const x = p.x - barW / 2;
        const y = p.y - s.h / 2 - 10;

        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(x, y, barW, barH);

        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillRect(x, y, barW * ratio, barH);

        ctx.restore();
      });

    if (world.resources.gameOver) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 44px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", W / 2, H / 2 - 10);
      ctx.font = "18px system-ui";
      ctx.fillText("Pritisni R ili klikni za restart", W / 2, H / 2 + 28);
      ctx.restore();
    }
  };

  return { draw };
};

export const RenderingSystem = (renderer, effectFactory) => (dt) => (world) => ({
  world,
  effects: [effectFactory("render", { world })],
});
