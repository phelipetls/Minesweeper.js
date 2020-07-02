const gameContainer = document.querySelector(".game");
const fullScreenWrapper = document.querySelector(".fullscreen-wrapper");
const fullScreenButton = document.querySelector(".fullscreen-btn");

fullScreenButton.addEventListener("click", () => {
  const src = fullScreenButton.getAttribute("src");
  if (src.includes("full")) {
    enableFullScreen();
  } else {
    exitFullScreen();
  }
});

fullScreenWrapper.addEventListener("click", e => {
  if (e.target.className !== "fullscreen-wrapper") return;
  exitFullScreen();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    exitFullScreen(e);
  }
});

function enableFullScreen() {
  fullScreenWrapper.removeAttribute("hidden");
  fullScreenWrapper.append(gameContainer);
  gameContainer.classList.add("fullscreen");
  styleMenusOnFullScreen();
}

function exitFullScreen() {
  fullScreenWrapper.setAttribute("hidden", "hidden");
  fullScreenButton.setAttribute("src", "./images/screen-full.svg");
  gameContainer.classList.remove("fullscreen");
  document.querySelector("main").append(gameContainer);
}

function styleMenusOnFullScreen() {
  for (const menu of gameContainer.querySelectorAll(".menu")) {
    menu.setAttribute("fullscreen", "fullscreen");
  }
}
