const WIN_DICT = {
    "rock": "scissors",
    "paper": "rock",
    "scissors": "paper"
}

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

    addLoss() {
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

    resetOption() {
        this.option = null;
    }

}

class Game {
    constructor(player1= null, player2 = null) {
        this.players = [
            player1,
            player2
        ]
    }

    gameSetup() {
        const player1 = new Player("Bob");
        const player2 = new Player("Matt");
        
        this.player1 = player1;
        this.player2 = player2;
        
        const player1Name = document.getElementById("player1-name");
        player1Name.textContent = player1Name.textContent.concat(this.player1.getName())
        
        
        const player2Name = document.getElementById("player2-name");
        player2Name.textContent = player2Name.textContent.concat(this.player2.getName())
    }

    selectedOption(player, option) {
        player.setOption(option);
    }

    checkWinner() {

        if(this.players[0].getOption() !== null && this.players[1].getOption() !== null) {
            if(this.players[0].getOption() === this.players[1].getOption()) {
                console.log("TIE");
            }
            //WIN LOSS found match found for player 1 - player 1 wins
            else if(WIN_DICT[this.players[0].getOption()] === this.players[1].getOption()) {
                this.players[0].addWin();
                this.player[1].addLoss();
            }
            else {
                this.players[1].addWin();
                this.players[0].addLoss();
            }
    
            this.resetPlayerOptions();
        }
    }

    resetPlayerOptions() { 
        this.players[0].resetOption();
        this.players[1].resetOption();
    }
}

const game = new Game();

game.gameSetup();

for(let player in game.players) {
    const currentBtn = document.getElementsByClassName("option-btn");
    currentBtn.onclick = function() {optionClick(player, currentBtn.value)}
}


function optionClick(player, selectedOption) {
    console.log("Player: " + player.getName());
    console.log("Option: " + selectedOption);
}

// console.log(player1Name.textContent);