/* eslint no-var: 0 */
/* eslint vars-on-top: 0 */
/* eslint prefer-const: 0 */
/* eslint arrow-parens: 0 */

// TODO: start Pomodoro on clockface click or Enter press;
// TODO: reset Pomodoro on double click or Delete (Backspace);
// TODO: visualize chosen interval by printing its length on the clockface;
// TODO: visualize movements of the controller handler by adjusting interval length;
// TODO: show notification on timer ending;

var UI = {
  listen() {
    // these are the defaults
    this.options = {
      max: 360, // maximum value
      min: 0, // minimum value
      step: 6, // [min, min+step, ..., max]
      name: 'clock-controller', // used for <input name>
    };
    this.newAngle = 300;

    this.controller = document.querySelector('#clockController');
    this.angle = AngleInput(this.controller, this.options);
    this.angle(this.newAngle); // set

    // fired for only definitive value changes
    this.controller.onchange = () => {
      // elem.removeEventListener() also work.
      console.log(`controller onchange: angle=${this.angle()}`);
    };

    // change on any movements
    this.controller.oninput = () => {
      console.log(`controller oninput: angle=${this.angle()}`);
    };

    this.clockDisplay = document.querySelector('#clockDisplay');
    this.clockface = document.querySelector('.clock__face');
    this.clockface.onmousedown = e => {
      console.log(e);
      this.startTimer(this.gradToMinutes(this.angle()));
      // e.preventDefault();
      e.stopPropagation();
      // else e.stopPropagation();
    };
    /*
    this.clockface.ondoubleclick = e => {
      this.resetTimer();
      e.preventDefault();
    };
    */
  },

  timerToDisplay(minutes) {
    console.log(`timerToDisplay: minutes to display=${minutes}`);
  },
};

var Application = {
  init() {
    this.startTimer = this.startTimer.bind(this);
    this.syncTimer = this.syncTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.minutesToGrad = this.minutesToGrad.bind(this);
  },

  startTimer(timeout) {
    this.currentTime = new Date();
    this.currentHour = this.currentTime.getHours();
    this.currentMinutes = this.currentTime.getMinutes();
    console.log(
      `startTimer: currentTime=${this.currentHour}:${this.currentMinutes}`,
    );
    this.finishTime = this.currentMinutes + timeout;
    this.minutesLeft = timeout;
    if (this.finishTime > 60) {
      this.currentHour += 1;
      this.currentMinutes -= 60;
    }
    this.timer = setInterval(this.syncTimer, 600);
  },

  syncTimer() {
    this.minutesLeft -= 1;
    this.timerToDisplay(this.minutesLeft);
    if (this.minutesLeft === 0) {
      this.endOfTimeReport();
      clearInterval(this.timer);
    }
  },

  endOfTimeReport() {
    console.log('Time ended!');
  },

  resetTimer() {
    this.minutesLeft = 25;
    this.timerToDisplay(this.minutesLeft);
    if (this.timer) clearInterval(this.timer);
  },

  minutesToGrad(minutes) {
    return minutes * 6 - 90;
  },

  gradToMinutes(grad) {
    var converted = (360 - grad + 90) / 6;
    if (converted >= 60 && converted <= 75) converted -= 60;
    return converted;
  },
};

var Pomodoro = Object.assign({}, UI, Application);
Pomodoro.init();
Pomodoro.listen();
