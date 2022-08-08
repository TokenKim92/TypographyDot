import TextFrame from './textFrame.js';
import Ripple from './ripple.js';
import Dot from './dot.js';
import { collide, posInRect, randomClickInRect, colorToRGB } from './utils.js';
import BaseCanvas from '../lib/baseCanvas.js';

export default class DotKineticText extends BaseCanvas {
  static BASIC_DOT_RADIUS = 10;
  static BASIC_RIPPLE_SPEED = 10;
  static RADIUS = 10;
  static MATCH_MEDIA = window.matchMedia('(max-width: 768px)').matches;
  static BG_COLOR = 'rgba(0, 0, 0)';
  static DOT_COLOR = 'rgb(255, 255, 255)';

  #dotRadius;
  #pixelSize;
  #rippleSpeed;
  #dots = [];
  #pluckCount = 0;
  #maxPluckCount;
  #clickedPos = { x: 0, y: 0 };
  #fontFormat;
  #text;
  #toBeDrawText;
  #textField;
  #isKineticActivated = false;
  #mouse = {
    x: 0,
    y: 0,
    radius: 100,
  };
  #isRandomTextMode = false;

  constructor(fontFormat, text) {
    super();

    this.#dotRadius = DotKineticText.BASIC_DOT_RADIUS;
    this.#pixelSize = this.#dotRadius * 2;
    this.#rippleSpeed = DotKineticText.BASIC_RIPPLE_SPEED;
    this.#fontFormat = fontFormat;
    this.#text = text;

    this.textFrame = new TextFrame(this.#fontFormat, this.#pixelSize, DotKineticText.BG_COLOR); // prettier-ignore
    this.ripple = new Ripple(this.#rippleSpeed);

    this.addEventToCanvas('click', this.onClick);
    document.addEventListener('pointermove', this.onMouseMove);
  }

  destroy() {
    this.removeEventToCanvas('click', this.onClick);
    document.removeEventListener('pointermove', this.onMouseMove);

    super.destroy();
  }

  resize = () => {
    super.resize();

    this.addDotItemOnTextField();
    if (DotKineticText.MATCH_MEDIA) {
      this.onClick({ offsetX: 0, offsetY: 0 });
    } else {
      this.onClick(randomClickInRect(this.#textField));
    }
  };

  animate = (curTime) => {
    if (this.#isKineticActivated) {
      this.clearCanvas();
      this.KineticAnimate(curTime);
    } else {
      this.pluckAnimate();
    }
  };

  pluckAnimate = () => {
    this.ripple.animate();

    let dot, isCollided;
    for (let i = 0; i < this.#dots.length; i++) {
      dot = this.#dots[i];
      isCollided = collide(dot.pos.x, dot.pos.y, this.#clickedPos.x, this.#clickedPos.y, this.ripple.radius); // prettier-ignore
      if (isCollided) {
        dot.pluckAnimate(this.ctx);
      }
    }

    if (this.#pluckCount < this.#maxPluckCount) {
      this.#pluckCount++;
    } else {
      this.#isKineticActivated = true;
    }
  };

  KineticAnimate = (curTime) => {
    let dot;
    let dx, dy, dist, minDist;
    let angle, tx, ty, ax, ay;

    for (let i = 0; i < this.#dots.length; i++) {
      dot = this.#dots[i];
      dx = this.#mouse.x - dot.pos.x;
      dy = this.#mouse.y - dot.pos.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      minDist = DotKineticText.RADIUS + this.#mouse.radius;

      if (dist < minDist) {
        angle = Math.atan2(dy, dx);
        tx = dot.pos.x + Math.cos(angle) * minDist;
        ty = dot.pos.y + Math.sin(angle) * minDist;
        ax = tx - this.#mouse.x;
        ay = ty - this.#mouse.y;

        dot.posVelocity.vx -= ax;
        dot.posVelocity.vy -= ay;
        dot.collide();
      }

      dot.kineticAnimate(this.ctx, curTime);
    }
  };

  onClick = (event) => {
    if (
      DotKineticText.MATCH_MEDIA &&
      posInRect({ x: event.offsetX, y: event.offsetY }, this.#textField)
    ) {
      return;
    }

    for (let i = 0; i < this.#dots.length; i++) {
      this.#dots[i].init();
    }

    this.#pluckCount = 0;
    this.#clickedPos = { x: event.offsetX, y: event.offsetY };
    this.#maxPluckCount = this.ripple.init(
      this.#clickedPos.x,
      this.#clickedPos.y,
      this.#textField
    );

    this.clearCanvas();
    this.textFrame.drawTextFrame(
      this.ctx,
      this.#toBeDrawText,
      this.stageWidth,
      this.stageHeight
    );

    this.#isKineticActivated = false;
  };

  onMouseMove = (event) => {
    this.#mouse.x = event.clientX;
    this.#mouse.y = event.clientY;
  };

  addDotItemOnTextField() {
    this.#dots = [];

    if (this.#isRandomTextMode) {
      const randomText = this.#text.split('');
      this.#toBeDrawText = randomText[Math.round(Math.random() * (randomText.length - 1))]; // prettier-ignore
    } else {
      this.#toBeDrawText = this.#text;
    }

    this.clearCanvas();
    const textData = this.textFrame.drawTextFrame(
      this.ctx,
      this.#toBeDrawText,
      this.stageWidth,
      this.stageHeight
    );

    const dots = textData.dots;
    this.#textField = textData.textField;

    let dot;
    for (let i = 0; i < dots.length; i++) {
      dot = dots[i];

      this.#dots.push(
        new Dot(
          dot,
          this.#dotRadius,
          colorToRGB(DotKineticText.DOT_COLOR),
          colorToRGB(DotKineticText.BG_COLOR)
        )
      );
    }
  }

  set dotRadius(dotRadius) {
    this.#dotRadius = dotRadius;
  }

  set rippleSpeed(rippleSpeed) {
    this.#rippleSpeed = rippleSpeed;
  }

  setRandomTextMode(isRandomTextMode) {
    this.#isRandomTextMode = isRandomTextMode;
  }
}
