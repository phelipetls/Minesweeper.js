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
    makeLeaderboardTable(rows);
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
      topPlayers,
    })
  });

  return response.json();
}

function makeLeaderboardTable(rows) {
  table.tBodies[0].innerHTML = "";

  for (const row of rows) {
    const tableRow = table.tBodies[0].insertRow();

    for (const value of Object.values(row)) {
      let cell = tableRow.insertCell();
      cell.textContent = value;
    }
  }
}
