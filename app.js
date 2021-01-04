document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".start-button");
  const scoreDisplay = document.querySelector(".score-display");
  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 20;
  const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;
  const grid = createGrid();
  let squares = Array.from(document.querySelectorAll(".grid div"));
  let nextRandom = 0;
  let timerId;
  let score = 0;
  const colors = ["teal", "silver", "purple", "yellow", "blue"];

  function createGrid() {
    // the main grid
    let grid = document.querySelector(".grid");
    for (let i = 0; i < GRID_SIZE; i++) {
      let gridElement = document.createElement("div");
      grid.appendChild(gridElement);
    }

    // set base of grid
    for (let i = 0; i < GRID_WIDTH; i++) {
      let gridElement = document.createElement("div");
      gridElement.setAttribute("class", "taken");
      grid.appendChild(gridElement);
    }

    let nextGrid = document.querySelector(".next-grid");
    // Since 16 is the max grid size in which all the Tetrominoes
    // can fit in we create one here
    for (let i = 0; i < 16; i++) {
      let gridElement = document.createElement("div");
      nextGrid.appendChild(gridElement);
    }
    return grid;
  }

  const lTetromino = [
    [1, 2, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
    [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 2],
    [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 2],
    [GRID_WIDTH, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1, GRID_WIDTH * 2 + 2],
  ];
  const zTetromino = [
    [0, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
    [GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1],
    [0, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
    [GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1],
  ];

  const tTetromino = [
    [1, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2],
    [1, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 1],
    [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 1],
    [1, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
    [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
    [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
    [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
  ];

  const iTetromino = [
    [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 3 + 1],
    [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH + 3],
    [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 3 + 1],
    [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH + 3],
  ];

  const theTetrominoes = [
    lTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ];

  let currentPosition = 4;
  let currentRotation = 0;

  // randomly select a Tetromino in its first rotation
  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];

  // draw the tetromino
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
      squares[currentPosition + index].style.backgroundColor = colors[random];
    });
  }

  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
      squares[currentPosition + index].style.backgroundColor = "";
    });
  }

  // assign function to keyCodes
  function control(e) {
    if (e.keyCode === 37) {
      e.preventDefault();
      moveLeft();
    } else if (e.keyCode === 38) {
      e.preventDefault();
      rotate();
    } else if (e.keyCode === 39) {
      e.preventDefault();
      moveRight();
    } else if (e.keyCode === 40) {
      e.preventDefault();
      moveDown();
    }
  }

  document.addEventListener("keydown", control);

  // move down function
  function moveDown() {
    undraw();
    currentPosition += GRID_WIDTH;
    draw();
    freeze();
  }

  function freeze() {
    if (
      current.some((index) =>
        squares[currentPosition + index + GRID_WIDTH].classList.contains(
          "taken"
        )
      )
    ) {
      current.forEach((index) =>
        squares[currentPosition + index].classList.add("taken")
      );
      // start a new tetromino falling
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
    }
  }

  // move to the left unless at edge or there is a blockage
  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % GRID_WIDTH === 0
    );
    if (!isAtLeftEdge) {
      currentPosition -= 1;
    }
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition += 1;
    }
    draw();
  }
  // move to the right unless at edge or there is a blockage
  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(
      (index) => (currentPosition + index) % GRID_WIDTH === GRID_WIDTH - 1
    );
    if (!isAtRightEdge) {
      currentPosition += 1;
    }
    if (
      current.some((index) => {
        return squares[currentPosition + index].classList.contains("taken");
      })
    ) {
      currentPosition -= 1;
    }
    draw();
  }

  // rotate tetrimino unless blocked
  function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) {
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation];
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      ) ||
      (current.some(
        (index) => (currentPosition + index) % GRID_WIDTH === GRID_WIDTH - 1
      ) &&
        current.some((index) => (currentPosition + index) % GRID_WIDTH === 0))
    ) {
      console.log("bam");
      currentRotation--;
      if (currentRotation < 0) {
        currentRotation = current.length;
      }
      current = theTetrominoes[random][currentRotation];
    }
    draw();
  }

  // show next tetromino in mini-grid
  const displaySquares = document.querySelectorAll(".next-grid div");
  const displayWidth = 4;
  const displayIndex = 0;
  // the Tetrominoes without rotations
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
    [1, displayWidth, displayWidth + 1, displayWidth + 2],
    [0, 1, displayWidth, displayWidth + 1],
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
  ];

  // display the shap in minigrid
  function displayShape() {
    // remove any trace of tetromino from the entire grid
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.backgroundColor = "";
    });
    upNextTetrominoes[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add("tetromino");
      displaySquares[displayIndex + index].style.backgroundColor =
        colors[nextRandom];
    });
  }

  // add start functionality to start button
  startButton.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, 1000);
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
      gameOver();
    }
  });

  // add scores
  function addScore() {
    for (let i = 0; i < 199; i += GRID_WIDTH) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];

      if (row.every((index) => squares[index].classList.contains("taken"))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
          squares[index].style.backgroundColor = "";
        });
        const squaresRemoved = squares.splice(i, GRID_WIDTH);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.append(cell));
      }
    }
  }

  // game over
  function gameOver() {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      scoreDisplay.innerHTML = "end";
      clearInterval(timerId);
    }
  }
});
