const selectDifficulty = document.querySelector("select#difficulty");
const selectDateInterval = document.querySelector("select#date-interval");

const inputDateOffset = document.querySelector("input#date-offset");
const inputTopPlayers = document.querySelector("input#top-players");

const table = document.querySelector("table");

const notFound = document.querySelector(".not-found");

getLeaderboard();
document.addEventListener("change", getLeaderboard);

async function getLeaderboardRows() {
  const difficulty = selectDifficulty.value;
  const dateInterval = selectDateInterval.value;
  const dateOffset = inputDateOffset.value;
  const topPlayers = inputTopPlayers.value;

  const response = await fetch("/leaderboards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      difficulty,
      dateInterval,
      dateOffset,
      topPlayers,
    })
  });

  const rows = await response.json();

  return rows;
}

async function getLeaderboard() {
  const rows = await getLeaderboardRows();

  if (rows.length) {
    table.removeAttribute("hidden");
    writeLeaderboardTable(rows);
    notFound.setAttribute("hidden", "");
  } else {
    table.setAttribute("hidden", "");
    notFound.removeAttribute("hidden");
  }
}

function writeLeaderboardTable(rows) {
  let html = "";
  for (const row of rows) {
    html += getRowHTML(row);
  }
  table.tBodies[0].innerHTML = html;
}

function getRowHTML(row) {
  return (
    "<tr>" +
    Object.values(row).reduce((acc, val) => {
      acc += `<td>${val}</td>`;
      return acc;
    }, "") +
    "</tr>"
  );
}
