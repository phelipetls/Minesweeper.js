import { confirmRestartGame } from "./restart-game.js";
import { getSample } from "./random.js";
import { getContentWidth, debounce } from "./utils.js";
import { getDifficultyParams } from "./difficulty.js";
import {
  reveal,
  flag,
  revealContent,
  getSurroundingSquares
} from "./square.js";

function createTable(width, height) {
  const tableCells = `<td class="square"></td>`.repeat(width);
  return `<tr>${tableCells}</tr>`.repeat(height);
}

class Minesweeper {
  constructor() {
    this.gameContainer = document.querySelector(".game");
    this.tableContainer = document.querySelector(".minesweeper-container");

    this.table = this.gameContainer.querySelector(".minesweeper");
    this.tableBody = this.table.tBodies[0];

    this.timer = this.gameContainer.querySelector(".timer");
    this.smiley = this.gameContainer.querySelector(".smiley");
    this.counter = this.gameContainer.querySelector(".counter");

    this.waitToStart();

    this.handleRevealedSquare();
    this.handleFlaggedSquare();
    this.handleRightClicks();
    this.handleLeftClicks();
    this.handleDoubleClicks();

    this.handleResize();
    this.handleNewGameRequest();
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
    this.gameContainer.addEventListener("click", e => {
      if (e.target.tagName === "TD" && !this.game.over) {
        reveal(e.target);
      }
    });
  }

  handleLeftClicks() {
    this.gameContainer.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (e.target.tagName === "TD" && !this.game.over) {
        flag(e.target);
      }
    });
  }

  handleDoubleClicks() {
    this.gameContainer.addEventListener("dblclick", e => {
      const square = e.target;
      if (square.dataset.state === "revealed" && !this.game.over) {
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
    this.game = { over: false, started: false };
    this.smiley.textContent = "😀";
    this.createGrid();

    this.elapsedTime = 0;
    clearInterval(this.timerInterval);

    this.tableBody.addEventListener(
      "click",
      e => {
        this.game.started = true;
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
    this.counter.innerText = "".padStart.call(number, 2, "0");
  }

  get elapsedTime() {
    return (Date.now() - this.startTime) / 1000;
  }

  set elapsedTime(time) {
    const displayTime = Math.min(Math.floor(time), 999);
    const formattedTime = "".padStart.call(displayTime, 3, "0");
    this.timer.innerText = formattedTime;
  }

  trackElapsedTime() {
    this.startTime = Date.now();
    this.elapsedTime = this.elapsedTime;

    this.timerInterval = setInterval(() => {
      if (!this.game.over) {
        this.elapsedTime = this.elapsedTime;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  handleRevealedSquare() {
    this.gameContainer.addEventListener("squareRevealed", e => {
      if (e.target.hasBomb) {
        this.revealAllBombs();
        this.game.over = true;
        this.smiley.textContent = "😵";
      } else if (this.allNonBombsRevealed()) {
        this.game.over = true;
        this.smiley.textContent = "😎";
      }
    });
  }

  revealAllBombs() {
    this.bombs.forEach(revealContent);
  }

  allNonBombsRevealed() {
    for (const square of this.squares) {
      if (!square.hasBomb && square.dataset.state !== "revealed") return false;
    }
    return true;
  }

  handleFlaggedSquare() {
    this.gameContainer.addEventListener("squareFlagged", e => {
      if (e.target.dataset.state === "flagged") this.bombsCounter--;
      else this.bombsCounter++;
    });
  }

  createGrid() {
    const { width, height, bombs } = getDifficultyParams();
    const newTable = createTable(width, height);
    this.tableBody.innerHTML = newTable;
    this.bombsCounter = bombs;
    this.resizeSquares(width, height);
  }

  handleResize() {
    window.addEventListener(
      "resize",
      debounce(() => {
        const { width, height } = getDifficultyParams();
        this.resizeSquares(width, height);
      }, 100)
    );
  }

  resizeSquares(width, height) {
    let dimension = this.getSquaresDimension(width, height);
    for (const square of this.squares) {
      square.style.width = dimension + "px";
      square.style.height = dimension + "px";
    }
  }

  getSquaresDimension(width, height) {
    const { clientWidth } = this.gameContainer;
    const { clientHeight } = this.tableContainer;
    return Math.min(25, clientWidth / width, clientHeight / height);
  }

  handleNewGameRequest() {
    this.gameContainer.addEventListener("newGameRequest", () => {
      this.askForNewGame();
    });

    this.gameContainer.addEventListener("restartGameConfirmed", () => {
      this.waitToStart();
    });
  }

  askForNewGame() {
    if (this.game.started && !this.game.over) {
      confirmRestartGame();
    } else if (this.game.over) {
      this.waitToStart();
    } else if (!this.game.started) {
      this.createGrid();
    }
  }
}

new Minesweeper();
