import { registerSortableDragDrop } from "@/sortable-drag-drop";

document.addEventListener("DOMContentLoaded", function () {
  const bottomStickerShadow = document.querySelector(".jenkins-bottom-app-bar__shadow");
  const bottomSticker = document.querySelector("#bottom-sticker");

  bottomStickerShadow.classList.add("jenkins-hidden");
  bottomSticker.classList.add("jenkins-hidden");

  const items = document.querySelector(".with-drag-drop");
  registerSortableDragDrop(items, function () {
    bottomStickerShadow.classList.remove("jenkins-hidden");
    bottomSticker.classList.remove("jenkins-hidden");
  })
});
