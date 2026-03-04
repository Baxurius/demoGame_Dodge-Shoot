# 🎮 FP ECS Engine (JavaScript) — Demo igra: **Dodge & Shoot**

Mali *functional-programming* (FP) **Entity–Component–System** (ECS) engine u čistom JavaScript-u + demo igra u kojoj se krećeš, izbegavaš neprijatelje i pucaš.

✅ Bez build alata / frameworka  
✅ ES Modules (`type="module"`)  
✅ Jednostavan ECS + sistem-pipeline + render “effects”

---

## ✨ Šta ima u projektu

### 🧱 Engine (`src/engine/`)
- **ECS**: `createWorld`, `addEntity`, `addComponent`, `entitiesWith`, tagovi, itd.
- **Engine loop**: `makeEngine` (systems pipeline + requestAnimationFrame)
- **Input**: tastatura + miš (WASD/strelice + click)
- **Render**: canvas renderer + render sistem koji emituje “effect”
- **FP helpers**: mali immutable helperi (`fp.js`)

### 🕹️ Game (`src/game/`)
- **Config**: osnovne konstante (brzine, cooldown, spawn, itd.)
- **Prefabs**: spawn player/enemy/projectile
- **Systems**: kretanje, AI, spawn, kolizije, lifetime, restart, score/time
- **Main**: spaja sve i startuje engine

---

## 🎮 Kontrole (u demo igri)

- Kretanje: **WASD** ili **strelice**
- Pucanje: **Space** ili **Left Click**
- Ciljanje: **mišem**
- Restart (ako postoji): obično **R** (zavisi od implementacije `RestartSystem`)

---

## ▶️ Kako da pokreneš

Pošto se koriste ES Modules, najbolje je da pokreneš lokalni server (ne otvaraj samo `index.html` “double click” jer browser često blokira module preko `file://`).

### Opcija A — PHP built-in server
```bash
php -S localhost:8000
```

Otvori u browser-u:
- `http://localhost:8000/index.html`

### Opcija B — Python (ako imaš)
```bash
python -m http.server 8000
```

Otvori:
- `http://localhost:8000/index.html`

---

## 📁 Struktura projekta

```
.
├─ index.html
└─ src/
   ├─ engine/
   │  ├─ ecs.js
   │  ├─ engine.js
   │  ├─ fp.js
   │  ├─ input.js
   │  └─ render.js
   └─ game/
      ├─ config.js
      ├─ main.js
      ├─ prefabs.js
      └─ systems.js
```

---

## 🧠 Kratko objašnjenje ECS pristupa

- **Entity** = samo ID (broj)
- **Component** = podaci mapirani po entity ID-u (npr. Position, Velocity, Health…)
- **System** = čista funkcija koja dobija `(dt) => (world) => ({ world, effects })`

Primer (skraćeno) kako radi pipeline:
1. Engine računa `dt`
2. Poziva sisteme redom
3. Sistemi vraćaju novi `world` + listu `effects`
4. `runEffects` izvršava efekte (npr. render)

---

## 🛠️ Kako da dodaš novu komponentu/sistem

### 1) Dodaj komponentu
U `src/engine/ecs.js` možeš proširiti `components` mapu (npr. `Damage`, `Ammo`, itd.)

### 2) Napravi sistem
U `src/game/systems.js` dodaj funkciju tipa:
```js
export const MySystem = (cfg) => (dt) => (world) => {
  // izmeni world
  return { world, effects: [] };
};
```

### 3) Ubaci sistem u pipeline
U `src/game/main.js` dodaj sistem u `systems` niz (redosled je bitan).

---

## 🚀 Ideje za unapređenje

- UI overlay (HP bar, score panel)
- Paginacija/leveli, difficulty scaling
- Sprite sheet / animacije
- Audio (shoot/hit/death)
- Objekt pool (perf za projectiles)
- Unit testovi za FP helper funkcije

---

## 📜 Licenca

Slobodno koristi/menjaj za učenje i studentske projekte.
