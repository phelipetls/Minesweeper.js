import { insertCenteredPopup } from "./utils.js";

const table = document.querySelector("table");
const difficultyMenu = document.querySelector(".difficulty-menu");
const smiley = document.querySelector(".smiley");

const CONFIRM_NEW_GAME_POPUP_INNER_HTML = `
  <h5>Sure you want to restart?</h5>
  <div class="buttons">
    <button id="yes" name="yes" type="button">
      Yes
    </button>
    <button id="no" name="no" type="button">
      No
    </button>
  </div>
`;

function dispatchNewGameEvent(elem, options = {}) {
  elem.dispatchEvent(
    new CustomEvent("newGame", {
      bubbles: true,
      detail: { newGameConfirmed: false },
      ...options
    })
  );
}

smiley.onclick = e => {
  dispatchNewGameEvent(e.target);
};

difficultyMenu.addEventListener("change", e => {
  if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") {
    dispatchNewGameEvent(e.target);
  }
})

export function confirmNewGame() {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = CONFIRM_NEW_GAME_POPUP_INNER_HTML;
  insertCenteredPopup(table, popup);
  closePopupWhenButtonClicked(popup);
}

function closePopupWhenButtonClicked(popup) {
  popup.addEventListener("click", e => {
    if (!e.target.matches("button")) return;

    if (e.target.matches("#yes")) {
      dispatchNewGameEvent(e.target, { detail: { newGameConfirmed: true }, once: true });
    }

    popup.remove();
  }, { once: true })
}
