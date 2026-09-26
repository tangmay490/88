class History {
  constructor(canvas, maxSteps = 30) {
    this.canvas = canvas;
    this.maxSteps = maxSteps;
    this.undoStack = [];
    this.redoStack = [];
  }

  snapshot() {
    this.undoStack.push(this.canvas.toDataURL());
    if (this.undoStack.length > this.maxSteps) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }

  undo(onDone) {
    if (!this.canUndo()) return;
    this.redoStack.push(this.canvas.toDataURL());
    const prev = this.undoStack.pop();
    this._restore(prev, onDone);
  }

  redo(onDone) {
    if (!this.canRedo()) return;
    this.undoStack.push(this.canvas.toDataURL());
    const next = this.redoStack.pop();
    this._restore(next, onDone);
  }

  _restore(dataUrl, onDone) {
    const img = new Image();
    img.onload = () => {
      const ctx = this.canvas.getContext('2d');
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
      if (onDone) onDone();
    };
    img.src = dataUrl;
  }
}
