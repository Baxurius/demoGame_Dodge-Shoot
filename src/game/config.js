export const makeBounds = (canvas) => ({
  minX: 18,
  minY: 70,
  maxX: canvas.width - 18,
  maxY: canvas.height - 18,
});

export const config = {
  playerSpeed: 260,
  enemySpeed: 120,
  spawnEvery: 1.05,
  bulletSpeed: 520,
  bulletLifetime: 0.95,
  shootCooldown: 0.18,
  playerDamagePerTouch: 1,

  enemyBaseHp: 1,
  enemyHpRampEvery: 12,
  enemyHpRampAmount: 1,
  bulletDamage: 1,
};