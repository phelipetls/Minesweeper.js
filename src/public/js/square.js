const bombRevealed = new CustomEvent("bombRevealed", { bubbles: true });
const squareRevealed = new CustomEvent("squareRevealed", { bubbles: true });
const squareFlagged = new CustomEvent("squareFlagged", { bubbles: true });

export function reveal(square) {
  if (square.dataset.state) return;

  square.dataset.state = "revealed";

  if (square.hasBomb) {
    revealBomb(square);
    square.dispatchEvent(bombRevealed);
  } else if (hasNoSurroundingBombs(square)) {
    getSurroundingSquares(square).map(reveal);
  } else {
    square.dataset.squareContent = countSurroundingBombs(square);
    square.dispatchEvent(squareRevealed);
  }
}

export function revealBomb(square) {
  square.setAttribute("bomb", "bomb");
}

export function flag(square) {
  if (square.dataset.state === "revealed") return;

  if (!square.dataset.state) {
    square.dataset.state = "flagged";
  } else if (square.dataset.state === "flagged") {
    square.dataset.state = "question";
  } else if (square.dataset.state === "question") {
    square.dataset.state = "";
  }

  if (square.dataset.state) {
    square.dispatchEvent(squareFlagged);
  }
}

export function revealSurroundingSquares(square) {
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

export function getSurroundingSquares(clickedSquare) {
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

function hasNoSurroundingBombs(square) {
  return countSurroundingBombs(square) === 0;
}
