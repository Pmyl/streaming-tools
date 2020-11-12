const Mode = {
  Timer: 0,
  Stopwatch: 1
};

class Timer {
  constructor() {
    this.running = false;
    this.hasToShowMilliseconds = true;
    this.times = [];
    this.initialTimes = [0, 5, 0, 0];
    this.cbs = [];
    this.mode = Mode.Timer;
    this.reset();
    this.update();
  }

  reset() {
    this.times = this.initialTimes.slice();
    this.update();
  }

  showMilliseconds(show) {
    this.hasToShowMilliseconds = show;
    this.update();
  }

  setTime(times) {
    if (this.running) return;
    this.times[0] = times[0];
    this.times[1] = Math.min(60, times[1]);
    this.times[2] = Math.min(60, times[2]);
    this.times[3] = times[3];
    this.initialTimes = this.times.slice();
    this.update();
  }

  setToZero() {
    this.times = [0, 0, 0, 0];
    this.update();
  }

  startStop() {
    if (this.time) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (!this.time) this.time = performance.now();
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this.step.bind(this));
    }
  }

  stop() {
    this.running = false;
    this.time = null;
  }

  restart() {
    this.reset();
    this.start();
  }

  step(timestamp) {
    if (!this.running) return;
    this.calculate(timestamp);
    this.time = timestamp;
    this.update();
    requestAnimationFrame(this.step.bind(this));
  }

  nextMode() {
    this.mode === Mode.Timer ? this.setMode(Mode.Stopwatch) : this.setMode(Mode.Timer);
  }

  setMode(mode) {
    if (this.running) return;
    this.mode = mode;
  }

  toggleShowMilliseconds() {
    this.showMilliseconds(!this.hasToShowMilliseconds)
  }

  calculate(timestamp) {
    var diff = timestamp - this.time;
    // Hundredths of a second are 100 ms
    this.times[3] += (diff / 10) * (this.mode === Mode.Timer ? -1 : 1);
    // Seconds are 100 hundredths of a second
    if (this.times[3] >= 100) {
      this.times[2] += 1;
      this.times[3] -= 100;
    } else if (this.times[3] < 0) {
      const amount = Math.abs(Math.floor(this.times[3] / 100));
      this.times[2] -= amount;
      this.times[3] += amount * 100;
    }
    // Minutes are 60 seconds
    if (this.times[2] >= 60) {
      this.times[1] += 1;
      this.times[2] -= 60;
    } else if (this.times[2] < 0) {
      const amount = Math.abs(Math.floor(this.times[2] / 60));
      this.times[1] -= amount;
      this.times[2] += amount * 60;
    }
    // Hours are 60 minutes
    if (this.times[1] >= 60) {
      this.times[0] += 1;
      this.times[1] -= 60;
    } else if (this.times[1] < 0) {
      const amount = Math.abs(Math.floor(this.times[1] / 60));
      this.times[0] -= amount;
      this.times[1] += amount * 60;
    }

    if (this.times[0] < 0
      || this.times[1] < 0
      || this.times[2] < 0
      || this.times[3] < 0) {
      this.stop();
      this.setToZero();
    }
  }

  onUpdate(cb) {
    this.cbs.push(cb);
    this.update();
  }

  update() {
    const stringTime = this.format(this.times);

    for(let i = 0; i < this.cbs.length; i++) {
      this.cbs[i](stringTime);
    }
  }

  format(times) {
    return `${pad0(times[0], 2)}:${pad0(times[1], 2)}:${pad0(times[2], 2)}` + (this.hasToShowMilliseconds ? `:${pad0(Math.floor(times[3]), 2)}` : '');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const timerSpan = document.getElementsByClassName("timer")[0];
  const timer = new Timer();
  timer.showMilliseconds(false);

  timer.onUpdate((time) => {
    timerSpan.innerHTML = time;
  });

  let times = timer.times.slice();

  document.addEventListener("keydown", (event) => {
    switch(event.keyCode) {
      case 32:
        timer.startStop();
        times = timer.times.slice();
        break;
      case 82:
        timer.reset();
        break;
      case 48:
      case 96:
        editTime(0);
        break;
      case 49:
      case 97:
        editTime(1);
        break;
      case 50:
      case 98:
        editTime(2);
        break;
      case 51:
      case 99:
        editTime(3);
        break;
      case 52:
      case 100:
        editTime(4);
        break;
      case 53:
      case 101:
        editTime(5);
        break;
      case 54:
      case 102:
        editTime(6);
        break;
      case 55:
      case 103:
        editTime(7);
        break;
      case 56:
      case 104:
        editTime(8);
        break;
      case 57:
      case 105:
        editTime(9);
        break;
      case 46:
        clearTime();
        break;
      case 83:
        timer.nextMode();
        break;
      case 77:
        timer.toggleShowMilliseconds();
        break;
    }
  });

  function editTime(digit) {
    if (timer.running) return;
    times[0] = Number(pad0(times[0].toFixed(), 2)[1] + pad0(times[1].toFixed(), 2)[0]);
    times[1] = Number(pad0(times[1].toFixed(), 2)[1] + pad0(times[2].toFixed(), 2)[0]);
    times[2] = Number(pad0(times[2].toFixed(), 2)[1] + digit.toString());
    times[3] = 0;
    timer.setTime(times.slice());
  }

  function clearTime() {
    if (timer.running) return;
    timer.setToZero();
    times = timer.times.slice();
  }
});

function pad0(value, count) {
  var result = value.toString();
  for (; result.length < count; --count)
    result = '0' + result;
  return result;
}
