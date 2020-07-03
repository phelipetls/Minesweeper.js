const arrow = document.querySelector(".arrow");
const aboutButton = document.querySelector(".about-btn");
const gameOptions = document.querySelector(".game-options");

arrow.addEventListener("click", () => {
  gameOptions.toggleAttribute("hidden");
  arrow.toggleAttribute("closed");
})

arrow.addEventListener("mousedown", e => {
  e.preventDefault();
})

aboutButton.onclick = function() {
  document.querySelector(".about").toggleAttribute("hidden");
};
