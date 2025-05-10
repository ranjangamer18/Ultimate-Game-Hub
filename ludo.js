document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const board = document.getElementById('board');
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    const winDemoBtn = document.getElementById('winDemoBtn');
    const currentPlayerDisplay = document.getElementById('currentPlayer');
    const diceValueDisplay = document.getElementById('diceValue');
    const backButton = document.querySelector('.back-button');
    
    // Game variables
    const players = ['red', 'yellow', 'green', 'blue'];
    let currentPlayerIndex = 0;
    let diceValue = 0;
    let pieces = {};
    let selectedPiece = null;
    let gameActive = true;
    
    // Initialize game
    initGame();
    
    // Event listeners
    rollDiceBtn.addEventListener('click', rollDice);
    winDemoBtn.addEventListener('click', winDemo);
    backButton.addEventListener('click', () => window.location.href = 'index.html');
    
    // Initialize game board
    function initGame() {
        createBoard();
        createPieces();
        updateCurrentPlayerDisplay();
    }
    
    // Create Ludo board
    function createBoard() {
        // Clear board
        board.innerHTML = '';
        
        // Create cells
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = `${col * 12.5}%`;
                cell.style.top = `${row * 12.5}%`;
                
                // Set cell types
                if ((row === 0 || row === 7) && (col === 0 || col === 7)) {
                    // Corner home cells
                    cell.classList.add('home-cell');
                    if (row === 0 && col === 0) cell.classList.add('red');
                    if (row === 0 && col === 7) cell.classList.add('yellow');
                    if (row === 7 && col === 0) cell.classList.add('green');
                    if (row === 7 && col === 7) cell.classList.add('blue');
                } else if ((row === 1 && col === 1) || (row === 1 && col === 6) || 
                           (row === 6 && col === 1) || (row === 6 && col === 6)) {
                    // Start cells
                    cell.classList.add('start-cell');
                    if (row === 1 && col === 1) cell.classList.add('red');
                    if (row === 1 && col === 6) cell.classList.add('yellow');
                    if (row === 6 && col === 1) cell.classList.add('green');
                    if (row === 6 && col === 6) cell.classList.add('blue');
                } else if ((row === 0 && col === 3) || (row === 3 && col === 0) || 
                          (row === 0 && col === 4) || (row === 4 && col === 0) || 
                          (row === 3 && col === 7) || (row === 7 && col === 3) || 
                          (row === 4 && col === 7) || (row === 7 && col === 4) || 
                          (row === 3 && col === 3) || (row === 3 && col === 4) || 
                          (row === 4 && col === 3) || (row === 4 && col === 4)) {
                    // Safe cells
                    cell.classList.add('safe-cell');
                } else if ((row >= 1 && row <= 6 && col >= 1 && col <= 6)) {
                    // Path cells
                    cell.classList.add('path-cell');
                }
                
                board.appendChild(cell);
            }
        }
    }
    
    // Create pieces for each player
    function createPieces() {
        pieces = {
            red: [],
            yellow: [],
            green: [],
            blue: []
        };
        
        // Create 4 pieces for each player
        players.forEach(player => {
            for (let i = 0; i < 4; i++) {
                const piece = document.createElement('div');
                piece.className = `piece ${player}`;
                piece.dataset.player = player;
                piece.dataset.id = i;
                piece.dataset.position = 'home';
                
                // Find the player's home cell
                const homeCell = document.querySelector(`.home-cell.${player}`);
                homeCell.appendChild(piece);
                
                // Add click event
                piece.addEventListener('click', () => selectPiece(piece));
                
                pieces[player].push({
                    element: piece,
                    position: 'home',
                    pathIndex: -1
                });
            }
        });
    }
    
    // Select piece
    function selectPiece(piece) {
        const player = piece.dataset.player;
        
        // Only allow selecting current player's pieces
        if (players[currentPlayerIndex] !== player) return;
        
        // Only allow selecting if dice has been rolled
        if (diceValue === 0) return;
        
        // Deselect previously selected piece
        if (selectedPiece) {
            selectedPiece.element.classList.remove('selected');
        }
        
        // Select new piece
        selectedPiece = pieces[player][parseInt(piece.dataset.id)];
        piece.classList.add('selected');
    }
    
    // Roll dice
    function rollDice() {
        if (!gameActive) return;
        
        // Disable button while rolling
        rollDiceBtn.disabled = true;
        
        // Animate dice roll
        let rolls = 0;
        const maxRolls = 10;
        const rollInterval = setInterval(() => {
            diceValue = Math.floor(Math.random() * 6) + 1;
            diceValueDisplay.textContent = diceValue;
            rolls++;
            
            if (rolls >= maxRolls) {
                clearInterval(rollInterval);
                rollDiceBtn.disabled = false;
                
                // If no move possible, switch player
                if (!isMovePossible()) {
                    setTimeout(() => {
                        switchPlayer();
                    }, 1000);
                }
            }
        }, 100);
    }
    
    // Check if move is possible
    function isMovePossible() {
        const currentPlayer = players[currentPlayerIndex];
        const playerPieces = pieces[currentPlayer];
        
        // Check if any piece can move
        for (const piece of playerPieces) {
            if (piece.position === 'home' && diceValue === 6) {
                return true; // Can move out of home
            }
            
            if (piece.position === 'path' && piece.pathIndex + diceValue <= 56) {
                return true; // Can move along path
            }
            
            if (piece.position === 'path' && piece.pathIndex + diceValue > 56) {
                // Can enter home stretch
                return true;
            }
        }
        
        return false;
    }
    
    // Move selected piece
    function movePiece() {
        if (!selectedPiece || diceValue === 0) return;
        
        const currentPlayer = players[currentPlayerIndex];
        const piece = selectedPiece;
        
        if (piece.position === 'home' && diceValue === 6) {
            // Move out of home
            piece.position = 'path';
            piece.pathIndex = 0;
            updatePiecePosition(piece);
            
            // Check for win
            if (checkWin(currentPlayer)) {
                gameActive = false;
                showRewardedAd().then((rewardEarned) => {
                    alert(`${currentPlayer.toUpperCase()} wins! ${rewardEarned ? '+100 Coins!' : ''}`);
                });
                return;
            }
            
            // If rolled 6, player gets another turn
            if (diceValue === 6) {
                diceValue = 0;
                diceValueDisplay.textContent = '-';
                selectedPiece.element.classList.remove('selected');
                selectedPiece = null;
                return;
            }
        } else if (piece.position === 'path') {
            // Move along path
            if (piece.pathIndex + diceValue <= 56) {
                piece.pathIndex += diceValue;
                updatePiecePosition(piece);
            } else {
                // Try to enter home stretch
                const remainingSteps = 56 - piece.pathIndex;
                if (diceValue - remainingSteps <= 4) {
                    piece.pathIndex += diceValue;
                    updatePiecePosition(piece);
                }
            }
            
            // Check for win
            if (checkWin(currentPlayer)) {
                gameActive = false;
                showRewardedAd().then((rewardEarned) => {
                    alert(`${currentPlayer.toUpperCase()} wins! ${rewardEarned ? '+100 Coins!' : ''}`);
                });
                return;
            }
        }
        
        // Switch player
        diceValue = 0;
        diceValueDisplay.textContent = '-';
        selectedPiece.element.classList.remove('selected');
        selectedPiece = null;
        switchPlayer();
    }
    
    // Update piece position on board
    function updatePiecePosition(piece) {
        const path = getPlayerPath(piece.element.dataset.player);
        
        if (piece.position === 'home') {
            // Move to home cell
            const homeCell = document.querySelector(`.home-cell.${piece.element.dataset.player}`);
            homeCell.appendChild(piece.element);
        } else if (piece.position === 'path') {
            if (piece.pathIndex < path.length) {
                // Move to path cell
                const pathCell = document.querySelector(`.cell[data-row="${path[piece.pathIndex].row}"][data-col="${path[piece.pathIndex].col}"]`);
                pathCell.appendChild(piece.element);
            } else {
                // Move to home stretch
                const homeStretchIndex = piece.pathIndex - path.length;
                const homeStretchCell = document.querySelector(`.home-stretch.${piece.element.dataset.player}[data-index="${homeStretchIndex}"]`);
                if (homeStretchCell) {
                    homeStretchCell.appendChild(piece.element);
                } else {
                    // Piece reached the end
                    piece.position = 'finished';
                }
            }
        }
    }
    
    // Get player's path
    function getPlayerPath(player) {
        // Simplified path for demo purposes
        const path = [];
        
        if (player === 'red') {
            for (let col = 1; col <= 6; col++) path.push({row: 1, col});
            for (let row = 2; row <= 6; row++) path.push({row, col: 6});
        } else if (player === 'yellow') {
            for (let row = 1; row <= 6; row++) path.push({row, col: 6});
            for (let col = 5; col >= 1; col--) path.push({row: 6, col});
        } else if (player === 'green') {
            for (let col = 1; col <= 6; col++) path.push({row: 6, col});
            for (let row = 5; row >= 1; row--) path.push({row, col: 1});
        } else if (player === 'blue') {
            for (let row = 6; row >= 1; row--) path.push({row, col: 1});
            for (let col = 2; col <= 6; col++) path.push({row: 1, col});
        }
        
        return path;
    }
    
    // Switch to next player
    function switchPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateCurrentPlayerDisplay();
    }
    
    // Update current player display
    function updateCurrentPlayerDisplay() {
        currentPlayerDisplay.textContent = players[currentPlayerIndex].charAt(0).toUpperCase() + players[currentPlayerIndex].slice(1);
        currentPlayerDisplay.style.color = players[currentPlayerIndex] === 'red' ? '#d63031' :
                                         players[currentPlayerIndex] === 'yellow' ? '#fdcb6e' :
                                         players[currentPlayerIndex] === 'green' ? '#00b894' : '#0984e3';
    }
    
    // Check for win
    function checkWin(player) {
        return pieces[player].every(piece => piece.position === 'finished');
    }
    
    // Win demo
    function winDemo() {
        // Reset game
        gameActive = true;
        currentPlayerIndex = 0;
        diceValue = 0;
        selectedPiece = null;
        createPieces();
        updateCurrentPlayerDisplay();
        diceValueDisplay.textContent = '-';
        
        // Set up quick win for red player
        pieces.red.forEach((piece, index) => {
            piece.position = 'path';
            piece.pathIndex = 50 + index * 2; // Close to finish
            updatePiecePosition(piece);
        });
        
        // Set current player to red
        currentPlayerIndex = 0;
        updateCurrentPlayerDisplay();
        
        // Roll 6 to start
        diceValue = 6;
        diceValueDisplay.textContent = diceValue;
        
        // Select first piece
        selectedPiece = pieces.red[0];
        selectedPiece.element.classList.add('selected');
        
        // Move pieces to win
        setTimeout(() => {
            movePiece();
            
            setTimeout(() => {
                diceValue = 6;
                diceValueDisplay.textContent = diceValue;
                selectedPiece = pieces.red[1];
                selectedPiece.element.classList.add('selected');
                
                setTimeout(() => {
                    movePiece();
                    
                    // Continue until all pieces finish
                    // (In a real game, this would be more interactive)
                }, 1000);
            }, 1000);
        }, 1000);
    }
    
    // Add data attributes to cells for path finding
    document.querySelectorAll('.cell').forEach((cell, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        cell.dataset.row = row;
        cell.dataset.col = col;
    });
    
    // Create home stretch cells
    for (let i = 0; i < 4; i++) {
        const homeStretchRed = document.createElement('div');
        homeStretchRed.className = 'cell home-stretch red';
        homeStretchRed.dataset.index = i;
        homeStretchRed.style.left = `${(i + 1) * 12.5}%`;
        homeStretchRed.style.top = '0%';
        board.appendChild(homeStretchRed);
        
        const homeStretchYellow = document.createElement('div');
        homeStretchYellow.className = 'cell home-stretch yellow';
        homeStretchYellow.dataset.index = i;
        homeStretchYellow.style.left = `${(7 - i) * 12.5}%`;
        homeStretchYellow.style.top = `${(i + 1) * 12.5}%`;
        board.appendChild(homeStretchYellow);
        
        const homeStretchGreen = document.createElement('div');
        homeStretchGreen.className = 'cell home-stretch green';
        homeStretchGreen.dataset.index = i;
        homeStretchGreen.style.left = `${(i + 1) * 12.5}%`;
        homeStretchGreen.style.top = '87.5%';
        board.appendChild(homeStretchGreen);
        
        const homeStretchBlue = document.createElement('div');
        homeStretchBlue.className = 'cell home-stretch blue';
        homeStretchBlue.dataset.index = i;
        homeStretchBlue.style.left = '0%';
        homeStretchBlue.style.top = `${(7 - i) * 12.5}%`;
        board.appendChild(homeStretchBlue);
    }
});