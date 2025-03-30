var socket = io("http://localhost:3000");

const currentBtns = document.getElementsByClassName("option-btn-1");
const joinBtn = document.getElementById("player-join");
const scoreTexts = document.getElementsByClassName("score");
let currentSelectedBtn = null;
let game = null;
let playerSelf = null;
let playerEnemy = null;

const playerStatuses = [document.getElementById("player1-ready"), document.getElementById("player2-ready")];
socket.on("connect", () => {
    for(let btn of currentBtns) {
        btn.onclick = function() {optionClick(btn)};
        btn.addEventListener('click', function(e) {
            socket.emit('option selected', socket.id, btn.textContent);
            game.selectedOption(socket.id, btn.textContent);
        }
    )};
    joinBtn.addEventListener('click', function(e) {
        const nameField = document.getElementById("player-text-field");
        socket.emit('player join', socket.id, nameField.value); //self
        playerSelf = new Player(nameField.value, socket.id);
        initializeGameCheck();
    })

    socket.on("player join", (id, name) => {
        console.log(`user with id: ${id} has joined!`); //enemy
        playerEnemy = new Player(name, id);
        
    })
    socket.on("option selected", (id, option) => {
        enemyReady();
        game.selectedOption(id, option);
    });
    socket.on("player disconnect", () => {
        console.log("jut disconnected");
        if(game !== null)
        {
            console.log("disconnected while game on");
            resetGame();
        }
    })
});

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
        if(this.ID === 1)
        {
            document.getElementById("player1-name").textContent = newName;
        }
        else
        {
            document.getElementById("player2-name").textContent = newName;
        }
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

    getWins() {
        return this.wins;
    }

    resetOption() {
        this.option = null;
    }

}

class Game {
    constructor(player1= null, player2 = null) {
        this.players = {
            // player1ID: player1,
            // player2ID: player2
        }
        this.players[player1.getID()] = player1;
        this.players[player2.getID()] = player2;
        this.isSetup = false;
        this.winnerText = document.getElementById("winner-text");
    }

    AddPlayer(playerID, playerName) {
        this.players.add(new Player(playerName, playerID));
    }

    gameSetup() {
        const player1Name = document.getElementById("player1-name");
        player1Name.textContent = playerSelf.getName();
        
        
        const player2Name = document.getElementById("player2-name");
        player2Name.textContent = playerEnemy.getName();
        this.isSetup = true;
    }

    playersReady() {
        for(let player of Object.values(this.players)) {
            if(!player.getOption()) { //if option is not filled return false
                return false;
            }
        }
        return true; //return true if all options are filled
    }

    selectedOption(playerID, option) {
        this.players[playerID].setOption(option);
        if(this.playersReady()) {
            this.checkWinner();
        }
    }

    checkWinner() {
        if(this.players[playerSelf.getID()].getOption() !== null && this.players[playerEnemy.getID()].getOption() !== null) {
            const selfOption = this.players[playerSelf.getID()].getOption().trim();
            const enemyOption = this.players[playerEnemy.getID()].getOption().trim();
            if(selfOption === enemyOption) {
                this.winnerText.textContent = "Tie";
                console.log("TIE");
            }
            //WIN LOSS found match found for player 1 - player 1 wins
            else if(WIN_DICT[selfOption] === enemyOption) {
                this.players[playerSelf.getID()].addWin();
                scoreTexts[0].textContent = this.players[playerSelf.getID()].getWins();
                this.players[playerEnemy.getID()].addLoss();
                this.winnerText.textContent = `You won! Next Round Starting Soon...`;
            }
            else if(WIN_DICT[enemyOption] === selfOption) {
                this.players[playerEnemy.getID()].addWin();
                this.players[playerSelf.getID()].addLoss();
                scoreTexts[1].textContent = this.players[playerEnemy.getID()].getWins();
                this.winnerText.textContent = `You Lost! Next Round Starting Soon...`;
            }
            else {
                console.log("ERROR IN CHECKING WINNER");
            }
            // this.resetRound();
            for(let btn of currentBtns) {
                btn.disabled = true;  
            }
            setTimeout(this.resetRound.bind(this), 3000);
        }
    }

