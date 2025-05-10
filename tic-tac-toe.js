document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.querySelector('.status');
    const resetButton = document.getElementById('resetBtn');
    const demoButton = document.getElementById('demoBtn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const difficultySelect = document.getElementById('difficulty');
    const difficultyContainer = document.getElementById('difficultyContainer');
    const xScoreDisplay = document.getElementById('xScore');
    const oScoreDisplay = document.getElementById('oScore');
    const drawScoreDisplay = document.getElementById('drawScore');
    const backButton = document.querySelector('.back-button');
    
    // Game variables
    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameMode = 'human'; // 'human' or 'ai'
    let difficulty = 'medium'; // 'easy', 'medium', 'hard'
    let scores = { x: 0, o: 0, draw: 0 };
    
    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Event Listeners
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', resetGame);
    demoButton.addEventListener('click', triggerWinDemo);
    modeButtons.forEach(btn => btn.addEventListener('click', switchMode));
    difficultySelect.addEventListener('change', updateDifficulty);
    backButton.addEventListener('click', () => window.location.href = 'index.html');
    
    // Initialize game
    updateDifficulty();
    
    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell already used or game not active, ignore
        if (gameState[clickedCellIndex] !== '' || !gameActive) return;
        
        // Make human move
        makeMove(clickedCell, clickedCellIndex);
        
        // If game is still active and it's AI's turn
        if (gameActive && gameMode === 'ai' && currentPlayer === 'O') {
            setTimeout(() => {
                makeAIMove();
            }, 500);
        }
    }
    
    // Make a move
    function makeMove(cell, index) {
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        checkResult();
    }
    
    // Check game result
    function checkResult() {
        let roundWon = false;
        
        // Check for win
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') continue;
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                highlightWinningCells(winningConditions[i]);
                break;
            }
        }
        
        // If won
        if (roundWon) {
            endGame(false);
            updateScore(currentPlayer);
            statusDisplay.textContent = `Player ${currentPlayer} wins!`;
            
            // Show rewarded ad
            showRewardedAd().then((rewardEarned) => {
                if (rewardEarned) {
                    // Give extra rewards if ad was completed
                    statusDisplay.textContent = `Player ${currentPlayer} wins! +100 Coins!`;
                }
            });
            
            return;
        }
        
        // Check for draw
        if (!gameState.includes('')) {
            endGame(true);
            updateScore('draw');
            statusDisplay.textContent = 'Game ended in a draw!';
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
    }
    
    // Highlight winning cells
    function highlightWinningCells(winningCombo) {
        winningCombo.forEach(index => {
            document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning-cell');
        });
    }
    
    // End game
    function endGame(draw) {
        gameActive = false;
    }
    
    // Reset game
    function resetGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
    }
    
    // Update score
    function updateScore(winner) {
        if (winner === 'X') scores.x++;
        else if (winner === 'O') scores.o++;
        else scores.draw++;
        
        xScoreDisplay.textContent = scores.x;
        oScoreDisplay.textContent = scores.o;
        drawScoreDisplay.textContent = scores.draw;
    }
    
    // Switch game mode
    function switchMode(e) {
        gameMode = e.target.dataset.mode;
        
        // Update UI
        modeButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show/hide difficulty based on mode
        difficultyContainer.style.display = gameMode === 'ai' ? 'flex' : 'none';
        
        resetGame();
    }
    
    // Update difficulty
    function updateDifficulty() {
        difficulty = difficultySelect.value;
    }
    
    // AI move logic
    function makeAIMove() {
        let move;
        
        switch (difficulty) {
            case 'easy':
                move = getRandomMove();
                break;
            case 'medium':
                move = getMediumMove();
                break;
            case 'hard':
                move = getBestMove();
                break;
            default:
                move = getMediumMove();
        }
        
        if (move !== -1) {
            const aiCell = document.querySelector(`.cell[data-index="${move}"]`);
            makeMove(aiCell, move);
        }
    }
    
    // Get random move (easy)
    function getRandomMove() {
        const availableMoves = gameState
            .map((val, idx) => val === '' ? idx : -1)
            .filter(val => val !== -1);
        
        if (availableMoves.length > 0) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        return -1;
    }
    
    // Get medium move (tries to win or block)
    function getMediumMove() {
        // 1. Check for winning move
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'O';
                if (checkWin('O')) {
                    gameState[i] = '';
                    return i;
                }
                gameState[i] = '';
            }
        }
        
        // 2. Block opponent's winning move
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'X';
                if (checkWin('X')) {
                    gameState[i] = '';
                    return i;
                }
                gameState[i] = '';
            }
        }
        
        // 3. Take center if available
        if (gameState[4] === '') return 4;
        
        // 4. Take a random corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => gameState[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // 5. Take any available space
        return getRandomMove();
    }
    
    // Get best move (hard - minimax algorithm)
    function getBestMove() {
        let bestScore = -Infinity;
        let move;
        
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'O';
                let score = minimax(gameState, 0, false);
                gameState[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        
        return move;
    }
    
    // Minimax algorithm
    function minimax(board, depth, isMaximizing) {
        // Check for terminal states
        if (checkWin('O')) return 10 - depth;
        if (checkWin('X')) return depth - 10;
        if (!board.includes('')) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            
            return bestScore;
        } else {
            let bestScore = Infinity;
            
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            
            return bestScore;
        }
    }
    
    // Check win helper
    function checkWin(player) {
        return winningConditions.some(condition => {
            return condition.every(index => {
                return gameState[index] === player;
            });
        });
    }
    
    // Trigger win demo
    function triggerWinDemo() {
        resetGame();
        
        // Force a win scenario
        gameState[0] = 'X';
        document.querySelector('.cell[data-index="0"]').textContent = 'X';
        document.querySelector('.cell[data-index="0"]').classList.add('x');
        
        gameState[4] = 'O';
        document.querySelector('.cell[data-index="4"]').textContent = 'O';
        document.querySelector('.cell[data-index="4"]').classList.add('o');
        
        gameState[1] = 'X';
        document.querySelector('.cell[data-index="1"]').textContent = 'X';
        document.querySelector('.cell[data-index="1"]').classList.add('x');
        
        gameState[6] = 'O';
        document.querySelector('.cell[data-index="6"]').textContent = 'O';
        document.querySelector('.cell[data-index="6"]').classList.add('o');
        
        currentPlayer = 'X';
        gameState[2] = 'X';
        document.querySelector('.cell[data-index="2"]').textContent = 'X';
        document.querySelector('.cell[data-index="2"]').classList.add('x');
        
        checkResult();
    }
});