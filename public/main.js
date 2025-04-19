var socket = io("http://rock-paper-scissors-server.glitch.me/");

const mainmenu = {
    "joinBtn": {
        "btn": document.getElementById("player-join"),
        "playerName": document.getElementById("player-text-field-join"),
        "gameCode": document.getElementById("code-text-field-join")
    },
    "createBtn": {
        "btn": document.getElementById("create-game"),
        "playerName": document.getElementById("player-text-field-create"),
        "gameCode": document.getElementById("code-text-field-create")
    }
}

const currentBtns = document.getElementsByClassName("option-btn-1");
const joinBtn = document.getElementById("player-join");
const createBtn = document.getElementById("create-game");
const scoreTexts = document.getElementsByClassName("score");
const modalContainers = document.getElementsByClassName("modal-container");
const footerBtns = document.getElementById("footer").getElementsByTagName("button");
let isModalOpen = false;
let currentSelectedBtn = null;
let game = null;
let playerSelf = null;
let playerEnemy = null;
let code = null;
let playerIndex = null; //0 if creator, 1 if joiner

const playerStatuses = [document.getElementById("player1-ready"), document.getElementById("player2-ready")];
socket.on("connect", () => {
    for(let btn of currentBtns) {
        btn.onclick = function() {optionClick(btn)};
        btn.addEventListener('click', function(e) {
            socket.emit('option selected', socket.id, btn.textContent, code, enemyIndex);
            game.selectedOption(socket.id, btn.textContent);
        }
    )};

    for(let modalContainer of modalContainers) {
        const modal = modalContainer.getElementsByClassName("modal")[0];
        const btn = modal.getElementsByTagName("button")[0];
        btn.addEventListener('click', function(e) {
            modalContainer.style.display = "none";
            isModalOpen = false;
        })
        };

    for(let i = 0; i < footerBtns.length; i++) {
        footerBtns[i].addEventListener('click', function(e) {
            if(!isModalOpen) {
                modalContainers[i].style.display = "inline-block";
                isModalOpen = true;
            }
        })
    }
    mainmenu["joinBtn"]["btn"].addEventListener('click', function(e) {
        console.log("joined game");
        if(playerSelf === null) {
            playerSelf = new Player(mainmenu["joinBtn"]["playerName"].value, socket.id);
        }
        socket.emit('join game', mainmenu["joinBtn"]["gameCode"].value, playerSelf.ID, playerSelf.name);
    })
    mainmenu["createBtn"]["btn"].addEventListener('click', function(e) {
        if(mainmenu["createBtn"]["gameCode"].value === "") {
            alert("Please enter a code for your game");
        }
        else {
            playerSelf = new Player(mainmenu["createBtn"]["playerName"].value, socket.id);
            game = new Game();
            socket.emit('create game', mainmenu["createBtn"]["gameCode"].value, playerSelf.ID, playerSelf.name);
        }
    })

    socket.on("join game", (gameResult, playerID, playerName) => {
        if(gameResult === "nonfound") {
            alert("no game with code given, try again");
        }
        else {
            if(game === null) { //self joining to creator
                enemyIndex = 0;
                code = mainmenu["joinBtn"]["gameCode"].value;
                playerEnemy = new Player(playerName, playerID);
                game = new Game();
                game.AddPlayer(playerSelf.ID, playerSelf);
                // game.AddPlayer(playerEnemy.ID, playerEnemy);
                initializeGameCheck();
            }
            else { //for creator to add enemy
                enemyIndex = 1;
                playerEnemy = new Player(playerName, playerID);
                game.AddPlayer(playerSelf.ID, playerSelf);
                // game.AddPlayer(playerEnemy.ID, playerEnemy);
            }
        }
    })

    socket.on("create game", (gameCode, playerID, playerName) => {
        if(gameCode === 'success') {
            code = mainmenu["createBtn"]["gameCode"].value;
            initializeGameCheck();
        }
        else if(gameCode === 'nonunique') {
            alert("game code already in use, try a different code");
        }
    })

    socket.on("player join", (id, name) => {
        playerEnemy = new Player(name, id);
        
    })
    socket.on("option selected", (id, option, gameCode) => {
        enemyReady();
        game.selectedOption(id, option);
    });
    socket.on("player disconnect", () => {
        console.log("just disconnected");
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
    constructor() {
        this.players = {
        }

        this.isSetup = false;
        this.winnerText = document.getElementById("winner-text");
    }

    AddPlayer(newPlayerID, newPlayer) {
        console.log("new player asdded!", newPlayer);
        this.players[newPlayerID] = newPlayer;
    }

    gameSetup() {
        const player1Name = document.getElementById("player1-name");
        player1Name.textContent = playerSelf.name;
        
        
        const player2Name = document.getElementById("player2-name");
        player2Name.textContent = playerEnemy.name;
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
        console.log(this.players);
        console.log(playerID);
        this.players[playerID].setOption(option);
        if(this.playersReady()) {
            this.checkWinner();
        }
    }

    checkWinner() {
        if(this.players[playerSelf.ID].getOption() !== null && this.players[playerEnemy.ID].getOption() !== null) {
            const selfOption = this.players[playerSelf.ID].getOption().trim();
            const enemyOption = this.players[playerEnemy.ID].getOption().trim();
            if(selfOption === enemyOption) {
                this.winnerText.textContent = "Tie";
                console.log("TIE");
            }
            //WIN LOSS found match found for player 1 - player 1 wins
            else if(WIN_DICT[selfOption] === enemyOption) {
                this.players[playerSelf.ID].addWin();
                scoreTexts[0].textContent = this.players[playerSelf.ID].getWins();
                this.players[playerEnemy.ID].addLoss();
                this.winnerText.textContent = `You won! Next Round Starting Soon...`;
            }
            else if(WIN_DICT[enemyOption] === selfOption) {
                this.players[playerEnemy.ID].addWin();
                this.players[playerSelf.ID].addLoss();
                scoreTexts[1].textContent = this.players[playerEnemy.ID].getWins();
                this.winnerText.textContent = `You Lost! Next Round Starting Soon...`;
            }
            else {
                console.log("ERROR IN CHECKING WINNER");
            }
            // this.resetRound();
            for(let btn of currentBtns) {
                // btn.disabled = true;  
            }
            setTimeout(this.resetRound.bind(this), 3000);
        }
    }

    resetRound() { 
        for(let btn of currentBtns) {
            // btn.disabled = false;  
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
        this.players[playerSelf.ID].resetOption();
        this.players[playerEnemy.ID].resetOption();
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
    
        currentSelectedBtn.classList.remove('selected');
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
    btn.classList.add('selected');
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
    console.log("enemy stastus:", playerEnemy);
    const waitScreen = document.getElementsByClassName('wait-container');
    const joinCreateScreen = document.getElementsByClassName('create-join-container');
    // const joinScreen = document.getElementsByClassName('join-container');
    // const createScreen = document.getElementsByClassName('create-game-container');
    // joinScreen[0].style.display = 'none';
    // createScreen[0].style.display = 'none';
    joinCreateScreen[0].style.display = "none";
    waitScreen[0].style.display = "flex";

    const checkPlayerEnemy = setInterval(() => {
        console.log("playerName: " + playerSelf);
        console.log("game:", game);
        if(playerEnemy !== null)
        {
            clearInterval(checkPlayerEnemy);
            waitScreen[0].style.display = "none";
            game.AddPlayer(playerEnemy.ID, playerEnemy);
            game.gameSetup();
            const gameScreen = document.getElementsByClassName("players-container");
            console.log(gameScreen);
            gameScreen[0].style.display = 'flex';
        }
    }, 3000);
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