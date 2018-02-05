/* eslint no-var: 0 */
/* eslint prefer-template: 0 */
/* eslint no-plusplus: 1 */
/* eslint vars-on-top: 0 */
/* eslint prefer-const: 0 */
/* eslint arrow-parens: 0 */

// TODO: start Pomodoro on clockface click or Enter press;
// TODO: reset Pomodoro on double click or Delete (Backspace);
// +TODO: visualize chosen interval by printing its length on the clockface;
// TODO: visualize movements of the controller handler by adjusting interval length;
// +TODO: show notification on timer ending;
// TODO: prevent starting new pomodoro on repeating clicks on the clockface if we already run;

var UI = {
  listen() {
    this.syncTimerDisplay = this.syncTimerDisplay.bind(this);
    this.notifyUser = this.notifyUser.bind(this);
    this.timerToDisplay = this.timerToDisplay.bind(this);

    // these are the defaults
    this.options = {
      max: 360, // maximum value
      min: 0, // minimum value
      step: 6, // [min, min+step, ..., max]
      name: 'clock-controller', // used for <input name>
    };
    this.newAngle = this.minutesToGrad(this.defaultTimer);

    this.controller = document.querySelector('#clockController');
    this.angle = AngleInput(this.controller, this.options);
    this.angle(this.newAngle); // set controller position;

    this.clockDisplay = document.querySelector('#clockDisplay');
    this.clockface = document.querySelector('.clock__face');
    this.clockface.onmousedown = e => {
      // console.log(e);
      this.startTimer(this.gradToMinutes(this.angle()));
      e.stopPropagation();
    };
    /*
    // fired for only definitive value changes
    this.controller.onchange = () => {
      // elem.removeEventListener() also work.
      console.log(`controller onchange: angle=${this.angle()}`);
    };

    // change on any movements
    this.controller.oninput = () => {
      console.log(`controller oninput: angle=${this.angle()}`);
    };
    */

    /*
    this.clockface.ondoubleclick = e => {
      this.resetTimer();
      e.preventDefault();
    };
    */
  },

  syncTimerDisplay(timeout) {
    var elapsed = Date.now() - this.startTime;
    var timeLeft = timeout * 60 - Math.floor(elapsed / 1000);
    console.log(`elapsed=${elapsed}, timeout=${timeout}, timeLeft=${timeLeft}`);
    if (timeLeft >= 0) {
      var minutesLeft = Math.floor(timeLeft / 60);
      var secondsLeft = timeLeft - minutesLeft * 60;
      this.timerToDisplay(minutesLeft, secondsLeft);
    }
  },

  notifyUser(title, body) {
    var n = new Notification(title, { body });
    n.onclick = e => {
      e.preventDefault();
      window.open(window.location.href, 'Pomodoro');
    };
    setTimeout(n.close.bind(n), 5000);
  },

  timerToDisplay(minutesLeft, secondsLeft) {
    this.clockDisplay.innerText =
      (String(minutesLeft).length !== 2 ? '0' : '') +
      minutesLeft +
      ':' +
      (String(secondsLeft).length !== 2 ? '0' : '') +
      secondsLeft;
  },
};

var Application = {
  init() {
    this.startTimer = this.startTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.endTimer = this.endTimer.bind(this);
    this.minutesToGrad = this.minutesToGrad.bind(this);
    this.defaultTimer = 1; // default pomodoro timeout in minutes;
  },

  startTimer(timeout) {
    if (Notification) {
      Notification.requestPermission().then(result => {
        if (result === 'denied') console.log('Not granted');
        else if (result === 'default') console.log('Not default');
        else this.notificationGranted = true;
      });
    }
    this.startTime = Date.now();
    this.redrawProcessId = setInterval(this.syncTimerDisplay, 1000, timeout);
    this.timerProcessId = setTimeout(this.endTimer, timeout * 60 * 1000);
  },

  endTimer() {
    console.log('Time ended!');
    clearInterval(this.redrawProcessId);
    clearTimeout(this.timerProcessId);
    if (this.notificationGranted) this.notifyUser('Pomodoro', 'Time ended');
  },

  resetTimer() {
    this.minutesLeft = this.defaultTimer;
    this.secondsLeft = 0;
    this.timerToDisplay(this.minutesLeft);
    if (this.timer) clearInterval(this.timer);
  },

  minutesToGrad(minutes) {
    if (minutes >= 0 && minutes <= 15) minutes += 60;
    return 360 - minutes * 6 + 90;
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
