class Boost {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options
        this.boost1 = false
        this.boost2 = false
        this.tempVelocMax = 24.95
        this.tempVeloc = 0
        this.nextTimeStamp = 0
        this.boostLenght = 1000
    }

    handle(gameData) {
        const velocity = gameData.player.velocity
        const player = gameData.player
        const pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2) + Math.pow(velocity[2], 2);
        const currentTimeStamp = Date.now()

        if(currentTimeStamp >= this.nextTimeStamp) {
            this.tempVeloc = pyVeloc + 6.56
            this.nextTimeStamp = currentTimeStamp + this.boostLenght
        }

        //Boost 6.56 24.95

        if (this.tempVeloc > 25) {
            this.tempVeloc = 24.94
        }

        if (!(pyVeloc >= 24.94) 
        && (pyVeloc >= this.tempVeloc - 0.12 && pyVeloc <= this.tempVeloc + 0.12) && this.boost1 === false
        && (player.holding_left === "none")
        && (player.holding_right === "none")) {
            this.boost1 = true;
            console.log('BOOST 1')
            this.tactPlay('boost', this.options);
            setTimeout(() => {
                this.boost1 = false;
            }, 1000);
        }

        if ((pyVeloc >= this.tempVelocMax - 0.05 && pyVeloc <= this.tempVelocMax + 0.05) && this.boost2 === false 
        && (player.holding_left === "none")
        && (player.holding_right === "none")) {
            this.boost2 = true;
            console.log('BOOST 2')
            this.tactPlay('boost', this.options);
        }

        if (pyVeloc < 24.90) {
            this.boost2 = false;
        }
    }
}

module.exports = Boost
