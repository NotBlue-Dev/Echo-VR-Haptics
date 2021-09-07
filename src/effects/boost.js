class Boost {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options
        this.isBoosting1 = false
        this.isBoosting2 = false
        this.tempVelocMax = 24.95
        this.tempVeloc = 0
        this.nextTimeStamp = 0
        this.boostLenght = 1000
    }

    handle(gameData) {
        const maxBoost1Velocity = 24.94
        const player = gameData.player
        const velocity = player.velocity
        const pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2) + Math.pow(velocity[2], 2);
        const currentTimeStamp = Date.now()

        if(currentTimeStamp >= this.nextTimeStamp) {
            this.tempVeloc = pyVeloc + 6.56
            this.nextTimeStamp = currentTimeStamp + this.boostLenght
        }

        //Boost 6.56 24.95

        if (this.tempVeloc > 25) {
            this.tempVeloc = maxBoost1Velocity
        }

        if (false === this.isBoosting1
            && pyVeloc < maxBoost1Velocity
            && pyVeloc >= this.tempVeloc - 0.12
            && pyVeloc <= this.tempVeloc + 0.12
            && false === gameData.isPlayerGrabbingSomething()
        ) {
            this.isBoosting1 = true;
            this.tactPlay('boost', this.options);
            setTimeout(() => {
                this.isBoosting1 = false;
            }, this.boostLenght);
        }

        if (false === this.isBoosting2
            && pyVeloc >= this.tempVelocMax - 0.05
            && pyVeloc <= this.tempVelocMax + 0.05
            && gameData.isPlayerGrabbingSomething()
        ) {
            this.isBoosting2 = true;
            this.tactPlay('boost', this.options);
        }
        //24.88 instead of 24.90 = fix boost infinie
        if (pyVeloc < 24.88) {
            this.isBoosting2 = false;
        }
    }
}

module.exports = Boost
