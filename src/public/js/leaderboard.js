const selectDifficulty = document.querySelector("select#difficulty");
const selectDateInterval = document.querySelector("select#date-interval");

const inputDateOffset = document.querySelector("input#date-offset");
const inputTopPlayers = document.querySelector("input#top-players");

const table = document.querySelector("table");

const notFound = document.querySelector(".not-found");

getLeaderboard();
document.addEventListener("change", getLeaderboard);

async function getLeaderboard() {
  const rows = await getLeaderboardRows();

  if (rows.length) {
    table.removeAttribute("hidden");
    notFound.setAttribute("hidden", "");
    makeTableBody(rows);
    makeTableHead(Object.keys(rows[0]));
  } else {
    table.setAttribute("hidden", "");
    notFound.removeAttribute("hidden");
  }
}

async function getLeaderboardRows() {
  const difficulty = selectDifficulty.value;
  const dateInterval = selectDateInterval.value;
  const dateOffset = inputDateOffset.value;
  const topPlayers = inputTopPlayers.value;

  const response = await fetch("/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      difficulty,
      dateInterval,
      dateOffset,
      topPlayers
    })
  });

  return response.json();
}

function makeTableBody(rows) {
  table.tBodies[0].innerHTML = "";

  rows.forEach((row, rowIndex) => {
    const tableRow = table.tBodies[0].insertRow();

    const number = tableRow.insertCell();
    number.textContent = +rowIndex + 1;

    rowValues = isCustomOrRandomDifficulty()
      ? Object.values(row)
      : Object.values(row).slice(0, 2);

    for (value of rowValues) {
      let cell = tableRow.insertCell();
      cell.textContent = value;
    };
  });
}

HTMLTableRowElement.prototype.insertTh = function() {
  const th = document.createElement("th");
  this.append(th);
  th.dataset.sort = "none";
  th.setAttribute("scope", "col");
  return th;
};

function makeTableHead(headers) {
  const newTableHead = document.createElement("thead");
  const tableHeadRow = newTableHead.insertRow();

  const rankingHeader = tableHeadRow.insertTh();
  rankingHeader.textContent = "#";

  headerValues = isCustomOrRandomDifficulty()
    ? Object.values(headers)
    : Object.values(headers).slice(0, 2);

  for (const header of headerValues) {
    const cell = tableHeadRow.insertTh();
    cell.textContent = header;
  }

  table.tHead.replaceWith(newTableHead);
}

function isCustomOrRandomDifficulty() {
  return (
    selectDifficulty.value === "custom" || selectDifficulty.value === "random"
  );
}
