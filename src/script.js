/* eslint no-var: 0 */
/* eslint vars-on-top: 0 */
/* eslint prefer-const: 0 */
/* eslint arrow-parens: 0 */

// TODO: start Pomodoro on clock-face click;
var UI = {
  init() {
    // these are the defaults
    this.options = {
      max: 360, // maximum value
      min: 0, // minimum value
      step: 6, // [min, min+step, ..., max]
      name: 'clock-controller', // used for <input name>
    };
    this.newAngle = 300;

    var elem = document.getElementById('clockController');
    var angle = AngleInput(elem, this.options);
    angle(this.newAngle); // set

    // fired for only definitive value changes
    elem.onchange = e => {
      // elem.removeEventListener() also work.
      console.log(angle());
    };

    // change on any movements
    elem.oninput = e => {
      console.log(angle());
    };
  },
};

var Application = {};

var Pomodoro = Object.assign({}, UI, Application);
Pomodoro.init();
