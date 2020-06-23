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
  const tableCells = `<td class="mine"></td>`.repeat(width);
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
    this.difficulty = this.difficultyMenu.value;

    this.waitToStart();
    this.handleRightClicks();
    this.handleLeftClicks();
    this.handleDoubleClicks();
    this.handleDifficultyChange();
  }

  handleDifficultyChange() {
    this.difficultyMenu.addEventListener("change", (e) => {
      this.difficulty = e.target.value;
    })
  }

  get difficulty() {
    return this.difficulty.value;
  }

  set difficulty(level) {
    const {width, height, bombs } = this.difficulties[level];
    const newTable = createTable(width, height);
    this.tableBody.innerHTML = newTable;
    this.bombsCounter = bombs;
    this.resizeMines(width, height);
  }

  resizeMines(width) {
    const desiredWidth = Math.min(25, this.container.clientWidth / width);
    const desiredHeight = desiredWidth;
    for (const mine of this.mines) {
      mine.style.width = desiredWidth + "px";
      mine.style.height = desiredHeight + "px";
      mine.style.fontSize = getContentWidth(this.mines[0]) + "px";
    }
  }

  difficulties = {
    "easy": { width: 9, height: 9, bombs: 10 },
    "medium": { width: 16, height: 16, bombs: 40 },
    "hard": { width: 30, height: 16, bombs: 99 },
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

  handleRightClicks() {
    this.container.addEventListener("click", (e) => {
      if (e.target.tagName === "TD" && !this.gameOver) {
        this.dig(e.target);
      }
    });
  }

  handleLeftClicks() {
    this.container.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (e.target.tagName === "TD" && !this.gameOver) {
        this.flag(e.target);
      }
    });
  }

  handleDoubleClicks() {
    this.container.addEventListener("dblclick", (e) => {
      if (e.target.dataset.state === "revealed" && !this.gameOver) {
        getSurroundingMines(e.target).map(mine => this.dig(mine));
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

  get mines() {
    return this.rows.flatMap(row => Array.from(row.cells));
  }

  dig(mine) {
    if (mine.dataset.state) return;

    if (mine.hasBomb) {
      this.revealAllBombs();
    } else {
      reveal(mine);
    }
  }

  placeBombs(clickedMine) {
    const sampleMines = getSample(
      this.mines.filter(mine => mine !== clickedMine),
      this.bombsCounter
    );

    for (const mine of sampleMines) {
      mine.hasBomb = true;
    }
  }

  get bombs() {
    return this.mines.filter(mine => mine.hasBomb);
  }

  revealAllBombs() {
    this.bombs.map(reveal);
    this.gameOver = true;
  }

  flag(mine) {
    if (mine.dataset.state === "revealed") return;

    if (!mine.dataset.state) {
      mine.dataset.state = "flagged";
      this.bombsCounter -= 1;
    } else if (mine.dataset.state === "flagged") {
      mine.dataset.state = "question";
      this.bombsCounter += 1;
    } else if (mine.dataset.state === "question") {
      mine.dataset.state = "";
    }
  }
}

function getAdjacentMines(mine) {
  return [mine.previousElementSibling, mine, mine.nextElementSibling];
}

function getMines(mine, direction) {
  const row = mine.parentElement[direction];
  if (!row || !row.matches("tr")) return [];
  return getAdjacentMines(row.cells[mine.cellIndex]);
}

function getMinesBelow(mine) {
  return getMines(mine, "nextElementSibling");
}

function getMinesAbove(mine) {
  return getMines(mine, "previousElementSibling");
}

function getSurroundingMines(clickedMine) {
  return [
    ...getMinesAbove(clickedMine),
    ...getMinesBelow(clickedMine),
    clickedMine.previousElementSibling,
    clickedMine.nextElementSibling
  ].filter(Boolean);
}

function countSurroundingBombs(mine) {
  return getSurroundingMines(mine).filter(mine => mine.hasBomb).length;
}

function isEmpty(mine) {
  return countSurroundingBombs(mine) === 0;
}

function reveal(mine) {
  mine.dataset.state = "revealed";

  if (mine.hasBomb) {
    mine.dataset.mineContent = "bomb";
  } else if (isEmpty(mine)) {
    getSurroundingMines(mine).map(mine => mineSweeper.dig(mine));
  } else {
    mine.dataset.mineContent = countSurroundingBombs(mine);
  }
}

const mineSweeperGame = document.querySelector(".game");
const mineSweeper = new Minesweeper(mineSweeperGame);
