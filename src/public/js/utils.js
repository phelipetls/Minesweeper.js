export function debounce(func, ms) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), ms);
  };
}

export function createTable(width, height) {
  const tableCells = `<td class="square"></td>`.repeat(width);
  return `<tr>${tableCells}</tr>`.repeat(height);
}

export function insertCenteredPopup(container, popup) {
  const coords = container.getBoundingClientRect();
  container.append(popup);
  container.style.position = "relative";
  popup.style.position = "absolute";
  popup.style.left = (coords.width - popup.clientWidth) / 2 + "px";
  popup.style.top = (coords.height - popup.clientHeight) / 2 + "px";
}

export function isTouchScreen() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}
