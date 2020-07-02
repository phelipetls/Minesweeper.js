const arrow = document.querySelector(".arrow");
const gameOptions = document.querySelector(".game-options");

arrow.addEventListener("click", () => {
  gameOptions.toggleAttribute("hidden");
  arrow.toggleAttribute("closed");
})

arrow.addEventListener("mousedown", e => {
  e.preventDefault();
})
