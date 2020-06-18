function getRandomNumber(limit) {
  return Math.floor(Math.random() * limit);
}

function getSample(arr, k) {
  const sample = [];
  for (let i = 0; i < k; i++) {
    const n = getRandomNumber(arr.length);
    sample.push(arr[n]);
  }
  return sample;
}

class Minesweeper {
  constructor(elem) {
    this.placeBombs();
    this.tableBody = elem.tBodies[0];
  }

  get rows() {
    return Array.from(this.tableBody.rows);
  }

  get mines() {
    return this.rows.flatMap(row => Array.from(row.cells));
  }


    }
  }

  placeBombs() {
    const sampleMines = getSample(this.mines, 10);

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

function dig(mine) {
  if (mine.hasAttribute("flagged") || mine.hasAttribute("revealed")) return;

  if (mine.hasBomb) {
    if (mineSweeper.isFirstGuess) {
      mine.hasBomb = false;
      getSurroundingMines(mine).find(mine => !mine.hasBomb).hasBomb = true;
    } else {
      mineSweeper.revealAllBombs();
    }
  } else {
    reveal(mine);
  }
}
function reveal(mine) {
  mine.setAttribute("revealed", "");

  if (mine.hasBomb) {
    mine.dataset.mineContent = "bomb";
  } else if (isEmpty(mine)) {
    getSurroundingMines(mine).map(dig);
  } else {
    mine.dataset.mineContent = countSurroundingBombs(mine);
  }
}

function flag(mine) {
  if (mine.hasAttribute("revealed")) return;
  mine.toggleAttribute("flagged");
}

const mineSweeperElem = document.querySelector(".minesweeper");
const mineSweeper = new Minesweeper(mineSweeperElem);

mineSweeperElem.addEventListener("mousedown", function(e) {
  if (mineSweeper.gameOver) return;

  const mine = e.target;

  if (mine.tagName !== "TD") return;

  if (e.button === 0) {
    dig(mine);
  } else if (e.button === 2) {
    flag(mine);
  }

});

mineSweeperElem.addEventListener("dblclick", function(e) {
  if (mineSweeper.gameOver) return;
  getSurroundingMines(e.target).map(dig);
mineSweeperElem.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});
