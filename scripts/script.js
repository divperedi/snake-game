'use strict';

import { users } from './users.js';

window.addEventListener('load', () => {
    document.querySelector('#create').addEventListener('click', registerUser);
    document.querySelector('#play').addEventListener('click', validateLogin);
    document.querySelectorAll('#loginToggle, #registrationToggle').forEach(btn => btn.addEventListener('click', toggleForms));
    gameArea.style.display = 'none';
    logo.style.display = 'none';
    instructionText.style.display = 'none';
});

const board = document.querySelector('#game-board');
const instructionText = document.querySelector('#instruction-text');
const logo = document.querySelector('#logo');
const score = document.querySelector('#score');
const highScoreText = document.querySelector('#highScore');
let currentUser = {};
const loginMsg = document.querySelector('#loginMsg');

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let highScore = 0;
let direction = 'right';
let gameInterval;
let gameSpeedDelay = 300;
let gameStarted = false;
let formWrapper = document.querySelector('#formWrapper');
let formRegistration = document.querySelector('#formRegistration');
let gameArea = document.querySelector('#gameArea');

function getUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    return JSON.parse(localStorage.getItem('users'));

}

function addUser(username, password) {
    localStorage.setItem(
        'users',
        JSON.stringify([
            ...getUsers(),
            {
                name: username,
                password: password,
                id: getUsers()[getUsers().length - 1]?.id + 1 || 1,
            },
        ])
    );
}

function setCurrentUser(userId) {
    currentUser =
        getUsers().filter((user) => user.id === userId)[0] || {};
}

function toggleForms(event) {
    if (event) {
        event.preventDefault();
    }

    document.querySelectorAll('#formLogin, #formRegistration').forEach(div => div.classList.toggle('main__form--hidden'));
}

function registerUser(event) {
    event.preventDefault();
    const message = document.querySelector('#registrationMsg');

    const username = document.querySelector('#registerUsername').value;
    const password = document.querySelector('#registerPassword').value;
    const passwordAgain = document.querySelector('#registerPasswordAgain').value;

    if (username.length === 0 || password.length === 0 || passwordAgain.length === 0) {
        message.textContent = 'You must fill in all information!';
    }
    else {
        // console.log(getUsers());
        if (getUsers().some((user) => user.name === username)) {
            message.textContent = 'The user already exists!';
        } else if (password !== passwordAgain) {
            message.textContent = 'The password does not match!';
        } else {
            addUser(username, password);

            loginMsg.textContent = 'User created!';
            toggleForms();
        }

    }
}

function toggleFormDivs() {
    document.querySelector('#formWrapper').classList.toggle('main__form-wrapper--hidden');
}

function validateLogin(event) {
    event.preventDefault();
    formWrapper.style.display = 'none';
    // formRegistration.style.display = 'none';
    gameArea.style.display = 'block';
    logo.style.display = 'block';
    instructionText.style.display = 'block';
    
    const userName = document.querySelector('#loginUsername').value; 
    const passWord = document.querySelector('#loginPassword').value; 
    const question = document.querySelector('#question').checked; 

    try {
        if (userName === '') {
            throw {
                'nodeRef': document.querySelector('#loginUsername'), 
                'msg': 'Username is required!'
            };
        }
        if (passWord === '') {
            throw {
                'nodeRef': document.querySelector('#loginPassword'), 
                'msg': 'Password is required!' 
            };
        }
        if (!question) {
            throw {
                'nodeRef': document.querySelector('#question'), 
                'msg': 'Confirm that you are ready to go back to 90s!' 
            };
        }
        const users = getUsers();
        const user = users.find(user => user.name === userName && user.password === passWord); 
        if (!user) {
            throw {
                'nodeRef': document.querySelector('#loginUsername'),
                'msg': 'Invalid username or password!' 
            };
        }
        currentUser = user;
        startGame();
        return true; 


    } catch (error) {
       loginMsg.textContent = error.msg; 
        return false; 
    }
}

function draw() {
    board.innerHTML = '';
    drawSnake();
    drawFood();
    updateScore();
}

function drawSnake() {
    snake.forEach((segment) => {
        const snakeElement = createGameElement('div', 'snake');
        setPosition(snakeElement, segment);
        board.appendChild(snakeElement);
    })
}

function createGameElement(tag, className) {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

function setPosition(element, position) {
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;
}

// draw();

function drawFood() {
    if (gameStarted) {
        const foodElement = createGameElement('div', 'food');
        setPosition(foodElement, food);
        board.appendChild(foodElement);
    }
}

function generateFood() {
    const x = Math.floor(Math.random() * gridSize) + 1;
    const y = Math.floor(Math.random() * gridSize) + 1;
    return { x, y };
}

function move() {
    const head = { ...snake[0] };
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

    snake.unshift(head);

    // snake.pop();

    if (head.x === food.x && head.y === food.y) {
        food = generateFood();
        increaseSpeed();
        clearInterval(gameInterval);
        gameInterval = setInterval(() => {
            move();
            checkCollision();
            draw();
        }, gameSpeedDelay);
    } else {
        snake.pop();
    }
}

// setInterval(() => {
//     move();
//     draw();
// }, 200)

function startGame() {
    toggleFormDivs();
    gameStarted = true;
    instructionText.style.display = 'none';
    logo.style.display = 'none';
    formWrapper.style.display = 'none';
    formRegistration.style.display = 'none';
    gameInterval = setInterval(() => {
        move();
        checkCollision();
        draw();
    }, gameSpeedDelay)
}

function handleKeyPress(event) {
    if (
        (!gameStarted && event.code === 'Space') ||
        (!gameStarted && event.code === ' ')) {
        startGame();
    } else {
        switch (event.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
        }
    }
}

document.addEventListener('keydown', handleKeyPress);


function increaseSpeed() {
    if (gameSpeedDelay > 200) {
        gameSpeedDelay -= 5;
    } else if (gameSpeedDelay > 150) {
        gameSpeedDelay -= 3;
    } else if (gameSpeedDelay > 100) {
        gameSpeedDelay -= 2;
    } else if (gameSpeedDelay > 50) {
        gameSpeedDelay -= 1;
    }
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
        resetGame();
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            resetGame();
        }
    }
}

function resetGame() {
    updateHighScore();
    stopGame();
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = 'right';
    gameSpeedDelay = 300;
    updateScore();
}

function updateScore() {
    const currentScore = snake.length - 1;
    score.textContent = currentScore.toString().padStart(3, '0');
    // loginMsg.textContent = `${currentUser.name} you ate ` + currentScore + ` pieces!`;
}

function stopGame() {
    clearInterval(gameInterval);
    gameStarted = false;
    instructionText.style.display = 'block';
    logo.style.display = 'block';
    clearGameBoard();
}



function clearGameBoard() {
    const snakeElements = document.querySelectorAll('.snake');
    const foodElement = document.querySelector('.food');

    snakeElements.forEach(element => {
        element.remove();
    });

    if (foodElement) {
        foodElement.remove();
    }
}

function updateHighScore() {
    const currentScore = snake.length - 1;
    if (currentScore > highScore) {
        highScore = currentScore;
        highScoreText.textContent = highScore.toString().padStart(3, '0');
    }
    highScoreText.style.display = 'block';
}