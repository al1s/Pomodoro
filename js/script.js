"use strict";var UI={listen:function(){var t=this;this.controller=document.querySelector("#clockController"),this.clockDisplay=document.querySelector("#clockDisplay"),this.clockface=document.querySelector(".clock__face"),this.inputPause=document.querySelector("#inputPause"),this.inputStop=document.querySelector("#inputStop"),this.btnPause=document.querySelector("#btnPause"),this.btnStop=document.querySelector("#btnStop"),this.notifyUser=this.notifyUser.bind(this),this.showTimeLeft=this.showTimeLeft.bind(this),this.changeUIStyle=this.changeUIStyle.bind(this),this.controllerPosition=this.minutesToGrad(this.timeLeft),this.paused=this.inputPause.checked,this.stopped=this.inputStop.checked,this.changeUIStyle(),this.options={max:360,min:0,step:6,name:"clock-controller"},this.angle=AngleInput(this.controller,this.options),this.angle(this.controllerPosition),this.showTimeLeft(this.timeLeft),this.controller.oninput=function(e){e.stopPropagation(),console.log("controller input"),console.log("stopped="+t.inputStop.checked),t.inputStop.checked&&(t.timeLeft=60*t.gradToMinutes(t.angle()),t.showTimeLeft(t.timeLeft))},this.controller.onclick=function(e){t.inputStop.checked&&(e.stopPropagation(),console.log("controller clicked"),console.log("stopped="+t.inputStop.checked),t.timeLeft=60*t.gradToMinutes(t.angle()),t.showTimeLeft(t.timeLeft))},this.btnPause.onclick=function(e){e.stopPropagation(),console.log("Pause clicked"),t.clickHandler(e)},this.btnStop.onclick=function(e){e.stopPropagation(),console.log("Stop clicked"),t.clickHandler(e)}},notifyUser:function(t,e){var i=new Notification(t,{body:e});i.onclick=function(t){t.preventDefault(),window.open(window.location.href,"Pomodoro")},setTimeout(i.close.bind(i),5e3)},showTimeLeft:function(t){var e=Math.floor(t/60),i=t-60*e;console.log("timeLeft="+t+", min="+e+", sec="+i),this.clockDisplay.innerText=(2!==String(e).length?"0":"")+e+":"+(2!==String(i).length?"0":"")+i},changeUIState:function(t){console.log("stopped="+this.inputStop.checked),"stopped"===t?(this.showTimeLeft(this.timeLeft),this.inputPause.checked=!0,this.inputStop.checked=!0,this.angle(this.controllerPosition),this.changeUIStyle(t)):"running"===t?(this.changeUIStyle(t),this.inputStop.checked=!1):"paused"===t?(this.changeUIStyle(t),this.inputStop.checked=!1):"tick"===t&&(this.showTimeLeft(this.timeLeft),this.angle(this.controllerPosition))},changeUIStyle:function(t){var e=document.querySelector("body"),i=e.dataset.theme;e.classList.toggle(""+i),t&&(e.classList.add("--"+t),e.dataset.theme="--"+t)}},Application={init:function(){this.clickHandler=this.clickHandler.bind(this),this.syncTimerDisplay=this.syncTimerDisplay.bind(this),this.startTimer=this.startTimer.bind(this),this.resetTimer=this.resetTimer.bind(this),this.endTimer=this.endTimer.bind(this),this.minutesToGrad=this.minutesToGrad.bind(this),this.gradToMinutes=this.gradToMinutes.bind(this),this.defaultTimer=25,this.timeLeft=60*this.defaultTimer},syncTimerDisplay:function(t){var e=Date.now()-this.startTime;this.timeLeft=t-Math.floor(e/1e3),this.timeLeft>=0&&this.changeUIState("tick")},clickHandler:function(t){"btnPause"===t.target.id?(console.log("timeLeft="+this.timeLeft),this.timerProcessId?this.pauseTimer():this.startTimer(this.timeLeft)):"btnStop"===t.target.id&&this.resetTimer()},startTimer:function(t){var e=this;Notification&&Notification.requestPermission().then(function(t){"denied"===t?console.log("Notification are not granted"):"default"===t?console.log("Notifications are not set to default"):e.notificationGranted=!0}),this.startTime=Date.now(),this.redrawProcessId=setInterval(this.syncTimerDisplay,1e3,t),this.timerProcessId=setTimeout(this.endTimer,1e3*t+100),this.changeUIState("running")},endTimer:function(){this.cleanAsyncTimers(),this.notificationGranted?this.notifyUser("Pomodoro","Time ended"):alert("Time ended"),this.changeUIState("stopped")},pauseTimer:function(){this.cleanAsyncTimers(),this.changeUIStyle("paused")},resetTimer:function(){this.cleanAsyncTimers(),this.timeLeft=60*this.defaultTimer,this.changeUIState("stopped")},cleanAsyncTimers:function(){clearInterval(this.redrawProcessId),clearTimeout(this.timerProcessId),this.timerProcessId=void 0,this.redrawProcessId=void 0},minutesToGrad:function(t){return t>=0&&t<=900?360-Math.floor((t+3600)/10)+90:360-Math.floor(t/10)+90},gradToMinutes:function(t){var e=(360-t+90)/6;return e>=60&&e<=75&&(e-=60),e}},Pomodoro=Object.assign({},UI,Application);Pomodoro.init(),Pomodoro.listen();
//# sourceMappingURL=script.js.map
