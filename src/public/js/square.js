const squareRevealed = new CustomEvent("squareRevealed", { bubbles: true });
const squareFlagged = new CustomEvent("squareFlagged", { bubbles: true });

export function reveal(square) {
  revealContent(square);
  square.dispatchEvent(squareRevealed);
}

export function revealContent(square) {
  if (square.dataset.state) return;
  square.dataset.state = "revealed";

  if (square.hasBomb) {
    square.dataset.squareContent = "bomb";
  } else if (isEmpty(square)) {
    getSurroundingSquares(square).map(revealContent);
  } else {
    square.dataset.squareContent = countSurroundingBombs(square);
  }
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

function isEmpty(square) {
  return countSurroundingBombs(square) === 0;
}
