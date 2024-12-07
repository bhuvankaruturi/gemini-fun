const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const overlay = document.getElementById('overlay');
const finalScoreDisplay = document.getElementById('finalScore');
const replayButton = document.getElementById('replayButton');
const pauseButton = document.getElementById('pauseButton'); // Get the pause button
const gameControls = document.querySelector('.game-controls');

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let direction = 'right';
let score = 0;
let foodValue = 0;
let totalFoodValue = 0;
let gameOver = false;
let isPaused = false;
let intervalId;
let initialSpeed = 100;
let speed = initialSpeed;
let isHighValueFood = false;
let blinkCounter = 0;
const blinkInterval = 5; // Number of frames for each blink color change
let inputQueue = []; // Array to act as the input queue

// --- Functions ---

function isValidFoodPosition(x, y) {
    // Check if food position overlaps with the snake's body
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === x && snake[i].y === y) {
            return false;
        }
    }
    return true;
}

function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize)),
        };
    } while (!isValidFoodPosition(food.x, food.y)); // Keep generating until a valid position is found

    // Assign specific colors and sizes to food values
    const randomValue = Math.random();
    if (randomValue < 0.6) {
        foodValue = 1;
        food.color = 'yellow';
        food.radius = gridSize / 3;
        isHighValueFood = false;
    } else if (randomValue < 0.85) {
        foodValue = 2;
        food.color = 'orange';
        food.radius = gridSize / 2.5;
        isHighValueFood = false;
    } else if (randomValue < 0.95) {
        foodValue = 3;
        food.color = 'red';
        food.radius = gridSize / 2;
        isHighValueFood = false;
    } else if (randomValue < 0.99) {
        foodValue = 4;
        food.color = 'purple';
        food.radius = gridSize / 1.8;
        isHighValueFood = true;
    } else {
        foodValue = 5;
        food.color = 'blue';
        food.radius = gridSize / 1.5;
        isHighValueFood = true;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? 'green' : 'lime';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

    // Draw food with specific color
    if (isHighValueFood) {
        blinkCounter++;
        if (blinkCounter % blinkInterval === 0) {
            const colors = ['purple', 'blue', 'cyan', 'magenta'];
            food.color = colors[Math.floor((blinkCounter / blinkInterval) % colors.length)];
        }
    }

    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, food.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function update() {
    if (gameOver || isPaused) return;

    // Process input queue
    if (inputQueue.length > 0) {
        const nextDirection = inputQueue.shift();

        // Only allow direction change if it's not the opposite of the current direction
        if (nextDirection === 'up' && direction !== 'down') {
            direction = 'up';
        } else if (nextDirection === 'down' && direction !== 'up') {
            direction = 'down';
        } else if (nextDirection === 'left' && direction !== 'right') {
            direction = 'left';
        } else if (nextDirection === 'right' && direction !== 'left') {
            direction = 'right';
        }
    }

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Wrap around the screen
    if (head.x < 0) head.x = canvas.width / gridSize - 1;
    if (head.x >= canvas.width / gridSize) head.x = 0;
    if (head.y < 0) head.y = canvas.height / gridSize - 1;
    if (head.y >= canvas.height / gridSize) head.y = 0;

    // Check for self-collision (game over)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            handleGameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += foodValue;
        totalFoodValue += foodValue;
        scoreDisplay.textContent = "Score: " + score;

        // Increase speed every 10 points
        if (score % 10 === 0) {
            speed = Math.max(25, speed - 10); // Increase speed, but don't go below 25ms
            clearInterval(intervalId);
            intervalId = setInterval(update, speed);
        }

        generateFood();

        // Grow snake
        if (totalFoodValue >= 5) {
            totalFoodValue -= 5;
        }
    } else {
        snake.pop();
    }

    draw();
}

function handleGameOver() {
    clearInterval(intervalId);
    finalScoreDisplay.textContent = "Score: " + score;
    overlay.style.display = "flex"; // Show overlay

    // Hide score and pause button
    gameControls.style.display = "none";
}

function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) {
        intervalId = setInterval(update, speed);
        pauseButton.textContent = "Pause"; // Update to "Pause" when unpausing
    } else {
        clearInterval(intervalId);
        pauseButton.textContent = "Play"; // Update to "Play" when pausing
    }
    inputQueue = []; // Clear input queue on pause/resume
}

// --- Event Listeners ---

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    // Add valid directions to the input queue
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            inputQueue.push('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            inputQueue.push('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            inputQueue.push('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            inputQueue.push('right');
            break;
        case ' ': // Spacebar for pause/resume
            togglePause();
            break;
    }
});

// Touch Controls (Swipe) - Unchanged from previous version

// --- Buttons ---

replayButton.addEventListener('click', startGame);

function addPauseButton() {
    pauseButton.textContent = 'Pause'; // Initialize the button text
    pauseButton.addEventListener('click', togglePause);
    gameControls.appendChild(pauseButton);
}

// --- Game setup ---

function setCanvasSize() {
    const maxWidth = Math.min(window.innerWidth, 700); // Max width on mobile
    const canvasWidth = Math.floor(maxWidth / gridSize) * gridSize; // Multiple of gridSize

    canvas.width = canvasWidth;
    canvas.height = canvasWidth;

    gameContainer.style.width = canvasWidth + 'px';
    // gameContainer.style.height = canvasWidth + 'px';
}

// --- Start Game ---

function startGame() {
    setCanvasSize();
    overlay.style.display = "none"; // Hide overlay
  
    // Initialize snake with 5 segments
    snake = [];
    for (let i = 4; i >= 0; i--) {
      snake.push({ x: 10 + i, y: 10 });
    }
  
    direction = 'right';
    score = 0;
    totalFoodValue = 0;
    gameOver = false;
    isPaused = false;
    speed = initialSpeed;
    scoreDisplay.textContent = "Score: " + score;
    generateFood();
    clearInterval(intervalId);
    intervalId = setInterval(update, speed);
    inputQueue = []; // Clear input queue on restart
  
    // Show score and pause button
    gameControls.style.display = "flex";
  }

window.addEventListener('resize', setCanvasSize);
addPauseButton();
startGame();