const WIN_DICT = {
    "Rock": "Scissors",
    "Paper": "Rock",
    "Scissors": "Paper"
}

class Player {    
    constructor(name=null, ID = null, option=null) {
        this.name = name;
        this.option = option;
        this.wins = 0;
        this.losses = 0;
        this.ID = ID;
    }

    getID() {
        return this.ID;
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
        this.players = []
    }

    gameSetup() {
        const player1 = new Player("Bob", 1);
        const player2 = new Player("Matt", 2);


        this.players = [
            player1,
            player2
        ];

        const player1Name = document.getElementById("player1-name");
        player1Name.textContent = player1.getName();
        
        
        const player2Name = document.getElementById("player2-name");
        player2Name.textContent = player2.getName();
    }

    playersReady() {
        for(let player of this.players) {
            if(!player.getOption()) { //if option is not filled return false
                return false;
            }
        }
        return true; //return true if all options are filled
    }

    selectedOption(player, option) {
        player.setOption(option);
        console.log(`Player ${player.getName()} selected ${option}.`);
        if(this.playersReady()) {
            this.checkWinner();
        }
    }

    checkWinner() {

        if(this.players[0].getOption() !== null && this.players[1].getOption() !== null) {
            if(this.players[0].getOption() === this.players[1].getOption()) {
                console.log("TIE");
            }
            //WIN LOSS found match found for player 1 - player 1 wins
            else if(WIN_DICT[this.players[0].getOption()] === this.players[1].getOption()) {
                this.players[0].addWin();
                this.players[1].addLoss();
                console.log(`Player ${this.players[0].getName()} Wins! has ${this.players[0].getScore().wins} wins!`);
            }
            else {
                this.players[1].addWin();
                this.players[0].addLoss();
                console.log(`Player ${this.players[1].getName()} Wins! He has ${this.players[1].getScore().wins} wins!`);
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

for(let player of game.players) {
    const currentBtns = document.getElementsByClassName("option-btn-"+player.getID());
    for(let btn of currentBtns) {
        btn.onclick = function() {optionClick(player, btn.textContent)}
    }
}

function ready(playerText) {
    playerText.style.color = "green";
}

function optionClick(player, selectedOption) {
    game.selectedOption(player, selectedOption)
}