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
// TODO: hide controller on Pomodoro start and show on reset;

var UI = {
  listen() {
    this.notifyUser = this.notifyUser.bind(this);
    this.timerToDisplay = this.timerToDisplay.bind(this);

    // these are the defaults
    this.options = {
      max: 360, // maximum value
      min: 0, // minimum value
      step: 6, // [min, min+step, ..., max]
      name: 'clock-controller', // used for <input name>
    };

    this.controller = document.querySelector('#clockController');
    this.angle = AngleInput(this.controller, this.options);
    this.angle(this.controllerPosition); // set controller position;

    this.clockDisplay = document.querySelector('#clockDisplay');
    this.clockface = document.querySelector('.clock__face');
    this.clockface.onmousedown = e => {
      // console.log(e);
      this.clickHandler(this.gradToMinutes(this.angle()) * 60);
      e.stopPropagation();
    };
  },

  notifyUser(title, body) {
    var n = new Notification(title, { body });
    n.onclick = e => {
      e.preventDefault();
      window.open(window.location.href, 'Pomodoro');
    };
    setTimeout(n.close.bind(n), 5000);
  },

  timerToDisplay(minutes, seconds) {
    this.clockDisplay.innerText =
      (String(minutes).length !== 2 ? '0' : '') +
      minutes +
      ':' +
      (String(seconds).length !== 2 ? '0' : '') +
      seconds;
  },
};

var Application = {
  init() {
    this.startTimer = this.startTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.endTimer = this.endTimer.bind(this);
    this.minutesToGrad = this.minutesToGrad.bind(this);
    this.syncTimerDisplay = this.syncTimerDisplay.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    this.paused = false;
    this.defaultTimer = 1; // default pomodoro timeout in minutes;
    this.timeLeft = this.defaultTimer * 60;
    this.controllerPosition = this.minutesToGrad(this.defaultTimer);
  },

  syncTimerDisplay(timeout) {
    var elapsed = Date.now() - this.startTime;
    this.timeLeft = timeout - Math.floor(elapsed / 1000);
    console.log(
      `elapsed=${elapsed}, timeout=${timeout}, timeLeft=${this.timeLeft}`,
    );
    if (this.timeLeft >= 0) {
      var minutesLeft = Math.floor(this.timeLeft / 60);
      var secondsLeft = this.timeLeft - minutesLeft * 60;
      this.timerToDisplay(minutesLeft, secondsLeft);
    }
  },

  clickHandler(timeout) {
    console.log('clicked');
    console.log(`timeLeft=${this.timeLeft}`);
    console.log(`paused=${this.paused}`);

    if (this.timerProcessId) this.pauseTimer();
    else if (this.paused) {
      console.log('in resume processing');
      this.paused = false;
      this.startTimer(this.timeLeft);
    } else this.startTimer(timeout);
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
    this.timerProcessId = setTimeout(this.endTimer, timeout * 1000 + 100);
  },

  endTimer() {
    // console.log('Time ended!');
    clearInterval(this.redrawProcessId);
    clearTimeout(this.timerProcessId);
    if (this.notificationGranted) this.notifyUser('Pomodoro', 'Time ended');
  },

  pauseTimer() {
    clearInterval(this.redrawProcessId);
    clearTimeout(this.timerProcessId);
    this.timerProcessId = undefined;
    this.paused = true;
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
