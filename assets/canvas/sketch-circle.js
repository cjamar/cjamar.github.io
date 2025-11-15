const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const Tweakpane = require("tweakpane");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

function rgbWave(t, offset = 0) {
  const r = Math.floor(Math.sin(t + offset) * 127 + 128);
  const g = Math.floor(Math.sin(t + offset + 2) * 127 + 128);
  const b = Math.floor(Math.sin(t + offset + 4) * 127 + 128);
  return `rgb(${r}, ${g}, ${b})`;
}

const params = {
  cols: 30,
  rows: 50,
  scaleMin: 1,
  scaleMax: 10,
  freq: -0.002,
  amp: 0.01,
  frame: 0,
  animate: true,
  lineCap: "round",
  background: "#1f1f1f",
  tint: "#424242ff",
  circleColor: "#bbb",
  rgbMode: true,
  speedColor: 0.5,
};

const sketch = () => {
  return ({ context, width, height, frame, time }) => {
    const t = time || frame * 0.01;

    // --- Colores ---
    const bg = params.background;

    // Círculo: RGB animado si está activo el modo, si no color fijo
    const circleColor = params.rgbMode
      ? rgbWave(t * params.speedColor, 0)
      : params.circleColor; // color fijo del círculo cuando rgbMode está off (puedes poner otro)

    // Resto del recuadro: usa siempre el selector tint
    const outerColor = params.tint;

    // Fondo
    context.fillStyle = bg;
    context.fillRect(0, 0, width, height);

    // --- Grid ---
    const cols = params.cols;
    const rows = params.rows;
    const numCells = cols * rows;

    const gridw = width * 0.8;
    const gridh = height * 0.8;
    const cellw = gridw / cols;
    const cellh = gridh / rows;
    const margx = (width - gridw) * 0.5;
    const margy = (height - gridh) * 0.5;

    // --- Círculo central ---
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(gridw, gridh) * 0.3;

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cellw + margx + cellw * 0.5;
      const y = row * cellh + margy + cellh * 0.5;
      const w = cellw * 0.6;

      const f = params.animate ? frame : params.frame;
      const n = random.noise3D(x, y, f * 10, params.freq);
      const angle = n * Math.PI * params.amp;
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax);

      // Distancia al centro
      const dist = Math.hypot(x - cx, y - cy);
      const color = dist < r ? circleColor : outerColor;

      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.lineWidth = scale;
      context.lineCap = params.lineCap;
      context.beginPath();
      context.moveTo(-w * 0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.strokeStyle = color;
      context.stroke();
      context.restore();
    }
  };
};

function fireGradient(t) {
  // t va de 0 (abajo) a 1 (arriba)
  const r = Math.min(255, 255 * t + 100);
  const g = Math.min(255, 200 * t);
  const b = Math.max(0, 50 * (1 - t));
  return `rgb(${r},${g},${b})`;
}

const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: "Grid" });
  folder.addInput(params, "lineCap", {
    options: { butt: "butt", round: "round", square: "square" },
  });
  folder.addInput(params, "cols", { min: 2, max: 50, step: 1 });
  folder.addInput(params, "rows", { min: 2, max: 50, step: 1 });
  folder.addInput(params, "scaleMin", { min: 1, max: 100 });
  folder.addInput(params, "scaleMax", { min: 1, max: 100 });

  folder = pane.addFolder({ title: "Noise" });
  folder.addInput(params, "freq", { min: -0.01, max: 0.01 });
  folder.addInput(params, "amp", { min: 0, max: 1 });
  folder.addInput(params, "animate");
  folder.addInput(params, "frame", { min: 0, max: 999 });

  folder = pane.addFolder({ title: "Color" });
  folder.addInput(params, "background");
  folder.addInput(params, "tint");
  folder.addInput(params, "circleColor");
  folder.addInput(params, "rgbMode");
  folder.addInput(params, "speedColor", { min: 0, max: 3, step: 0.1 });
};

createPane();
canvasSketch(sketch, settings);
