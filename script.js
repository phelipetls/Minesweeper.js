function getRandomNumber(limit) {
  return Math.floor(Math.random() * limit);
}

function getSample(arr, k) {
  const sample = [];
  for (let i = 0; i < k; i++) {
    const n = getRandomNumber(arr.length);
    const [extractedItem] = arr.splice(n, 1);
    sample.push(extractedItem);
  }
  return sample;
}

function getContentWidth(elem) {
  const { paddingLeft, paddingRight } = getComputedStyle(elem);
  return elem.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
}

function createTable(width, height) {
  const tableCells = `<td class="square"></td>`.repeat(width);
  return `<tr>${tableCells}</tr>`.repeat(height);
}

function debounce(func, ms) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), ms);
  }
}

class Minesweeper {
  constructor(container) {
    this.container = container;

    this.table = container.querySelector(".minesweeper");
    this.tableBody = this.table.tBodies[0];

    this.timer = container.querySelector(".timer");
    this.counter = container.querySelector(".counter");

    this.difficultyMenu = container.querySelector("select#difficulty");

    this.changeDifficulty(this.difficultyMenu.value);
    this.waitToStart();
    this.handleRightClicks();
    this.handleLeftClicks();
    this.handleDoubleClicks();
    this.handleDifficultyChange();
    this.handleResize();
  }

  handleDifficultyChange() {
    this.difficultyMenu.addEventListener("change", e => {
      this.changeDifficulty(e.target.value);
    });
  }

  changeDifficulty(level) {
    const { width, height, bombs } = this.difficulties[level];
    const newTable = createTable(width, height);
    this.tableBody.innerHTML = newTable;
    this.bombsCounter = bombs;
    this.resizeSquares(width, height);
  }

  resizeSquares(width) {
    const desiredWidth = this.container.clientWidth / width;
    const desiredHeight = desiredWidth;
    for (const square of this.squares) {
      square.style.width = desiredWidth + "px";
      square.style.height = desiredHeight + "px";
      square.style.fontSize = getContentWidth(this.squares[0]) + "px";
    }
  }

  handleResize() {
    window.addEventListener("resize", debounce(() => {
      console.log(this.difficultyMenu.value);
      this.changeDifficulty(this.difficultyMenu.value)
    }))
  }

  difficulties = {
    easy: { width: 9, height: 9, bombs: 10 },
    medium: { width: 16, height: 16, bombs: 40 },
    hard: { width: 30, height: 16, bombs: 99 }
  };

  waitToStart() {
    this.tableBody.addEventListener(
      "click",
      e => {
        this.startGame(e.target);
      },
      { once: true }
    );
  }

  startGame(firstClick) {
    this.timerStart = Date.now();
    this.trackElapsedTime();
    this.placeBombs(firstClick);
  }

  handleRightClicks() {
    this.container.addEventListener("click", e => {
      if (e.target.tagName === "TD" && !this.gameOver) {
        this.dig(e.target);
      }
    });
  }

  handleLeftClicks() {
    this.container.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (e.target.tagName === "TD" && !this.gameOver) {
        this.flag(e.target);
      }
    });
  }

  handleDoubleClicks() {
    this.container.addEventListener("dblclick", e => {
      const square = e.target;
      if (square.dataset.state === "revealed" && !this.gameOver) {
        const surrounding = getSurroundingSquares(square);
        const nBombs = +square.dataset.squareContent;
        const nFlagged = surrounding.filter(
          square => square.dataset.state === "flagged"
        ).length;

        // only reveal surrounding squares if number of flagged
        // squares is greater or equal to number of surrounding bombs
        if (nFlagged >= nBombs) {
          surrounding.map(square => this.dig(square));
        }
      }
    });
  }

  get bombsCounter() {
    return Number(this.counter.innerText);
  }

  set bombsCounter(number) {
    this.counter.innerText = number;
  }

  get elapsedTime() {
    return (Date.now() - this.timerStart) / 1000;
  }

  getFormattedElapsedTime() {
    return Math.min(Math.floor(this.elapsedTime), 999);
  }

  trackElapsedTime() {
    this.timer.innerText = this.getFormattedElapsedTime();
    let interval = setInterval(() => {
      if (!this.gameOver) {
        this.timer.innerText = this.getFormattedElapsedTime();
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  get rows() {
    return Array.from(this.tableBody.rows);
  }

  get squares() {
    return this.rows.flatMap(row => Array.from(row.cells));
  }

  dig(square) {
    if (square.dataset.state) return;

    if (square.hasBomb) {
      this.revealAllBombs();
    } else {
      this.reveal(square);
      if (this.hasPlayerWon()) {
        this.gameOver = true;
      }
    }
  }

  placeBombs(clickedSquare) {
    const sampleSquares = getSample(
      this.squares.filter(square => square !== clickedSquare),
      this.bombsCounter
    );

    for (const square of sampleSquares) {
      square.hasBomb = true;
    }
  }

  get bombs() {
    return this.squares.filter(square => square.hasBomb);
  }

  revealAllBombs() {
    this.bombs.map(bomb => this.reveal(bomb));
    this.gameOver = true;
  }

  get nonBombs() {
    return this.squares.filter(square => !square.hasBomb);
  }

  hasPlayerWon() {
    for (const square of this.squares) {
      // If some square is not a bomb and is not yet revealed
      // then player needs to reveal
      if (!square.hasBomb && square.dataset.state !== "revealed") return false;
    }
    return true;
  }

  reveal(square) {
    square.dataset.state = "revealed";

    if (square.hasBomb) {
      square.dataset.squareContent = "bomb";
    } else if (isEmpty(square)) {
      getSurroundingSquares(square).map(square => mineSweeper.dig(square));
    } else {
      square.dataset.squareContent = countSurroundingBombs(square);
    }
  }

  flag(square) {
    if (square.dataset.state === "revealed") return;

    if (!square.dataset.state) {
      square.dataset.state = "flagged";
      this.bombsCounter -= 1;
    } else if (square.dataset.state === "flagged") {
      square.dataset.state = "question";
      this.bombsCounter += 1;
    } else if (square.dataset.state === "question") {
      square.dataset.state = "";
    }
  }
}

function getAdjacentSquares(square) {
  return [square.previousElementSibling, square, square.nextElementSibling];
}

function getSquares(square, direction) {
  const row = square.parentElement[direction];
  if (!row || !row.matches("tr")) return [];
  return getAdjacentSquares(row.cells[square.cellIndex]);
}

function getSquaresBelow(square) {
  return getSquares(square, "nextElementSibling");
}

function getSquaresAbove(square) {
  return getSquares(square, "previousElementSibling");
}

function getSurroundingSquares(clickedSquare) {
  return [
    ...getSquaresAbove(clickedSquare),
    ...getSquaresBelow(clickedSquare),
    clickedSquare.previousElementSibling,
    clickedSquare.nextElementSibling
  ].filter(Boolean);
}

function countSurroundingBombs(square) {
  return getSurroundingSquares(square).filter(square => square.hasBomb).length;
}

function isEmpty(square) {
  return countSurroundingBombs(square) === 0;
}

const mineSweeperGame = document.querySelector(".game");
const mineSweeper = new Minesweeper(mineSweeperGame);
