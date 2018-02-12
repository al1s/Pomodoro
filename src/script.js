/* eslint no-var: 0 */
/* eslint prefer-template: 0 */
/* eslint no-plusplus: 1 */
/* eslint vars-on-top: 0 */
/* eslint prefer-const: 0 */
/* eslint arrow-parens: 0 */

// +-TODO: start Pomodoro on clockface click or Enter press;
// +-TODO: reset Pomodoro on double click or Delete (Backspace);
// +TODO: visualize chosen interval by printing its length on the clockface;
// TODO: visualize movements of the controller handler by adjusting interval length;
// +TODO: show notification on timer ending;
// +TODO: prevent starting new pomodoro on repeating clicks on the clockface if we already run;
// -TODO: hide controller on Pomodoro start and show on reset;
// +TODO: prevent changing controller position when timer either running or paused;
// TODO: make controller handler follow countdown timer smoothly;
// +FIX: multiple timers run on start timer repeating clicks;

var UI = {
  listen() {
    this.controller = document.querySelector('#clockController');
    this.clockDisplay = document.querySelector('#clockDisplay');
    this.clockface = document.querySelector('.clock__face');
    this.inputPause = document.querySelector('#inputPause');
    this.inputStop = document.querySelector('#inputStop');
    this.btnPause = document.querySelector('#btnPause');
    this.btnStop = document.querySelector('#btnStop');

    this.notifyUser = this.notifyUser.bind(this);
    this.showTimeLeft = this.showTimeLeft.bind(this);
    this.changeUIStyle = this.changeUIStyle.bind(this);
    this.controllerPosition = this.minutesToGrad(this.timeLeft);
    this.paused = this.inputPause.checked;
    this.stopped = this.inputStop.checked;

    this.changeUIStyle();
    // these are the defaults
    this.options = {
      max: 360, // maximum value
      min: 0, // minimum value
      step: 6, // [min, min+step, ..., max]
      name: 'clock-controller', // used for <input name>
    };

    this.angle = AngleInput(this.controller, this.options);
    this.angle(this.controllerPosition); // set controller position;
    this.showTimeLeft(this.timeLeft); // set digital display to default pomodoro value;

    this.controller.oninput = e => {
      e.stopPropagation();
      console.log('controller input');
      console.log(`stopped=${this.inputStop.checked}`);
      if (this.inputStop.checked) {
        this.timeLeft = this.gradToMinutes(this.angle()) * 60;
        this.showTimeLeft(this.timeLeft);
      }
    };

    this.controller.onclick = e => {
      if (this.inputStop.checked) {
        e.stopPropagation();
        console.log('controller clicked');
        console.log(`stopped=${this.inputStop.checked}`);
        this.timeLeft = this.gradToMinutes(this.angle()) * 60;
        this.showTimeLeft(this.timeLeft);
      }
    };

    this.btnPause.onclick = e => {
      e.stopPropagation();
      console.log('Pause clicked');
      this.clickHandler(e);
    };

    this.btnStop.onclick = e => {
      e.stopPropagation();
      console.log('Stop clicked');
      this.clickHandler(e);
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

  showTimeLeft(timeInSecondsLeft) {
    var minutesLeft = Math.floor(timeInSecondsLeft / 60);
    var secondsLeft = timeInSecondsLeft - minutesLeft * 60;
    console.log(
      `timeLeft=${timeInSecondsLeft}, min=${minutesLeft}, sec=${secondsLeft}`,
    );
    this.clockDisplay.innerText =
      (String(minutesLeft).length !== 2 ? '0' : '') +
      minutesLeft +
      ':' +
      (String(secondsLeft).length !== 2 ? '0' : '') +
      secondsLeft;
  },

  changeUIState(newState) {
    console.log(`stopped=${this.inputStop.checked}`);
    if (newState === 'stopped') {
      this.showTimeLeft(this.timeLeft);
      this.inputPause.checked = true; // change play/pause button appearance;
      this.inputStop.checked = true;
      this.angle(this.controllerPosition); // set controller position;
      this.changeUIStyle(newState);
    } else if (newState === 'running') {
      this.changeUIStyle(newState);
      this.inputStop.checked = false;
    } else if (newState === 'paused') {
      this.changeUIStyle(newState);
      this.inputStop.checked = false;
    } else if (newState === 'tick') {
      this.showTimeLeft(this.timeLeft);
      this.angle(this.controllerPosition); // set controller position;
    }
  },

  changeUIStyle(newTheme) {
    var body = document.querySelector('body');
    var currentTheme = body.dataset.theme;
    body.classList.toggle(`${currentTheme}`);
    if (newTheme) {
      body.classList.add(`--${newTheme}`);
      body.dataset.theme = `--${newTheme}`;
    }
  },
};

var Application = {
  init() {
    this.clickHandler = this.clickHandler.bind(this);
    this.syncTimerDisplay = this.syncTimerDisplay.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.endTimer = this.endTimer.bind(this);
    this.minutesToGrad = this.minutesToGrad.bind(this);
    this.gradToMinutes = this.gradToMinutes.bind(this);
    this.defaultTimer = 25; // default pomodoro timeout in minutes;
    this.timeLeft = this.defaultTimer * 60;
  },

  syncTimerDisplay(timeout) {
    var elapsed = Date.now() - this.startTime;
    this.timeLeft = timeout - Math.floor(elapsed / 1000);
    if (this.timeLeft >= 0) {
      this.changeUIState('tick');
    }
  },

  clickHandler(e) {
    if (e.target.id === 'btnPause') {
      console.log(`timeLeft=${this.timeLeft}`);
      if (this.timerProcessId) this.pauseTimer();
      else this.startTimer(this.timeLeft);
    } else if (e.target.id === 'btnStop') {
      this.resetTimer();
    }
  },

  startTimer(timeout) {
    if (Notification) {
      Notification.requestPermission().then(result => {
        if (result === 'denied') console.log('Notification are not granted');
        else if (result === 'default')
          console.log('Notifications are not set to default');
        else this.notificationGranted = true;
      });
    }
    this.startTime = Date.now();
    this.redrawProcessId = setInterval(this.syncTimerDisplay, 1000, timeout);
    this.timerProcessId = setTimeout(this.endTimer, timeout * 1000 + 100);
    this.changeUIState('running');
  },

  endTimer() {
    this.cleanAsyncTimers();
    if (this.notificationGranted) this.notifyUser('Pomodoro', 'Time ended');
    else alert('Time ended');
    this.changeUIState('stopped');
  },

  pauseTimer() {
    this.cleanAsyncTimers();
    this.changeUIStyle('paused');
  },

  resetTimer() {
    this.cleanAsyncTimers();
    this.timeLeft = this.defaultTimer * 60;
    this.changeUIState('stopped');
  },

  cleanAsyncTimers() {
    clearInterval(this.redrawProcessId);
    clearTimeout(this.timerProcessId);
    this.timerProcessId = undefined;
    this.redrawProcessId = undefined;
  },

  minutesToGrad(seconds) {
    var result;
    if (seconds >= 0 && seconds <= 15 * 60) {
      result = 360 - Math.floor((seconds + 60 * 60) / 10) + 90;
    } else result = 360 - Math.floor(seconds / 10) + 90;
    return result;
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
