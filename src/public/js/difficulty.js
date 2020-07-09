import { Random } from "./random.js";

const select = document.querySelector("select#difficulty");
const params = document.querySelector(".custom-difficulty-params");

const difficulties = {
  easy: { width: 7, height: 11, bombs: 10 },
  medium: { width: 11, height: 17, bombs: 35 },
  hard: { width: 14, height: 23, bombs: 75 }
};

if (select.value === "custom") {
  params.style.display = "";
}

export function getDifficultyParams() {
  const level = getDifficultyLevel();

  if (level === "random") {
    return getRandomParams();
  } else if (level !== "custom") {
    return difficulties[level];
  } else {
    const [width, height, bombs] = params.querySelectorAll("input");
    return {
      width: width.value,
      height: height.value,
      bombs: bombs.value
    };
  }
}

export function getDifficultyLevel() {
  return select.value;
}

function getRandomParams() {
  const width = Random.intFromInterval(6, 18);
  const height = Random.intFromInterval(6, 30);

  const difficulty = Random.floatFromInterval(0.1, 0.15);
  const bombs = Math.floor(difficulty * width * height);

  return { width, height, bombs };
}

select.addEventListener("change", e => {
  params.style.display = e.target.value === "custom" ? "" : "none";
});
