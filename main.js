class Player {
    constructor(name=null, option=null) {
        this.name = name;
        this.option = option;
        this.wins = 0;
        this.losses = 0;
    }

    setName(newName) {
        this.name = newName;
    }

    getName() {
        return this.name;
    }

    setOption(newOption) {
        this.option = newOption;
    }

    getOption() {
        return this.option;
    }

    addWin() {
        this.wins++;
    }

    addLosses() {
        this.losses++;
    }

    clearScore() {
        this.wins = 0;
        this.losses = 0;
    }

    getScore() {
        return {
            wins: this.wins,
            losses: this.losses
        };
    }

}


const player1 = new Player("Andrew");
const player2 = new Player("Mom");


const player1Name = document.getElementById("player1-name");
player1Name.textContent = player1Name.textContent.concat(player1.getName())


const player2Name = document.getElementById("player2-name");
player2Name.textContent = player2Name.textContent.concat(player2.getName())

console.log(player1Name.textContent);