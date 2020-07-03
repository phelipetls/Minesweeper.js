import { Random } from "./random.js";

const select = document.querySelector("select#difficulty");
const params = document.querySelector(".custom-difficulty-params");

const difficulties = {
  easy: { width: 9, height: 9, bombs: 10 },
  medium: { width: 16, height: 16, bombs: 40 },
  hard: { width: 30, height: 16, bombs: 99 }
};

if (select.value === "custom") {
  params.style.display = "";
}

export function getDifficultyParams() {
  const level = select.value;

  if (level === "random") {
    return getRandomParams();
  } else if (level !== "custom") {
    return difficulties[level];
  } else {
    const [width, height, bombs] = document.querySelectorAll(
      ".custom-difficulty-param input"
    );
    return { width: width.value, height: height.value, bombs: bombs.value };
  }
}

function getRandomParams() {
  const width = Random.intFromInterval(6, 18);
  const height = Random.intFromInterval(6, 30);

  const difficulty = Random.floatFromInterval(0.1, 0.15);
  const bombs = Math.floor(difficulty * width * height);

  return { width, height, bombs };
}

select.addEventListener("change", e => {
  params.style.display = (e.target.value === "custom" ? "": "none");
});
