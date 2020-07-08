import { insertCenteredPopup } from "./utils.js";

const table = document.querySelector("table");
const select = document.querySelector("select#difficulty");
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

smiley.onclick = select.onchange = e => {
  dispatchNewGameEvent(e.target);
};

export function confirmNewGame() {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = CONFIRM_NEW_GAME_POPUP_INNER_HTML;
  insertCenteredPopup(table, popup);
  closeOnClick(popup);
}

function closeOnClick(popup) {
  popup.addEventListener("click", e => {
    if (!e.target.matches("button")) return;

    if (e.target.matches("#yes")) {
      dispatchNewGameEvent(e.target, { detail: { force: true }, once: true });
    }
    dispatchNewGameEvent(e.target, { detail: { newGameConfirmed: true }, once: true });

    popup.remove();
  });
}
