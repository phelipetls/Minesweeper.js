import { insertCenteredPopup } from "./popup.js";

const popup = document.querySelector(".submit-game-popup");
const form = popup.querySelector("form");
const submitButton = document.querySelector(".submit-buttons #submit");
const playerNameInput = document.querySelector("input#player-name");

submitButton.addEventListener("click", e => {
  e.target.dispatchEvent(
    new CustomEvent("submitGame", {
      bubbles: true,
      detail: { name: playerNameInput.value }
    })
  );
});

form.onclick = e => {
  if (e.target.matches("button")) {
    popup.setAttribute("hidden", "hidden");
  }
};

export function askToSubmitGame() {
  popup.removeAttribute("hidden");
  insertCenteredPopup(popup.parentElement, popup);
}
