import { getSample } from './random.js';
import { getContentWidth, debounce } from './utils.js';
import { reveal, flag, getSurroundingSquares } from './square.js';

function createTable(width, height) {
  const tableCells = `<td class="square"></td>`.repeat(width);
  return `<tr>${tableCells}</tr>`.repeat(height);
}

class Minesweeper {
  constructor(container) {
    this.container = container;

    this.table = container.querySelector(".minesweeper");
    this.tableBody = this.table.tBodies[0];

    this.timer = container.querySelector(".timer");
    this.counter = container.querySelector(".counter");

    this.difficultyMenu = container.querySelector("select#difficulty");

    this.waitToStart();

    this.handleRevealedSquare();
    this.handleFlaggedSquare();

    this.changeDifficulty();
    this.handleRightClicks();
    this.handleLeftClicks();
    this.handleDoubleClicks();
    this.handleDifficultyChange();
    this.handleResize();
  }

  get rows() {
    return Array.from(this.tableBody.rows);
  }

  get squares() {
    return this.rows.flatMap(row => Array.from(row.cells));
  }

  get bombs() {
    return this.squares.filter(square => square.hasBomb);
  }


  handleRightClicks() {
    this.container.addEventListener("click", e => {
      if (e.target.tagName === "TD" && !this.gameOver) {
        reveal(e.target);
      }
    });
  }

  handleLeftClicks() {
    this.container.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (e.target.tagName === "TD" && !this.gameOver) {
        flag(e.target);
      }
    });
  }

  handleDoubleClicks() {
    this.container.addEventListener("dblclick", e => {
      const square = e.target;
      if (square.dataset.state === "revealed" && !this.gameOver) {
        // Only reveal surrounding squares if number of flagged squares is
        // greater than or equal to the number of surrounding bombs
        const surrounding = getSurroundingSquares(square);
        const nBombs = +square.dataset.squareContent;
        const nFlagged = surrounding.filter(
          square => square.dataset.state === "flagged"
        ).length;

        if (nFlagged >= nBombs) {
          surrounding.map(square => reveal(square));
        }
      }
    });
  }

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

  placeBombs(clickedSquare) {
    const sampleSquares = getSample(
      this.squares.filter(square => square !== clickedSquare),
      this.bombsCounter
    );

    for (const square of sampleSquares) {
      square.hasBomb = true;
    }
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

  handleRevealedSquare() {
    this.container.addEventListener("squareRevealed", (e) => {
      if (e.target.hasBomb) {
        this.revealAllBombs()
      } else if (this.hasPlayerWon()) {
        this.gameOver = true;
      }
    })
  }

  revealAllBombs() {
    this.bombs.map(bomb => reveal(bomb));
    this.gameOver = true;
  }

  hasPlayerWon() {
    for (const square of this.squares) {
      // If a non-bomb square is not yet revealed
      // then the game is not over
      if (!square.hasBomb && square.dataset.state !== "revealed") return false;
    }
    return true;
  }

  handleFlaggedSquare() {
    this.container.addEventListener("squareFlagged", (e) => {
      if (e.target.dataset.state === "flagged") this.bombsCounter--;
      else this.bombsCounter++;
    })
  }

  handleDifficultyChange() {
    this.difficultyMenu.addEventListener("change", e => {
      this.changeDifficulty();

      if (e.target.value !== "custom") {
        document.querySelector(".params").style.display = "";
      } else {
        document.querySelector(".params").style.display = "none";
      }
    });
  }

  changeDifficulty() {
    const level = this.difficultyMenu.value;
    const { width, height, bombs } = this.getDifficultyParams(level);
    const newTable = createTable(width, height);
    this.tableBody.innerHTML = newTable;
    this.bombsCounter = bombs;
    this.resizeSquares(width, height);
  }

  handleResize() {
    window.addEventListener(
      "resize",
      debounce(() => {
        this.changeDifficulty();
      }, 200)
    );
  }

  resizeSquares(width) {
    const desiredWidth = Math.min(25, this.container.clientWidth / width);
    const desiredHeight = desiredWidth;
    for (const square of this.squares) {
      square.style.width = desiredWidth + "px";
      square.style.height = desiredHeight + "px";
      square.style.fontSize = getContentWidth(this.squares[0]) + "px";
    }
  }

  getDifficultyParams(level) {
    if (level === "custom") {
      const [width, height, bombs] = document.querySelectorAll(".param input");
      return { width: width.value, height: height.value, bombs: bombs.value };
    } else {
      return this.difficulties[level];
    }
  }

  difficulties = {
    easy: { width: 9, height: 9, bombs: 10 },
    medium: { width: 16, height: 16, bombs: 40 },
    hard: { width: 30, height: 16, bombs: 99 }
  };
}

const mineSweeperGame = document.querySelector(".game");
const mineSweeper = new Minesweeper(mineSweeperGame);

// Hide forms for grid parameters if difficulty level is not custom
if (document.querySelector(".difficulty-menu").value === "custom") {
  document.querySelector(".params").style.display = "none";
}
