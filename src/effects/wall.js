class Wall {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.lastVel = 0
    }

    handle(gameData) {
        const player = gameData.player
        const velocity = player.velocity

        const pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2) + Math.pow(velocity[2], 2);
        if ((this.lastVel / 2 > pyVeloc && this.lastVel > 24 && pyVeloc > 16.1)
        && !gameData.isPlayerGrabbingSomething()
        ) {
            this.tactPlay('wall', this.options);
        }
        this.lastVel = pyVeloc
    }
}

module.exports = Wall
