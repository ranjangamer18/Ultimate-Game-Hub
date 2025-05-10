document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    const slideBtn = document.getElementById('slideBtn');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('highScore');
    const coinsDisplay = document.getElementById('coins');
    const finalScoreDisplay = document.getElementById('finalScore');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const backButton = document.querySelector('.back-button');
    
    // Game variables
    let score = 0;
    let highScore = localStorage.getItem('runnerHighScore') || 0;
    let coins = localStorage.getItem('runnerCoins') || 0;
    let gameSpeed = 5;
    let gameRunning = false;
    let animationId;
    
    // Player properties
    const player = {
        x: 100,
        y: 300,
        width: 50,
        height: 80,
        speedY: 0,
        gravity: 0.4,
        jumpForce: -12,
        isJumping: false,
        isSliding: false,
        slideHeight: 40,
        normalHeight: 80
    };
    
    // Obstacles
    let obstacles = [];
    const obstacleTypes = [
        { width: 40, height: 60 }, // Small box
        { width: 60, height: 40 }, // Wide box
        { width: 30, height: 90 }  // Tall box
    ];
    
    // Coins
    let coinList = [];
    const coinSize = 20;
    
    // Game initialization
    highScoreDisplay.textContent = highScore;
    coinsDisplay.textContent = coins;
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    jumpBtn.addEventListener('click', jump);
    slideBtn.addEventListener('click', slide);
    backButton.addEventListener('click', () => window.location.href = 'index.html');
    
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        if ((e.key === ' ' || e.key === 'ArrowUp') && !player.isJumping) {
            jump();
        }
        
        if (e.key === 'ArrowDown' && !player.isSliding) {
            slide();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowDown' && player.isSliding) {
            player.isSliding = false;
            player.height = player.normalHeight;
        }
    });
    
    // Start game
    function startGame() {
        score = 0;
        gameSpeed = 5;
        obstacles = [];
        coinList = [];
        player.y = 300;
        player.isJumping = false;
        player.isSliding = false;
        player.height = player.normalHeight;
        player.speedY = 0;
        
        scoreDisplay.textContent = score;
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameRunning = true;
        
        // Start game loop
        animationId = requestAnimationFrame(gameLoop);
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem('runnerHighScore', highScore);
        }
        
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
        
        // Show rewarded ad if score is good
        if (score > 500) {
            showRewardedAd().then((rewardEarned) => {
                if (rewardEarned) {
                    coins += Math.floor(score / 10);
                    coinsDisplay.textContent = coins;
                    localStorage.setItem('runnerCoins', coins);
                }
            });
        }
    }
    
    // Game loop
    function gameLoop() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        
        // Update and draw player
        updatePlayer();
        drawPlayer();
        
        // Update and draw obstacles
        updateObstacles();
        drawObstacles();
        
        // Update and draw coins
        updateCoins();
        drawCoins();
        
        // Increase difficulty
        gameSpeed += 0.002;
        score += 1;
        scoreDisplay.textContent = score;
        
        // Check for collisions
        if (checkCollisions()) {
            gameOver();
            return;
        }
        
        animationId = requestAnimationFrame(gameLoop);
    }
    
    // Draw background
    function drawBackground() {
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#74b9ff');
        skyGradient.addColorStop(1, '#a29bfe');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ground
        ctx.fillStyle = '#00b894';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        
        // Tracks
        ctx.fillStyle = '#2d3436';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(0, canvas.height - 60 + i * 20, canvas.width, 10);
        }
    }
    
    // Update player
    function updatePlayer() {
        // Apply gravity
        player.speedY += player.gravity;
        player.y += player.speedY;
        
        // Ground collision
        const groundY = canvas.height - 20 - player.height;
        if (player.y > groundY) {
            player.y = groundY;
            player.speedY = 0;
            player.isJumping = false;
        }
        
        // Stop sliding after some time
        if (player.isSliding && Math.random() < 0.02) {
            player.isSliding = false;
            player.height = player.normalHeight;
        }
    }
    
    // Draw player
    function drawPlayer() {
        ctx.fillStyle = '#fd79a8';
        
        if (player.isSliding) {
            // Draw sliding player
            ctx.fillRect(player.x, player.y + player.normalHeight - player.slideHeight, 
                         player.width, player.slideHeight);
            
            // Draw head while sliding
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.normalHeight - player.slideHeight - 15, 
                    15, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw standing player
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // Draw head
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y - 15, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Jump function
    function jump() {
        if (!player.isJumping) {
            player.speedY = player.jumpForce;
            player.isJumping = true;
            
            // Stop sliding if jumping
            player.isSliding = false;
            player.height = player.normalHeight;
        }
    }
    
    // Slide function
    function slide() {
        if (!player.isJumping && !player.isSliding) {
            player.isSliding = true;
            player.height = player.slideHeight;
        }
    }
    
    // Update obstacles
    function updateObstacles() {
        // Add new obstacles
        if (Math.random() < 0.01 * gameSpeed) {
            const type = Math.floor(Math.random() * obstacleTypes.length);
            obstacles.push({
                x: canvas.width,
                y: canvas.height - 20 - obstacleTypes[type].height,
                width: obstacleTypes[type].width,
                height: obstacleTypes[type].height,
                type: type
            });
        }
        
        // Move obstacles
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].x -= gameSpeed;
            
            // Remove off-screen obstacles
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
                i--;
            }
        }
    }
    
    // Draw obstacles
    function drawObstacles() {
        ctx.fillStyle = '#d63031';
        for (const obstacle of obstacles) {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
    
    // Update coins
    function updateCoins() {
        // Add new coins
        if (Math.random() < 0.02) {
            coinList.push({
                x: canvas.width,
                y: Math.random() * (canvas.height - 100) + 50,
                collected: false
            });
        }
        
        // Move coins
        for (let i = 0; i < coinList.length; i++) {
            if (!coinList[i].collected) {
                coinList[i].x -= gameSpeed;
                
                // Remove off-screen coins
                if (coinList[i].x + coinSize < 0) {
                    coinList.splice(i, 1);
                    i--;
                }
            }
        }
    }
    
    // Draw coins
    function drawCoins() {
        for (const coin of coinList) {
            if (!coin.collected) {
                ctx.beginPath();
                ctx.arc(coin.x + coinSize / 2, coin.y + coinSize / 2, coinSize / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#fdcb6e';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(coin.x + coinSize / 2, coin.y + coinSize / 2, coinSize / 3, 0, Math.PI * 2);
                ctx.fillStyle = '#ffeaa7';
                ctx.fill();
            }
        }
    }
    
    // Check collisions
    function checkCollisions() {
        // Player bounds
        const playerLeft = player.x;
        const playerRight = player.x + player.width;
        const playerTop = player.y;
        const playerBottom = player.y + player.height;
        
        // Check obstacle collisions
        for (const obstacle of obstacles) {
            const obstacleLeft = obstacle.x;
            const obstacleRight = obstacle.x + obstacle.width;
            const obstacleTop = obstacle.y;
            const obstacleBottom = obstacle.y + obstacle.height;
            
            if (
                playerRight > obstacleLeft &&
                playerLeft < obstacleRight &&
                playerBottom > obstacleTop &&
                playerTop < obstacleBottom
            ) {
                return true; // Collision detected
            }
        }
        
        // Check coin collisions
        for (let i = 0; i < coinList.length; i++) {
            if (!coinList[i].collected) {
                const coinLeft = coinList[i].x;
                const coinRight = coinList[i].x + coinSize;
                const coinTop = coinList[i].y;
                const coinBottom = coinList[i].y + coinSize;
                
                if (
                    playerRight > coinLeft &&
                    playerLeft < coinRight &&
                    playerBottom > coinTop &&
                    playerTop < coinBottom
                ) {
                    // Collect coin
                    coinList[i].collected = true;
                    coins += 1;
                    score += 50;
                    coinsDisplay.textContent = coins;
                    scoreDisplay.textContent = score;
                    localStorage.setItem('runnerCoins', coins);
                    
                    // Remove coin from array
                    setTimeout(() => {
                        const index = coinList.indexOf(coinList[i]);
                        if (index > -1) {
                            coinList.splice(index, 1);
                        }
                    }, 100);
                }
            }
        }
        
        return false; // No collision
    }
});