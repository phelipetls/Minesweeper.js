const playerNameInput = document.querySelector("input.player-name");

export function getPlayerName() {
  return playerNameInput.value;
}
