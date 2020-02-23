class Timer {
    constructor() {
        this.running = false;
        this.hasToShowMilliseconds = true;
        this.times = [];
        this.initialTimes = [0, 5, 0, 0];
        this.cbs = [];
        this.reset();
        this.update();
    }

    reset() {
        this.times = this.initialTimes.slice();
        this.update();
    }

    showMilliseconds(show) {
        this.hasToShowMilliseconds = show;
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

    action() {
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

    calculate(timestamp) {
        var diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[3] -= diff / 10;
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
        switch(event.code) {
            case "Space":
                timer.action();
                times = timer.times.slice();
                break;
            case "KeyR":
                timer.reset();
                break;
            case "Digit1":
            case "Numpad1":
                editTime(1);
                break;
            case "Digit2":
            case "Numpad2":
                editTime(2);
                break;
            case "Digit3":
            case "Numpad3":
                editTime(3);
                break;
            case "Digit4":
            case "Numpad4":
                editTime(4);
                break;
            case "Digit5":
            case "Numpad5":
                editTime(5);
                break;
            case "Digit6":
            case "Numpad6":
                editTime(6);
                break;
            case "Digit7":
            case "Numpad7":
                editTime(7);
                break;
            case "Digit8":
            case "Numpad8":
                editTime(8);
                break;
            case "Digit9":
            case "Numpad9":
                editTime(9);
                break;
            case "Digit0":
            case "Numpad0":
                editTime(0);
                break;
            case "Delete":
                clearTime();
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
