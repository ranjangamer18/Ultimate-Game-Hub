// Game open counter for interstitial ads
let gameOpenCounter = 0;

// Open game with ad logic
function openGame(url) {
    gameOpenCounter++;
    
    // Show interstitial ad every 4th game open
    if (gameOpenCounter % 4 === 0) {
        showInterstitialAd().then(() => {
            navigateToGame(url);
        });
    } else {
        navigateToGame(url);
    }
}

// Navigate to game page
function navigateToGame(url) {
    // Add loading animation
    document.body.classList.add('page-transition');
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// Show interstitial ad
function showInterstitialAd() {
    return new Promise((resolve) => {
        // Create ad container
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-container interstitial';
        
        // Ad content
        adContainer.innerHTML = `
            <div class="ad-content">
                <div class="ad-header">
                    <span class="ad-badge">AD</span>
                    <h3>Interstitial Ad</h3>
                </div>
                <div class="ad-body">
                    <p>Simulated Unity Ad</p>
                    <p>Ad Unit: Interstitial_Android</p>
                    <p>Game ID: 5846818</p>
                </div>
                <div class="ad-timer">Closing in 3 seconds...</div>
            </div>
        `;
        
        document.body.appendChild(adContainer);
        
        // Countdown timer
        let seconds = 3;
        const timerElement = adContainer.querySelector('.ad-timer');
        const timerInterval = setInterval(() => {
            seconds--;
            timerElement.textContent = `Closing in ${seconds} second${seconds !== 1 ? 's' : ''}...`;
            
            if (seconds <= 0) {
                clearInterval(timerInterval);
                adContainer.classList.add('fade-out');
                setTimeout(() => {
                    adContainer.remove();
                    resolve();
                }, 500);
            }
        }, 1000);
    });
}

// Show rewarded ad
function showRewardedAd() {
    return new Promise((resolve) => {
        // Create ad container
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-container rewarded';
        
        // Ad content
        adContainer.innerHTML = `
            <div class="ad-content">
                <div class="ad-header">
                    <span class="ad-badge">REWARDED AD</span>
                    <h3>Rewarded Video</h3>
                </div>
                <div class="ad-body">
                    <p>Watch to earn rewards!</p>
                    <p>Simulated Unity Ad</p>
                    <p>Ad Unit: Rewarded_Android</p>
                    <p>Game ID: 5846818</p>
                </div>
                <div class="ad-controls">
                    <button class="ad-close">Skip Ad</button>
                    <button class="ad-watch">Watch Now</button>
                </div>
                <div class="ad-timer">30 seconds remaining</div>
            </div>
        `;
        
        document.body.appendChild(adContainer);
        
        // Countdown timer
        let seconds = 5;
        const timerElement = adContainer.querySelector('.ad-timer');
        const timerInterval = setInterval(() => {
            seconds--;
            timerElement.textContent = `${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
            
            if (seconds <= 0) {
                clearInterval(timerInterval);
                completeRewardedAd();
            }
        }, 1000);
        
        // Button handlers
        adContainer.querySelector('.ad-close').addEventListener('click', () => {
            clearInterval(timerInterval);
            adContainer.remove();
            resolve(false); // User skipped ad
        });
        
        adContainer.querySelector('.ad-watch').addEventListener('click', () => {
            clearInterval(timerInterval);
            completeRewardedAd();
        });
        
        function completeRewardedAd() {
            adContainer.classList.add('fade-out');
            setTimeout(() => {
                adContainer.remove();
                
                // Show reward message
                const rewardMessage = document.createElement('div');
                rewardMessage.className = 'reward-message';
                rewardMessage.innerHTML = `
                    <div class="reward-content">
                        <h3>🎉 Reward Earned!</h3>
                        <p>+100 Coins</p>
                        <p>+1 Power Boost</p>
                    </div>
                `;
                
                document.body.appendChild(rewardMessage);
                
                setTimeout(() => {
                    rewardMessage.classList.add('fade-out');
                    setTimeout(() => {
                        rewardMessage.remove();
                        resolve(true); // User completed ad
                    }, 1000);
                }, 2000);
            }, 500);
        }
    });
}

// Add styles for ads
const adStyles = document.createElement('style');
adStyles.textContent = `
    .ad-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.5s;
    }
    
    .ad-content {
        background-color: white;
        border-radius: 15px;
        padding: 25px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .ad-header {
        margin-bottom: 20px;
    }
    
    .ad-badge {
        background-color: #ff4757;
        color: white;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .rewarded .ad-badge {
        background-color: #00b894;
    }
    
    .ad-body {
        margin-bottom: 20px;
    }
    
    .ad-timer {
        font-size: 0.9rem;
        color: #666;
        margin-top: 15px;
    }
    
    .ad-controls {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
    }
    
    .ad-controls button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
    }
    
    .ad-close {
        background-color: #f1f2f6;
    }
    
    .ad-watch {
        background-color: #00b894;
        color: white;
    }
    
    .reward-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        text-align: center;
        animation: fadeIn 0.5s;
    }
    
    .reward-content h3 {
        color: #00b894;
        margin-bottom: 10px;
    }
    
    .reward-content p {
        margin: 5px 0;
    }
    
    .fade-out {
        animation: fadeOut 0.5s forwards;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .page-transition {
        animation: pageFadeOut 0.3s forwards;
    }
    
    @keyframes pageFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(adStyles);