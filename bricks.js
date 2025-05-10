document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const winDemoBtn = document.getElementById('winDemoBtn');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const levelDisplay = document.getElementById('level');
    const backButton = document.querySelector('.back-button');
    
    // Game variables
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let animationId;
    
    // Paddle properties
    const paddleWidth = 100;
    const paddleHeight = 15;
    const paddleStartX = (canvas.width - paddleWidth) / 2;
    let paddleX = paddleStartX;
    let rightPressed = false;
    let leftPressed = false;
    
    // Ball properties
    const ballRadius = 10;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;
    let ballSpeedX = 5;
    let ballSpeedY = -5;
    
    // Brick properties
    const brickRowCount = 5;
    const brickColumnCount = 9;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 60;
    const brickOffsetLeft = 30;
    
    let bricks = [];
    
    // Initialize bricks
    function initBricks() {
        bricks = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
    }
    
    // Event listeners
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    startBtn.addEventListener('click', startGame);
    winDemoBtn.addEventListener('click', winDemo);
    backButton.addEventListener('click', () => window.location.href = 'index.html');
    
    // Key handlers
    function keyDownHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = true;
        }
    }
    
    function keyUpHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = false;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = false;
        }
    }
    
    // Mouse handler
    function mouseMoveHandler(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > paddleWidth / 2 && relativeX < canvas.width - paddleWidth / 2) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }
    
    // Collision detection
    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const brick = bricks[c][r];
                if (brick.status === 1) {
                    if (
                        ballX > brick.x &&
                        ballX < brick.x + brickWidth &&
                        ballY > brick.y &&
                        ballY < brick.y + brickHeight
                    ) {
                        ballSpeedY = -ballSpeedY;
                        brick.status = 0;
                        score += 10;
                        scoreDisplay.textContent = score;
                        
                        // Check if all bricks are cleared
                        if (checkLevelComplete()) {
                            levelComplete();
                        }
                    }
                }
            }
        }
    }
    
    // Check if level is complete
    function checkLevelComplete() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Level complete handler
    function levelComplete() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        
        // Show rewarded ad
        showRewardedAd().then((rewardEarned) => {
            level++;
            levelDisplay.textContent = level;
            
            // Increase difficulty
            ballSpeedX *= 1.1;
            ballSpeedY *= 1.1;
            
            // Reset for next level
            resetBallAndPaddle();
            initBricks();
            
            if (rewardEarned) {
                lives++; // Bonus life for watching ad
                livesDisplay.textContent = lives;
            }
            
            startGame();
        });
    }
    
    // Draw bricks
    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = `hsl(${(c * 30 + r * 10) % 360}, 80%, 50%)`;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
    
    // Draw paddle
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = '#6c5ce7';
        ctx.fill();
        ctx.closePath();
    }
    
    // Draw ball
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fd79a8';
        ctx.fill();
        ctx.closePath();
    }
    
    // Main draw function
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw game elements
        drawBricks();
        drawPaddle();
        drawBall();
        collisionDetection();
        
        // Ball collision with walls
        if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
            ballSpeedX = -ballSpeedX;
        }
        
        if (ballY + ballSpeedY < ballRadius) {
            ballSpeedY = -ballSpeedY;
        } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
            // Ball hits bottom
            if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                // Ball hits paddle
                ballSpeedY = -ballSpeedY;
                
                // Add some angle based on where it hits the paddle
                const hitPosition = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
                ballSpeedX = hitPosition * 7;
            } else {
                // Ball misses paddle
                lives--;
                livesDisplay.textContent = lives;
                
                if (lives <= 0) {
                    gameOver();
                    return;
                } else {
                    resetBallAndPaddle();
                }
            }
        }
        
        // Move paddle
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
        
        // Move ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        animationId = requestAnimationFrame(draw);
    }
    
    // Reset ball and paddle
    function resetBallAndPaddle() {
        ballX = canvas.width / 2;
        ballY = canvas.height - 30;
        ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        ballSpeedY = -5;
        paddleX = (canvas.width - paddleWidth) / 2;
    }
    
    // Start game
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            initBricks();
            resetBallAndPaddle();
            draw();
            startBtn.textContent = 'Restart Game';
        } else {
            // Reset game
            score = 0;
            lives = 3;
            level = 1;
            scoreDisplay.textContent = score;
            livesDisplay.textContent = lives;
            levelDisplay.textContent = level;
            ballSpeedX = 5;
            ballSpeedY = -5;
            initBricks();
            resetBallAndPaddle();
        }
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        
        ctx.font = '40px Arial';
        ctx.fillStyle = '#d63031';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 70);
    }
    
    // Win demo
    function winDemo() {
        startGame();
        
        // Clear all bricks
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r].status = 0;
            }
        }
        
        // Set score to nearly complete
        score = brickRowCount * brickColumnCount * 10 - 10;
        scoreDisplay.textContent = score;
        
        // Position ball to hit last brick
        bricks[0][0].status = 1;
        ballX = bricks[0][0].x + brickWidth / 2;
        ballY = bricks[0][0].y + brickHeight + ballRadius + 1;
        ballSpeedY = -5;
    }
});