export function getContentWidth(elem) {
  const { paddingLeft, paddingRight } = getComputedStyle(elem);
  return elem.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
}

export function debounce(func, ms) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), ms);
  };
}
