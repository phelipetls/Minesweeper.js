import { insertCenteredPopup } from "./popup.js";

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
  popup.removeAttribute("hidden");
  insertCenteredPopup(container, popup);
}
