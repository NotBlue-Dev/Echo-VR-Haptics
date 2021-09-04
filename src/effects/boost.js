class Boost {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.boost1 = false
        this.boost2 = false
        this.tempVelocMax = 24.95
    }

    handle(gameData) {
        // FIXME: à revoir avec un timestamp
        const velocity = gameData.player.velocity

        const pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2) + Math.pow(velocity[2], 2);
        let tempVeloc = pyVeloc + 6.56

        //Boost 6.56 24.95

        if (tempVeloc > 25) {
            tempVeloc = 24.94
        }
        if (this.tempVelocMax > 25) {
            tempVeloc = 24.94
        }

        if (!(pyVeloc >= 24.94) && (pyVeloc >= tempVeloc - 0.12 && pyVeloc <= tempVeloc + 0.12) && this.boost1 === false) {
            this.boost1 = true;
            this.tactPlay('boost', this.options);
            setTimeout(() => {
                this.boost1 = false;
            }, 1000);
        }

        if ((pyVeloc >= this.tempVelocMax - 0.12 && pyVeloc <= this.tempVelocMax + 0.12) && this.boost2 === false) {
            this.boost2 = true;
            this.tactPlay('boost', this.options);
        }

        if (pyVeloc < 24.94) {
            this.boost2 = false;
        }
    }
}

module.exports = Boost
