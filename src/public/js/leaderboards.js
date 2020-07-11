const selectInterval = document.querySelector("select#interval");
const selectDifficulty = document.querySelector("select#difficulty");

const tableContainer = document.querySelector(".leaderboard-table-container");
const table = document.querySelector("table");

const queryMore = document.querySelector(".leaderboard-query-more");
const notFound = document.querySelector(".not-found");

document.querySelector("main").addEventListener("change", e => {
  if (e.target.tagName === "SELECT") {
    return debounce(fetchFirstTenRows(), 250);
  }
});

queryMore.addEventListener("click", () => fetchMoreRows());

async function fetchLeaderboard(page = 1) {
  const difficulty = selectDifficulty.value;
  const interval = selectInterval.value;

  const response = await fetch("/leaderboards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      difficulty,
      interval,
      page
    })
  });

  const rows = await response.json();

  return rows;
}

async function fetchFirstTenRows() {
  const rows = await fetchLeaderboard();

  if (rows.length) {
    table.removeAttribute("hidden");
    writeLeaderboardTable(rows);
    queryMore.dataset.page = 1;

    notFound.setAttribute("hidden", "");
    if (rows.length === 10) {
      queryMore.removeAttribute("hidden", "");
    }
  } else {
    table.setAttribute("hidden", "");
    queryMore.setAttribute("hidden", "");
    notFound.removeAttribute("hidden");
  }
}

async function fetchMoreRows() {
  const page = ++queryMore.dataset.page;
  const rows = await fetchLeaderboard(page);

  if (rows.length) {
    appendToLeaderboard(rows, page);
  }

  if (rows.length < 10) {
    queryMore.setAttribute("hidden", "");
  }
}

function writeLeaderboardTable(rows) {
  let html = "";
  for (const row of rows) {
    html += getRowHTML(row);
  }
  table.tBodies[0].innerHTML = html;
}

function appendToLeaderboard(rows) {
  let html = "";
  console.log(rows);
  for (const row of rows) {
    html = getRowHTML(row);
    table.tBodies[0].insertAdjacentHTML("beforeend", html);
  }
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

function debounce(func, ms) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), ms);
  };
}

fetchFirstTenRows();
