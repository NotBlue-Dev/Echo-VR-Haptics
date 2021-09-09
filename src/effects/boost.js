class Boost {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.boosting = false
        this.oldVelocity = null
        this.oldTimestamp = null
        this.error = 1e-6
        this.tolerance = 0.12

        const maxBoost = 2.6
        this.boostTime = 265
        this.boostAcceleration = maxBoost / this.boostTime
    }

    handle(gameData) {
        const player = gameData.player
        const currentVelocity = player.velocity
        const newTimestamp = gameData.timestamp
        
        if (true === this.boosting || null === this.oldVelocity || null === this.oldTimestamp) {
            this.oldVelocity = currentVelocity
            this.oldTimestamp = newTimestamp
            return
        }

        const diffTimestamp = newTimestamp - this.oldTimestamp
        const maxSpeedBoost = this.boostAcceleration * diffTimestamp

        const velocityDiff = [
            currentVelocity[0] - this.oldVelocity[0],
            currentVelocity[1] - this.oldVelocity[1],
            currentVelocity[2] - this.oldVelocity[2]
        ]
        const speedDiff = Math.sqrt((velocityDiff[0] ** 2) + (velocityDiff[1] ** 2) + (velocityDiff[2] ** 2))

        this.oldVelocity = currentVelocity
        this.oldTimestamp = newTimestamp
        
        if (speedDiff < (maxSpeedBoost * (1 - this.tolerance)) || speedDiff > (maxSpeedBoost * (1 + this.tolerance))) {
            return;
        }

        const headVelocityDiff = [
            player.head.forward[0] * speedDiff,
            player.head.forward[1] * speedDiff,
            player.head.forward[2] * speedDiff,
        ]

        const boostingError = ((headVelocityDiff[0] - velocityDiff[0]) ** 2 )
            + ((headVelocityDiff[1] - velocityDiff[1]) ** 2)
            + ((headVelocityDiff[2] - velocityDiff[2]) ** 2)

        if (boostingError < this.error) {
            console.log('boost')
            this.boosting = true
            this.tactPlay('boost', this.options)
            setTimeout(() => {
                this.boosting = false
            }, this.boostTime)
        }
    }
}

module.exports = Boost