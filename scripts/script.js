'use strict';

const board = document.querySelector('#game-board');

let snake = [{x: 10, y: 10}];

function draw() {
    board.innerHTML = '';
    drawSnake();
}

function drawSnake() {
    snake.forEach((segment) => {
        const snakeElement = createGameElement('div', 'snake');

    })
}

function createGameElement(tag, className) {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}