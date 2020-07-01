export function insertCenteredPopup(container, popup) {
  const coords = container.getBoundingClientRect();
  container.append(popup);
  container.style.position = "relative";
  popup.style.position = "absolute";
  popup.style.left = (coords.width - popup.clientWidth) / 2 + "px";
  popup.style.top = (coords.height - popup.clientHeight) / 2 + "px";
}
