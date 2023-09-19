export const preventDefaultDragDropBehaviour = () => {
  window.addEventListener("dragover", function (e) {e.preventDefault();}, false);
  window.addEventListener("drop", function (e) {e.preventDefault();}, false);
}