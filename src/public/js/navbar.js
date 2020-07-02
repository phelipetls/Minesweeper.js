const arrow = document.querySelector("[arrow]");
const gameOptions = document.querySelector(".game-options-menu");

arrow.addEventListener("click", () => {
  const display = gameOptions.style.display;
  if (display === "none") {
    gameOptions.style.display = "";
    arrow.setAttribute("arrow", "up");
  } else {
    gameOptions.style.display = "none";
    arrow.setAttribute("arrow", "down");
  }
})

arrow.addEventListener("mousedown", e => {
  e.preventDefault();
})
