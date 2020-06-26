import { getSample } from "./random.js";
import { getContentWidth, debounce } from "./utils.js";
import { getDifficultyParams } from "./difficulty.js";
import { reveal, flag, revealContent, getSurroundingSquares } from "./square.js";

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

    this.waitToStart();
    this.handleDifficultyChange();

    this.handleRevealedSquare();
    this.handleFlaggedSquare();
    this.handleRightClicks();
    this.handleLeftClicks();
    this.handleDoubleClicks();

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
    this.createGrid();

    this.elapsedTime = 0;
    clearInterval(this.timerInterval);

    this.tableBody.addEventListener(
      "click",
      e => {
        this.trackElapsedTime();
        this.placeBombs(e.target);
      },
      { once: true }
    );
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
    return (Date.now() - this.startTime) / 1000;
  }

  set elapsedTime(time) {
    this.timer.innerText = Math.min(Math.floor(time), 999);
  }

  trackElapsedTime() {
    let interval = setInterval(() => {
    this.startTime = Date.now();
    this.elapsedTime = this.elapsedTime;
      if (!this.gameOver) {
        this.elapsedTime = this.elapsedTime;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  handleRevealedSquare() {
    this.container.addEventListener("squareRevealed", e => {
      if (e.target.hasBomb) {
        this.revealAllBombs();
      } else if (this.hasPlayerWon()) {
        this.gameOver = true;
      }
    });
  }

  revealAllBombs() {
    this.bombs.forEach(revealContent);
    this.gameOver = true;
  }

  hasPlayerWon() {
    for (const square of this.squares) {
      if (!square.hasBomb && square.dataset.state !== "revealed") return false;
    }
    return true;
  }

  handleFlaggedSquare() {
    this.container.addEventListener("squareFlagged", e => {
      if (e.target.dataset.state === "flagged") this.bombsCounter--;
      else this.bombsCounter++;
    });
  }

  createGrid() {
    const { width, height, bombs } = getDifficultyParams();
    const newTable = createTable(width, height);
    this.tableBody.innerHTML = newTable;
    this.bombsCounter = bombs;
    this.resizeSquares(width);
  }

  handleDifficultyChange() {
    this.container.addEventListener("difficultyChanged", () => {
      this.createGrid();
    });
  }

  handleResize() {
    window.addEventListener(
      "resize",
      debounce(() => {
        const { width } = getDifficultyParams();
        this.resizeSquares(width);
      }, 100)
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
}

const mineSweeperGame = document.querySelector(".game");
const mineSweeper = new Minesweeper(mineSweeperGame);
