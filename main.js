document.addEventListener('DOMContentLoaded', () => {
  const baseCanvas = document.getElementById('baseCanvas');
  const previewCanvas = document.getElementById('previewCanvas');
  const colorPicker = document.getElementById('colorPicker');
  const sizeSlider = document.getElementById('sizeSlider');
  const sizeValue = document.getElementById('sizeValue');
  const swatchesEl = document.getElementById('swatches');
  const toolButtons = document.querySelectorAll('.tool-btn');

  const state = {
    tool: 'pen',
    color: colorPicker.value,
    size: Number(sizeSlider.value),
  };
  const getState = () => state;

  const history = new History(baseCanvas);
  const app = new DrawingApp(baseCanvas, previewCanvas, history, getState);

  app.baseCtx.fillStyle = '#ffffff';
  app.baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

  toolButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      toolButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.tool = btn.dataset.tool;
    });
  });

  colorPicker.addEventListener('input', (e) => { state.color = e.target.value; });

  const swatchColors = [
    '#000000', '#2b2a28', '#5c5c5c', '#8f8a7c', '#c9c2b0', '#ffffff',
    '#7a3b12', '#b5651d', '#c1502e', '#e2725b', '#d8a63a', '#f2c14e',
    '#1f4d3a', '#2f6f4e', '#6b8f71', '#8bc34a', '#c6e377', '#e8f5b0',
    '#12324d', '#1b3654', '#3e5c76', '#4fa3d1', '#7fd1e0', '#bfe9f0',
    '#3a1f5c', '#6c5ce7', '#8e7cc3', '#b39ddb', '#e91e63', '#f48fb1',
  ];
  const swatchButtons = [];
  swatchColors.forEach((hex) => {
    const dot = document.createElement('button');
    dot.className = 'swatch';
    dot.style.background = hex;
    dot.title = hex;
    dot.addEventListener('click', () => {
      state.color = hex;
      colorPicker.value = hex;
      swatchButtons.forEach((b) => b.classList.remove('selected'));
      dot.classList.add('selected');
    });
    swatchesEl.appendChild(dot);
    swatchButtons.push(dot);
  });

  const mixA = document.getElementById('mixA');
  const mixB = document.getElementById('mixB');
  const mixRatio = document.getElementById('mixRatio');
  const mixPreview = document.getElementById('mixPreview');
  const useMixBtn = document.getElementById('useMixBtn');

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  }
  function mixColors(hexA, hexB, tPercent) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const t = tPercent / 100;
    return rgbToHex({
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t,
    });
  }
  function updateMixPreview() {
    mixPreview.style.background = mixColors(mixA.value, mixB.value, Number(mixRatio.value));
  }
  [mixA, mixB, mixRatio].forEach((el) => el.addEventListener('input', updateMixPreview));
  updateMixPreview();

  useMixBtn.addEventListener('click', () => {
    const mixed = mixColors(mixA.value, mixB.value, Number(mixRatio.value));
    state.color = mixed;
    colorPicker.value = mixed;
    swatchButtons.forEach((b) => b.classList.remove('selected'));
  });

  sizeSlider.addEventListener('input', (e) => {
    state.size = Number(e.target.value);
    sizeValue.textContent = state.size;
  });

  document.getElementById('undoBtn').addEventListener('click', () => history.undo());
  document.getElementById('redoBtn').addEventListener('click', () => history.redo());
  document.getElementById('clearBtn').addEventListener('click', () => {
    app.clear();
    app.baseCtx.fillStyle = '#ffffff';
    app.baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
  });
  document.getElementById('saveBtn').addEventListener('click', () => app.saveAsPNG());

  const keyToTool = {
    p: 'pen', n: 'pencil', b: 'brush', m: 'marker', g: 'magic',
    e: 'eraser', l: 'line', r: 'rect', o: 'ellipse',
  };
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'z') { e.preventDefault(); history.undo(); }
      if (e.key.toLowerCase() === 'y') { e.preventDefault(); history.redo(); }
      return;
    }
    const tool = keyToTool[e.key.toLowerCase()];
    if (tool) {
      state.tool = tool;
      toolButtons.forEach((b) => b.classList.toggle('active', b.dataset.tool === tool));
    }
  });
});
