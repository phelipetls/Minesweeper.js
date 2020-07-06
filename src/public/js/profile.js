const sortFuncs = {
  string: (a, b) => a.localeCompare(b),
  number: (a, b) => a - b,
  percent: (a, b) => parseFloat(a) - parseFloat(b)
};

function getRowValue(row, column) {
  return row.cells[column].textContent;
}

function getColumnType(rows, column) {
  const [firstRow] = rows;
  const firstValue = getRowValue(firstRow, column);
  if (!isNaN(firstValue)) {
    return "number";
  } else if (firstValue.includes("%")) {
    return "percent";
  } else {
    return "string";
  }
}

function getSortFunc(type) {
  const sortFunc = sortFunc[type];
}

function removeSortAttributes(header) {
  Array.from(header.cells).forEach(cell => {
    cell.removeAttribute("data-sort");
  });
}

let lastClicked;

document.addEventListener("click", e => {
  if (!e.target.matches("thead th")) return;

  const tableBody = e.target.closest("table").tBodies[0];
  const rows = tableBody.rows;
  const column = e.target.cellIndex;

  let sortedRows;

  if (e.target === lastClicked) {
    e.target.dataset.sort = e.target.dataset.sort === "asc" ? "desc" : "asc";

    sortedRows = Array.from(rows).reverse();
  } else {
    removeSortAttributes(e.target.parentElement);

    const type = getColumnType(rows, column);
    const sortFunc = sortFuncs[type];

    sortedRows = Array.from(rows).sort((rowA, rowB) => {
      return sortFunc(getRowValue(rowA, column), getRowValue(rowB, column));
    });

    e.target.dataset.sort = "asc";
    lastClicked = e.target;
  }

  tableBody.append(...sortedRows);
});

document.addEventListener("mousedown", e => {
  if (!e.target.matches("thead th")) return;
  e.preventDefault();
});
