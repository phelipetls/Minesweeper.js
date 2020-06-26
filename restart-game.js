const container = document.querySelector(".minesweeper");
const smiley = document.querySelector(".smiley");
const popup = document.querySelector(".new-game-popup");
const newGameRequest = new CustomEvent("newGameRequest", { bubbles: true });

smiley.addEventListener("click", () => {
  container.dispatchEvent(newGameRequest);

  popup.addEventListener("click", e => {
    if (!e.target.matches("button")) return;

    const restartGame = new CustomEvent("restartGame", {
      bubbles: true,
      detail: { answer: e.target.getAttribute("id") }
    });

    e.target.dispatchEvent(restartGame);
    popup.setAttribute("hidden", "hidden");
  });
});

export function createNewGamePopup() {
  const coords = container.getBoundingClientRect();

  popup.removeAttribute("hidden");
  container.append(popup);
  container.style.position = "relative";
  popup.style.position = "absolute";
  popup.style.left = (coords.width - popup.clientWidth) / 2 + "px";
  popup.style.top = (coords.height - popup.clientHeight) / 2 + "px";
}
