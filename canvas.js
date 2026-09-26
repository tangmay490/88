class DrawingApp {
  constructor(baseCanvas, previewCanvas, history, getState) {
    this.base = baseCanvas;
    this.preview = previewCanvas;
    this.baseCtx = baseCanvas.getContext('2d');
    this.previewCtx = previewCanvas.getContext('2d');
    this.history = history;
    this.getState = getState;

    this.isDrawing = false;
    this.startPt = null;

    this._resize();
    window.addEventListener('resize', () => this._resize());

    this.base.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    window.addEventListener('pointermove', (e) => this._onPointerMove(e));
    window.addEventListener('pointerup', (e) => this._onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this._onPointerUp(e));
  }

  _resize() {
    const rect = this.base.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const newW = Math.max(1, Math.round(rect.width * ratio));
    const newH = Math.max(1, Math.round(rect.height * ratio));

    [this.base, this.preview].forEach((canvas) => {
      if (canvas.width === newW && canvas.height === newH) return;
      const prev = document.createElement('canvas');
      prev.width = canvas.width;
      prev.height = canvas.height;
      if (canvas.width > 0 && canvas.height > 0) {
        prev.getContext('2d').drawImage(canvas, 0, 0);
      }
      canvas.width = newW;
      canvas.height = newH;
      if (prev.width > 0 && prev.height > 0) {
        canvas.getContext('2d').drawImage(prev, 0, 0, newW, newH);
      }
    });
  }

  _getPoint(evt) {
    const rect = this.base.getBoundingClientRect();
    const scaleX = this.base.width / rect.width;
    const scaleY = this.base.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  }

  _onPointerDown(evt) {
    evt.preventDefault();
    this.base.setPointerCapture?.(evt.pointerId);
    const tool = TOOLS[this.getState().tool];
    const pt = this._getPoint(evt);

    this.isDrawing = true;
    this.startPt = pt;
    this.history.snapshot();

    if (tool.live) {
      tool.onStart(this.baseCtx, pt, this.getState());
    }
  }

  _onPointerMove(evt) {
    if (!this.isDrawing) return;
    const tool = TOOLS[this.getState().tool];
    const pt = this._getPoint(evt);

    if (tool.live) {
      tool.onMove(this.baseCtx, pt, this.getState());
    } else {
      tool.onPreview(this.previewCtx, this.startPt, pt, this.getState());
    }
  }

  _onPointerUp(evt) {
    if (!this.isDrawing) return;
    const tool = TOOLS[this.getState().tool];
    const pt = this._getPoint(evt);

    if (!tool.live) {
      tool.onCommit(this.baseCtx, this.startPt, pt, this.getState());
      this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
    } else if (tool.onEnd) {
      tool.onEnd(this.baseCtx, this.getState());
    }

    this.isDrawing = false;
    this.startPt = null;
  }

  clear() {
    this.history.snapshot();
    this.baseCtx.clearRect(0, 0, this.base.width, this.base.height);
  }

  async saveAsPNG(filename = 'my-drawing.png') {
    const blob = await new Promise((resolve) => this.base.toBlob(resolve, 'image/png'));

    if (window.claude && typeof window.claude.use === 'function') {
      try {
        const downloads = await window.claude.use('downloads');
        if (downloads) {
          await downloads.save({ filename, data: blob });
          return;
        }
      } catch (err) {
        // ตกลงไปใช้วิธีดาวน์โหลดแบบมาตรฐานด้านล่างแทน
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}
