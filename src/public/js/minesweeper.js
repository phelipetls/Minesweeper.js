import { getSample } from "./random.js";
import { confirmNewGame } from "./restart-game.js";
import { createTable, isTouchScreen } from "./utils.js";
import { getDifficultyParams, getDifficultyLevel } from "./difficulty.js";
import { flag, reveal, revealBomb, revealSurroundingSquares } from "./square.js";

export class Minesweeper {
  constructor() {
    this.gameContainer = document.querySelector(".game");
    this.tableContainer = document.querySelector(".table-container");

    this.table = this.gameContainer.querySelector("table");
    this.tableBody = this.table.tBodies[0];

    this.timer = this.gameContainer.querySelector(".timer");
    this.smiley = this.gameContainer.querySelector(".smiley");
    this.bombsCounter = this.gameContainer.querySelector(".bombs-counter");

    this.resetGame();

    this.handleRevealedSquare();
    this.handleFlaggedSquare();
    this.handleRightClicks();
    this.handleLeftClicks();
    this.handleDoubleClicks();
    this.handleTouchScreen();
    this.handleTouchHold();
    this.handleNewGames();
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

  handleLeftClicks() {
    this.table.addEventListener("click", e => {
      if (e.target.tagName !== "TD") return;
      this.revealSquare(e.target);
    });
  }

  handleTouchHold() {
    if (!isTouchScreen) return;

    this.table.addEventListener("pointerdown", e => {
      e.preventDefault();

      if (
        e.pointerType !== "touch" ||
        e.target.className !== "square" ||
        this.game.over
      )
        return;

      const clickedElem = e.target;

      const timeout = setTimeout(() => {
        if (!this.game.started) this.startGame();
        reveal(clickedElem);
        window.navigator.vibrate(200);
      }, 750);

      const removeTimeout = () => clearTimeout(timeout);

      clickedElem.addEventListener("pointerup", removeTimeout, { once: true });
      clickedElem.addEventListener("pointerleave", removeTimeout, { once: true });
    });
  }

  revealSquare(square) {
    if (!this.game.started) {
      this.startGame(square);
      reveal(square);
    } else if (square.className === "square" && !this.game.over) {
      if (isTouchScreen()) this.revealSquareTouch(square);
      else reveal(square);
    }
  }

  revealSquareTouch(square) {
    if (square.dataset.state === "revealed") revealSurroundingSquares(square);
    else this.clickAction(square);
  }

  handleRightClicks() {
    this.table.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (e.button === 2 && e.target.className === "square" && !this.game.over) {
        flag(e.target);
      }
    });
  }

  handleDoubleClicks() {
    this.table.addEventListener("dblclick", e => {
      const square = e.target;

      if (square.dataset.state === "revealed" && !this.game.over) {
        revealSurroundingSquares(square);
      }
    });
  }

  placeBombs(clickedSquare) {
    const sampleSquares = getSample(
      this.squares.filter(square => square !== clickedSquare),
      this.totalBombs
    );

    for (const square of sampleSquares) {
      square.hasBomb = true;
    }
  }

  get bombsLeft() {
    return Number(this.bombsCounter.innerText);
  }

  set bombsLeft(number) {
    this.bombsCounter.innerText = "".padStart.call(number, 2, "0");
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
      e.target.classList.add("trigger-bomb");
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
          bombs: this.totalBombs,
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
      if (e.target.dataset.state === "flagged") this.bombsLeft--;
      else this.bombsLeft++;
    });
  }

  handleNewGames() {
    document.addEventListener("newGame", e => {
      if (this.game.over || e.detail.newGameConfirmed) {
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
    this.totalBombs = bombs;

    const newTable = createTable(width, height);
    this.tableBody.innerHTML = newTable;
    this.bombsLeft = bombs;
  }

  handleTouchScreen() {
    if (isTouchScreen()) {
      this.handleTouchActionChange();
    }
  }

  get clickAction() {
    return this.clickActionButton.dataset.action === "reveal" ? reveal : flag;
  }

  handleTouchActionChange() {
    this.clickActionButton = this.gameContainer.querySelector(".touch-action");
    this.clickActionButton.removeAttribute("hidden");
    this.clickActionButton.addEventListener("click", e => {
      if (e.target.dataset.action === "reveal") {
        e.target.dataset.action = "flag";
        e.target.src = "../images/bxs-flag-alt.svg";
      } else {
        e.target.dataset.action = "reveal";
        e.target.src = "../images/bxs-bomb.svg";
      }
    });
  }
}
