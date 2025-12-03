import { registerSortableDragDrop } from "@/sortable-drag-drop";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".with-drag-drop").forEach((table) =>
    registerSortableDragDrop(table, function () {
      document.getElementById("saveButton").classList.remove("jenkins-hidden");
    }),
  );
});
