import { newGameRequest } from "./restart-game.js";

const difficultySelect = document.querySelector("select#difficulty");
const difficultyMenu = document.querySelector(".difficulty-menu");
const customParams = document.querySelector(".params");
const difficulties = {
  easy: { width: 9, height: 9, bombs: 10 },
  medium: { width: 16, height: 16, bombs: 40 },
  hard: { width: 30, height: 16, bombs: 99 }
};

if (difficultySelect.value === "custom") {
  customParams.style.display = "";
}

export function getDifficultyParams() {
  const level = difficultySelect.value;
  if (level !== "custom") {
    return difficulties[level];
  } else {
    const [width, height, bombs] = document.querySelectorAll(".param input");
    return { width: width.value, height: height.value, bombs: bombs.value };
  }
}

difficultyMenu.addEventListener("change", e => {
  e.target.dispatchEvent(newGameRequest);

  if (e.target.matches("select")) {
    if (e.target.value === "custom") {
      document.querySelector(".params").style.display = "";
    } else {
      document.querySelector(".params").style.display = "none";
    }
  }
});
