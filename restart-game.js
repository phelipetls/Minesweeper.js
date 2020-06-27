const container = document.querySelector(".minesweeper");
const smiley = document.querySelector(".smiley");
const popup = document.querySelector(".new-game-popup");

export const newGameRequest = new CustomEvent("newGameRequest", {
  bubbles: true
});

const restartGameConfirmed = new CustomEvent("restartGameConfirmed", {
  bubbles: true
});

smiley.addEventListener("click", () => {
  container.dispatchEvent(newGameRequest);
});

popup.addEventListener("click", e => {
  if (!e.target.matches("button")) return;

  if (e.target.matches("button#yes")) {
    e.target.dispatchEvent(restartGameConfirmed);
  }

  popup.setAttribute("hidden", "hidden");
});

export function confirmRestartGame() {
  const coords = container.getBoundingClientRect();

  popup.removeAttribute("hidden");
  container.append(popup);
  container.style.position = "relative";
  popup.style.position = "absolute";
  popup.style.left = (coords.width - popup.clientWidth) / 2 + "px";
  popup.style.top = (coords.height - popup.clientHeight) / 2 + "px";
}
