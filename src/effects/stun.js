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

        const playerPos = gameData.player.head.position;

        (gameData.enemyTeamPlayers || []).forEach((enemyPlayer) => {
            if(enemyPlayer === undefined) {
                return
            }

            const enemyPos = enemyPlayer.head.position
            if (enemyPlayer.stunned && this.isInCube(playerPos, enemyPos, 1)) {
                this.stun = true;
                this.tactPlay('stun', this.options);
                setTimeout(() => {
                    this.stun = false;
                }, 1000);
            }
        })
    }

    isInCube(position1, position2, size) {
        return (position1[0] >= position2[0] - size && position1[0] <= position2[0] + size)
            && (position1[1] >= position2[1] - size && position1[1] <= position2[1] + size)
            && (position1[2] >= position2[2] - size && position1[2] <= position2[2] + size)
    }
}

module.exports = Stun
