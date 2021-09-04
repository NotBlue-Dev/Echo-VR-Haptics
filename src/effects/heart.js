class Heart {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.end = false
    }

    handle(gameData) {
        const tempClock = gameData.clockDisplay
            .split('.')[0]
            .replace(":", ".")
        const clock = tempClock.replace(tempClock.charAt(0), '')
        const floatClock = +(clock)
        if (floatClock < 0.30 && this.end === false && status === "playing") {
            this.end = true;

            const heartBeat = setInterval(() => {
                if (status !== 'playing') {
                    clearInterval(heartBeat)
                    this.end = false
                }
                this.tactPlay('heart', this.options);
            }, 800);
        }
    }
}

module.exports = Heart
