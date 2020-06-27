import { newGameRequest } from "./restart-game.js";
import { getRandomInt } from "./random.js";

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
  if (level === "random") {
    return getRandomParams();
  } else if (level !== "custom") {
    return difficulties[level];
  } else {
    const [width, height, bombs] = document.querySelectorAll(".param input");
    return { width: width.value, height: height.value, bombs: bombs.value };
  }
}

function getRandomParams() {
  const width = getRandomInt(6, 18);
  const height = getRandomInt(6, 30);
  const bombs = Math.floor(0.15 * (width * height));
  return { width, height, bombs };
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
