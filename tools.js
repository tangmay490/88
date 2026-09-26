const TOOLS = {
  pen: {
    live: true,
    onStart(ctx, pt, opts) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    },
    onMove(ctx, pt) {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    },
  },

  pencil: {
    live: true,
    onStart(ctx, pt, opts) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = Math.max(1, opts.size * 0.4);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    },
    onMove(ctx, pt) {
      const jitter = (Math.random() - 0.5) * 0.6;
      ctx.lineWidth = Math.max(0.6, ctx.lineWidth + jitter);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    },
    onEnd(ctx) { ctx.globalAlpha = 1; },
  },

  brush: {
    live: true,
    onStart(ctx, pt, opts) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = opts.color;
      ctx.shadowColor = opts.color;
      ctx.shadowBlur = opts.size * 0.5;
      ctx.lineWidth = opts.size * 1.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    },
    onMove(ctx, pt) {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    },
    onEnd(ctx) { ctx.globalAlpha = 1; ctx.shadowBlur = 0; },
  },

  marker: {
    live: true,
    onStart(ctx, pt, opts) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.size * 1.6;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    },
    onMove(ctx, pt) {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    },
    onEnd(ctx) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; },
  },

  magic: {
    live: true,
    onStart(ctx, pt, opts) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(2, opts.size);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      this._hue = this._hue ?? Math.random() * 360;
      this._last = pt;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    },
    onMove(ctx, pt, opts) {
      this._hue = (this._hue + 6) % 360;
      const color = `hsl(${this._hue}, 90%, 60%)`;
      ctx.strokeStyle = color;
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      if (Math.random() < 0.35) {
        drawSparkle(ctx, pt, Math.max(4, opts.size * 0.8));
      }
      this._last = pt;
    },
  },

  eraser: {
    live: true,
    onStart(ctx, pt, opts) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(opts.size, 10);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    },
    onMove(ctx, pt) {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    },
  },

  line: {
    live: false,
    onPreview(ctx, start, current, opts) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    },
    onCommit(ctx, start, current, opts) {
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    },
  },

  rect: {
    live: false,
    onPreview(ctx, start, current, opts) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.size;
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      ctx.strokeRect(x, y, Math.abs(current.x - start.x), Math.abs(current.y - start.y));
    },
    onCommit(ctx, start, current, opts) {
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.size;
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      ctx.strokeRect(x, y, Math.abs(current.x - start.x), Math.abs(current.y - start.y));
    },
  },

  ellipse: {
    live: false,
    onPreview(ctx, start, current, opts) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawEllipse(ctx, start, current, opts);
    },
    onCommit(ctx, start, current, opts) {
      drawEllipse(ctx, start, current, opts);
    },
  },
};

function drawSparkle(ctx, pt, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(pt.x, pt.y - size);
  ctx.lineTo(pt.x + size * 0.25, pt.y - size * 0.25);
  ctx.lineTo(pt.x + size, pt.y);
  ctx.lineTo(pt.x + size * 0.25, pt.y + size * 0.25);
  ctx.lineTo(pt.x, pt.y + size);
  ctx.lineTo(pt.x - size * 0.25, pt.y + size * 0.25);
  ctx.lineTo(pt.x - size, pt.y);
  ctx.lineTo(pt.x - size * 0.25, pt.y - size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEllipse(ctx, start, current, opts) {
  const cx = (start.x + current.x) / 2;
  const cy = (start.y + current.y) / 2;
  const rx = Math.abs(current.x - start.x) / 2;
  const ry = Math.abs(current.y - start.y) / 2;
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = opts.size;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
}