    resetRound() { 
        for(let btn of currentBtns) {
            btn.disabled = false;  
        }

        const xIcon = document.createElement('i');
        xIcon.style.color = 'var(--color-not-ready)';
        xIcon.style.border = '2px solid var(--color-secondary)';
        xIcon.style.borderRadius = '5px';
        xIcon.style.display = 'inline-block';
        xIcon.style.padding = '1%';
        xIcon.style.background = 'var(--color-secondary)';
        xIcon.className = 'fa-solid fa-x';
        playerStatuses[0].replaceWith(xIcon);
        playerStatuses[1].replaceWith(xIcon);

        console.log(this.winnerText);
        this.winnerText.textContent = "Awaiting Players to Choose Options...";
        this.players[playerSelf.getID()].resetOption();
        this.players[playerEnemy.getID()].resetOption();
        optionUnClick();
    }
}

document.querySelectorAll('.card-container i').forEach(icon => {
    icon.classList.remove('bump-up'); // Reset animation
});

function ready(playerText) {
    playerText.style.color = "green";
}

function optionClick(btn) {
    if(currentSelectedBtn !== null) {
    
        currentSelectedBtn.style.borderColor = '#7d7d9a';
        currentSelectedBtn.style.color = '#2f3944';
        currentSelectedBtn.style.scale = 1.0;
    }
    const btnIcon = btn.querySelector('i');
    btnIcon.classList.remove('bump-up');
    void btnIcon.offsetWidth;
    btnIcon.classList.add('bump-up');

    btn.classList.add('bump-up');
    btn.style.scale = 1.1;
    btn.style.color = '#EB7B7B';
       btn.style.borderColor = '#EB7B7B';
    currentSelectedBtn = btn;

    
    const checkIcon = document.createElement('i');
    checkIcon.style.color = 'var(--color-ready)';
    checkIcon.style.border = '2px solid var(--color-secondary)';
    checkIcon.style.borderRadius = '5px';
    checkIcon.style.display = 'inline-block';
    checkIcon.style.padding = '1%';
    checkIcon.style.background = 'var(--color-secondary)';
    checkIcon.className = 'fa-solid fa-check';
    
    playerStatuses[0].replaceWith(checkIcon);
}

function optionUnClick() {
    if(currentSelectedBtn !== null) {
        currentSelectedBtn.style.borderColor = '#7d7d9a';
        currentSelectedBtn.style.color = '#2f3944';
        currentSelectedBtn.style.scale = 1.0;
    }
}

function initializeGameCheck() {
    const waitScreen = document.getElementsByClassName('wait-container');
    const joinScreen = document.getElementsByClassName('join-container');
    joinScreen[0].style.display = 'none';
    waitScreen[0].style.display = "flex";

    const checkPlayerEnemy = setInterval(() => {
        if(playerEnemy !== null)
        {
            clearInterval(checkPlayerEnemy);
            waitScreen[0].style.display = "none";
            game = new Game(playerSelf, playerEnemy); //put players in here
            game.gameSetup();
            const gameScreen = document.getElementsByClassName("players-container");
            console.log(gameScreen);
            gameScreen[0].style.display = 'flex';
        }
    }, 100);
}

function enemyReady() {
    const checkIcon = document.createElement('i');
    checkIcon.style.color = 'var(--color-ready)';
    checkIcon.style.border = '2px solid var(--color-secondary)';
    checkIcon.style.borderRadius = '5px';
    checkIcon.style.display = 'inline-block';
    checkIcon.style.padding = '1%';
    checkIcon.style.background = 'var(--color-secondary)';
    checkIcon.className = 'fa-solid fa-check';
    playerStatuses[1].replaceWith(checkIcon);


}

function resetGame() {
    currentSelectedBtn = null;
    game = null;
    playerSelf = null;
    playerEnemy = null;
    
    //reset screens
    const waitScreen = document.getElementsByClassName('wait-container');
    const joinScreen = document.getElementsByClassName('join-container');
    const gameScreen = document.getElementsByClassName("players-container");
    const winnerText = document.getElementById("winner-text");
    joinScreen[0].style.display = 'flex';
    waitScreen[0].style.display = "none";
    gameScreen[0].style.display = 'none';

    //reset play screen
    winnerText.textContent = "Awaiting Players to Choose Options...";
    scoreTexts[0].textContent = 0;
    scoreTexts[1].textContent = 0;

    const xIcon = document.createElement('i');
    xIcon.style.color = 'var(--color-not-ready)';
    xIcon.style.border = '2px solid var(--color-secondary)';
    xIcon.style.borderRadius = '5px';
    xIcon.style.display = 'inline-block';
    xIcon.style.padding = '1%';
    xIcon.style.background = 'var(--color-secondary)';
    xIcon.className = 'fa-solid fa-x';
    playerStatuses[0].replaceWith(xIcon);
    playerStatuses[1].replaceWith(xIcon);
    optionUnClick();


}