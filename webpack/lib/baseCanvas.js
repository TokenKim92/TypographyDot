export default class BaseCanvas {
  static INIT_MODE = -1;
  static SMALL_MODE = 0;
  static REGULAR_MODE = 1;
  static MEDIUM_MODE = 2;
  static LARGE_MODE = 3;

  #canvas;
  #ctx;
  #stageWidth;
  #stageHeight;
  #isFull;
  #isOnStage;

  constructor(isFull = false) {
    this.#canvas = document.createElement('canvas');
    this.#canvas.style.position = 'absolute';
    this.#ctx = this.#canvas.getContext('2d');
    document.body.append(this.#canvas);

    this.#isFull = isFull;
    if (this.#isFull) {
      this.#canvas.style.width = '100%';
      this.#canvas.style.height = '100%';
    }
  }

  resize(width = 0, height = 0) {
    this.#stageWidth = width === 0 ? document.body.clientWidth : width;
    this.#stageHeight = height === 0 ? document.body.clientHeight : height;

    this.#canvas.width = this.#stageWidth;
    this.#canvas.height = this.#stageHeight;
  }

  clearCanvas() {
    this.#ctx.clearRect(0, 0, this.#stageWidth, this.#stageHeight);
  }

  clearRect(x, y, w, h) {
    this.#ctx.clearRect(x, y, w, h);
  }

  addEventToCanvas(type, listener) {
    this.#canvas.addEventListener(type, listener);
  }

  removeEventFromCanvas(type, listener) {
    this.#canvas.removeEventListener(type, listener);
  }

  bringToStage() {
    this.#isOnStage = true;
    document.body.append(this.#canvas);
  }

  removeFromStage() {
    this.#isOnStage = false;
    this.clearCanvas();
    document.body.removeChild(this.#canvas);
  }

  setPosition(x, y) {
    if (this.#isFull) {
      throw new Error('Positioning is not possible in full screen mode.');
    }

    this.#canvas.style.left = `${x}px`;
    this.#canvas.style.top = `${y}px`;
  }

  hide(millisecond = 0, mode = 'ease') {
    if (!millisecond) {
      this.#canvas.style.opacity = '0';
      return;
    }

    setTimeout(() => {
      this.#canvas.style.opacity = '0';
      this.#canvas.style.transition = `opacity ${millisecond}ms  ${mode}`;
      setTimeout(() => (this.#canvas.style.transition = ''), millisecond);
    }, millisecond);
  }

  show(millisecond = 0, mode = 'ease') {
    if (!millisecond) {
      this.#canvas.style.opacity = '1';
      return;
    }

    setTimeout(() => {
      this.#canvas.style.opacity = '1';
      this.#canvas.style.transition = `opacity ${millisecond}ms  ${mode}`;
      setTimeout(() => (this.#canvas.style.transition = ''), millisecond);
    }, millisecond);
  }

  get stageWidth() {
    return this.#stageWidth;
  }

  get stageHeight() {
    return this.#stageHeight;
  }

  get ctx() {
    return this.#ctx;
  }

  get isMatchMedia() {
    return this.sizeMode === BaseCanvas.SMALL_MODE;
  }

  get isHeighResolution() {
    return this.sizeMode === BaseCanvas.LARGE_MODE;
  }

  get sizeMode() {
    const canvasSizeModes = [
      { mode: BaseCanvas.SMALL_MODE, size: 768 },
      { mode: BaseCanvas.REGULAR_MODE, size: 1374 },
      { mode: BaseCanvas.MEDIUM_MODE, size: 1980 },
      { mode: BaseCanvas.LARGE_MODE, size: 3840 },
    ];

    const sizeModeIndex = 
      canvasSizeModes
        .filter((sizeMode) => !window.matchMedia(`(max-width: ${sizeMode.size}px)`).matches)
        .length; // prettier-ignore

    return canvasSizeModes[sizeModeIndex].mode;
  }

  set backgroundColor(color) {
    this.#canvas.style.background = color;
  }

  set borderRadius(pixel) {
    this.#canvas.style.borderRadius = `${pixel}px`;
  }

  get isOnStage() {
    return this.#isOnStage;
  }
}
