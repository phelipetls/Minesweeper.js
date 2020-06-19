function getRandomNumber(limit) {
  return Math.floor(Math.random() * limit);
}

function getSample(arr, k) {
  const sample = [];
  for (let i = 0; i < k; i++) {
    const n = getRandomNumber(arr.length);
    const [ extractedItem ] = arr.splice(n, 1);
    sample.push(extractedItem);
  }
  return sample;
}

function formatNumber(number) {
  return "".padStart.call(number, 3, "0");
}

class Minesweeper {
  constructor(table, timer, counter) {
    this.tableBody = table.tBodies[0];
    this.timer = timer;
    this.counter = counter;

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
    this.counter.innerText = formatNumber(this.bombs.length);
  }

  get elapsedTime() {
    return (Date.now() - this.timerStart) / 1000;
  }

  getFormattedElapsedTime() {
    const time = Math.min(Math.floor(this.elapsedTime), 999);
    return formatNumber(time);
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
    if (mine.hasAttribute("flagged") || mine.hasAttribute("revealed")) return;

    if (mine.hasBomb) {
      this.revealAllBombs();
    } else {
      reveal(mine);
    }
  }

  placeBombs(clickedMine) {
    const sampleMines = getSample(
      this.mines.filter(mine => mine !== clickedMine),
      30,
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
    alert(`You lost! At ${this.elapsedTime}`);
    this.gameOver = true;
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
  mine.setAttribute("revealed", "");

  if (mine.hasBomb) {
    mine.dataset.mineContent = "bomb";
  } else if (isEmpty(mine)) {
    getSurroundingMines(mine).map(mine => mineSweeper.dig(mine));
  } else {
    mine.dataset.mineContent = countSurroundingBombs(mine);
  }
}

function flag(mine) {
  if (mine.hasAttribute("revealed")) return;
  mine.toggleAttribute("flagged");
}

const mineSweeperTable = document.querySelector(".minesweeper");
const mineSweeperTimer = document.querySelector(".timer");
const mineSweeperCounter = document.querySelector(".counter");

const mineSweeper = new Minesweeper(
  mineSweeperTable,
  mineSweeperTimer,
  mineSweeperCounter
);

mineSweeperTable.addEventListener("click", function(e) {
  if (mineSweeper.gameOver || e.target.tagName !== "TD") return;
  mineSweeper.dig(e.target);
});

mineSweeperTable.addEventListener("contextmenu", function(e) {
  e.preventDefault();
  if (mineSweeper.gameOver || e.target.tagName !== "TD") return;
  flag(e.target);
});

mineSweeperTable.addEventListener("dblclick", function(e) {
  if (mineSweeper.gameOver) return;
  getSurroundingMines(e.target).map(mine => mineSweeper.dig(mine));
});
