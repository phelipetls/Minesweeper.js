import "./navbar.js";
import "./fullscreen.js";
import { confirmRestartGame } from "./restart-game.js";
import { getSample } from "./random.js";
import { debounce } from "./utils.js";
import { getPlayerName } from "./record-game.js";
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
    this.createBoard();

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
        this.game.over = true;
        this.game.victory = false;
        this.smiley.textContent = "😵";
        this.revealAllBombs();
      } else if (this.allNonBombsRevealed()) {
        this.game.over = true;
        this.game.victory = true;
        this.smiley.textContent = "😎";
      }

      if (this.game.over) {
        this.recordGame();
      }
    });
  }

  async recordGame() {
    const playerName = getPlayerName();

    if (!playerName) return;

    const body = JSON.stringify({
      name: playerName,
      width: this.width,
      height: this.height,
      bombs: this.bombsCounter,
      time: this.elapsedTime,
      victory: this.game.victory,
    });

    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
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

  createBoard() {
    const { width, height, bombs } = getDifficultyParams();
    this.width = width;
    this.height = height;

    const newTable = createTable(width, height);
    this.tableBody.innerHTML = newTable;
    this.bombsCounter = bombs;
    this.resizeSquares(width, height);
  }

  handleNewGameRequest() {
    document.addEventListener("newGameRequest", () => {
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
      this.createBoard();
    }
  }

  handleResize() {
    window.addEventListener(
      "resize",
      debounce(() => {
        const { width, height } = getDifficultyParams();
        this.resizeSquares(width, height);
      }, 200)
    );
  }

  resizeSquares(width, height) {
    let dimension = this.divideSpacePerSquare(width, height);
    for (const square of this.squares) {
      square.style.width = dimension + "px";
      square.style.height = dimension + "px";
    }
  }

  divideSpacePerSquare(width, height) {
    if (this.gameContainer.parentElement.className === "fullscreen-wrapper") {
      return this.getSquaresSizeFullScreen(width, height);
    } else {
      return this.getSquaresSize(width, height);
    }
  }

  getSquaresSize(width, height) {
    const { clientWidth, clientHeight } = document.documentElement;
    const { clientWidth: gameWidth } = this.gameContainer;
    const { clientHeight: tableHeight } = this.tableContainer;
    if (clientWidth > clientHeight) {
      return Math.min(25, gameWidth / width, tableHeight / height);
    } else {
      return Math.min(25, gameWidth / width);
    }
  }

  getSquaresSizeFullScreen(width, height) {
    const gameContainerParent = this.gameContainer.parentElement;
    const bestWidth = gameContainerParent.clientWidth / width;
    const nonTableHeight =
      this.gameContainer.clientHeight - this.tableContainer.clientHeight;
    const bestHeight =
      (gameContainerParent.clientHeight - nonTableHeight) / height;
    return Math.min(25, bestWidth, bestHeight);
  }
}

new Minesweeper();

const aboutButton = document.querySelector(".about-btn");

aboutButton.onclick = function() {
  document.querySelector(".about").toggleAttribute("hidden");
};
