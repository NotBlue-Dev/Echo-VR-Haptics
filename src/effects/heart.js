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
        if (floatClock < 0.30 && this.end === false && gameData.isInMatch()) {
            this.end = true;
            console.log('HEARTBAT')
            const heartBeat = setInterval(() => {
                if (!gameData.isInMatch()) {
                    clearInterval(heartBeat)
                    this.end = false
                }
                this.tactPlay('heart', this.options);
            }, 800);
        }
    }
}

module.exports = Heart
