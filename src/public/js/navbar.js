const downArrow = document.querySelector(".down-arrow");
const gameOptions = document.querySelector(".game-options-menu");

downArrow.addEventListener("click", () => {
  const display = gameOptions.style.display;
  if (display === "none") {
    gameOptions.style.display = "flex";
  } else {
    gameOptions.style.display = "none";
  }
})
