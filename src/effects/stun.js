class Stun {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.stun = false
    }

    handle(gameData) {

        if (this.stun) {
            return
        }

        const playerPos = gameData.player.head.position
        gameData.enemyTeamPlayers.forEach((enemyPlayer) => {
            const enemyPos = enemyPlayer.head.position
            if ((playerPos[0] >= enemyPos[0] - 1 && playerPos[0] <= enemyPos[0] + 1)
                && (playerPos[1] >= enemyPos[1] - 1 && playerPos[1] <= enemyPos[1] + 1)
                && (playerPos[2] >= enemyPos[2] - 1 && playerPos[2] <= enemyPos[2] + 1)) {
                if (enemyPlayer.stunned) {
                    console.log('STUN')
                    this.stun = true;
                    this.tactPlay('stun', this.options);
                    setTimeout(() => {
                        this.stun = false;
                    }, 1000);
                }
            }
        })
    }
}

module.exports = Stun
