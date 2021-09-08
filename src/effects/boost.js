class Boost {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.oldVelocity = null
        this.oldTimestamp = null
        this.error = 1e-6
    }

    handle(gameData) {
        const player = gameData.player
        const currentVelocity = player.velocity
        const newTimestamp = Date.now()
        const maxBoost = 2.6
        const boostTime = 500 // 1 seconde
        
        if (null === this.oldVelocity || null === this.oldTimestamp) {
          this.oldVelocity = currentVelocity
          this.oldTimestamp = newTimestamp
          return
        }

        const diffTimestamp = newTimestamp - this.oldTimestamp
        this.oldTimestamp = newTimestamp
        const maxSpeedBoost = (maxBoost * diffTimestamp) / boostTime // /!\ diffTimestamp en ms
        
        const oldSpeed = Math.sqrt(this.oldVelocity[0] ** 2 + this.oldVelocity[1] ** 2 + this.oldVelocity[2] ** 2)
        const currentSpeed = Math.sqrt(currentVelocity[0] ** 2 + currentVelocity[1] ** 2 + currentVelocity[2] ** 2)
        // On prend la différence de vitesse (si tu étais à 1m/s et que tu boost, tu te retrouve à 3.6m/s, donc ici diffSpeed = 2.6)
        const diffSpeed = currentSpeed - oldSpeed
        // Si la différence de vitesse est supérieur à la capacité de prise de vitesse du boost (voir si c’est utile…)
        if (diffSpeed > 2.6) {
          this.oldVelocity = currentVelocity
          return;
        }

        // On transforme le vecteur de direction de la tềte (qui donne la direction au boost) pour lui donner la longueur correspondant à celle du boost attendu
        // Dans un monde parfait, on doit avoir ici exactement le vecteur calculé juste après
        const headVelocityDiff = [
            player.head.forward[0] * diffSpeed,
            player.head.forward[1] * diffSpeed,
            player.head.forward[2] * diffSpeed,
        ]
        // Ici c’est le vecteur de différence de direction cette itération et la précédente, qui est théoriquement le vecteur de boost 
        // Le "vecteur de boost" doit avoir, en théorie, la direction du regard et la vitesse du boost (entre 0 et 2.6)
        const velocityDiff = [
            currentVelocity[0] - this.oldVelocity[0],
            currentVelocity[1] - this.oldVelocity[1],
            currentVelocity[2] - this.oldVelocity[2]
        ]

        if (diffspeed <= 0 || diffSpeed > 2.6) { return; }
        
        // On met à jour le oldVelocity, sinon tu vas avoir comme base la première velocité de la game ;)
        this.oldVelocity = currentVelocity

        // Là on calcul la vitesse du vecteur qui représente la différence entre ce qu’on attend, et ce qu’il se passe
        // Si on est à zéro, c’est quasi-sûr qu’on est sur un boost (ou alors le mec à regarder exactement dans la direction où il a poussé, et il a poussé sous les 2.6m/s, on peut peut-être checké s’il grab autre chose que le disque et mettre le oldVelocity à nul dans ce cas
        const boostingError = (headVelocityDiff[0] - velocityDiff[0]) ** 2 
            + (headVelocityDiff[1] - velocityDiff[1]) ** 2 
            + (headVelocityDiff[2] - velocityDiff[2]) ** 2
        
        if (boostingError < this.error) {
            console.log('boost')
        }
    }
}

module.exports = Boost