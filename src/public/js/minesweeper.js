import { getSample } from "./random.js";
import { confirmNewGame } from "./restart-game.js";
import { debounce, createTable } from "./utils.js";
import { getDifficultyParams, getDifficultyLevel } from "./difficulty.js";
import { flag, reveal, revealBomb, getSurroundingSquares } from "./square.js";

export class Minesweeper {
  constructor() {
    this.gameContainer = document.querySelector(".game");
    this.tableContainer = document.querySelector(".table-container");

    this.table = this.gameContainer.querySelector("table");
    this.tableBody = this.table.tBodies[0];

    this.timer = this.gameContainer.querySelector(".timer");
    this.smiley = this.gameContainer.querySelector(".smiley");
    this.counter = this.gameContainer.querySelector(".counter");

    this.resetGame();

    this.handleRevealedSquare();
    this.handleFlaggedSquare();
    this.handleRightClicks();
    this.handleLeftClicks();
    this.handleDoubleClicks();
    this.handleNewGames();
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


  startGame(clickedSquare) {
    this.game.started = true;
    this.trackElapsedTime();
    this.placeBombs(clickedSquare);
  }

  resetGame() {
    this.createBoard();
    this.game = { over: false, started: false };
    this.smiley.dataset.mood = "normal";
    this.elapsedTime = 0;
    clearInterval(this.timerInterval);
  }

  handleRightClicks() {
    this.table.addEventListener("click", e => {
      if (!this.game.started) {
        this.startGame(e.target);
        reveal(e.target);
      } else if (e.target.className === "square" && !this.game.over) {
        this.action(e.target);
      }
    });
  }

  handleLeftClicks() {
    this.table.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (e.target.className === "square" && !this.game.over) {
        flag(e.target);
      }
    });
  }

  handleDoubleClicks() {
    this.gameContainer.addEventListener("dblclick", e => {
      const square = e.target;

      if (square.dataset.state === "revealed" && !this.game.over) {
        const surroundingSquares = getSurroundingSquares(square);

        const nBombs = +square.dataset.squareContent;
        const nFlagged = surroundingSquares.filter(
          square => square.dataset.state === "flagged"
        ).length;

        // Only reveal surrounding squares if number of surrouding flags
        // equals/is greater than surrounding bombs
        if (nFlagged >= nBombs) {
          surroundingSquares.forEach(reveal);
        }
      }
    });
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
    this.gameContainer.addEventListener("bombRevealed", e => {
      this.game.over = true;
      this.revealAllBombs();
      this.smiley.dataset.mood = "sad";
      this.recordGame({ victory: false });
    });

    this.gameContainer.addEventListener("squareRevealed", e => {
      if (this.areAllNonBombsRevealed()) {
        this.game.over = true;
        this.smiley.dataset.mood = "cool";
        this.recordGame({ victory: true });
      }
    });
  }

  async recordGame({ victory }) {
    try {
      await fetch("/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          width: this.width,
          height: this.height,
          bombs: this.bombsCounter,
          time: this.elapsedTime,
          level: getDifficultyLevel(),
          victory: victory
        })
      });
    } catch (err) {
      throw err;
    }
  }

  revealAllBombs() {
    this.bombs.forEach(revealBomb);
  }

  areAllNonBombsRevealed() {
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

  handleNewGames() {
    document.addEventListener("newGame", e => {
      if (this.game.over || e.detail.force) {
        this.resetGame();
      } else if (!this.game.started) {
        this.createBoard();
      } else if (this.game.started && !this.game.over) {
        confirmNewGame();
      }
    });
  }

  createBoard() {
    const { width, height, bombs } = getDifficultyParams();

    this.width = width;
    this.height = height;

    const newTable = createTable(width, height);
    this.tableBody.innerHTML = newTable;
    this.bombsCounter = bombs;
    this.resizeSquares(width, height);
  }

  handleResize() {
    window.addEventListener(
      "resize",
      debounce(() => {
        this.resizeSquares(this.width);
      }, 200)
    );
  }

  resizeSquares(width) {
    let dimension = this.getSquaresSize(width);
    for (const square of this.squares) {
      square.style.width = dimension + "px";
      square.style.height = dimension + "px";
    }
  }

  getSquaresSize(width) {
    const { clientWidth } = this.tableContainer;
    return Math.min(25, clientWidth / width);
  }
}
