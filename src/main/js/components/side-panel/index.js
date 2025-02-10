import Utils from "@/components/dropdowns/utils";
import { createElementFromHtml } from "@/util/dom";

export default function init() {
  const tasks = document.querySelector("#side-panel #tasks")
  const sidepanelMenu = document.querySelector("#side-panel-menu");

  if (!tasks) {
    sidepanelMenu.remove();
  }

  Utils.generateDropdown(sidepanelMenu, (instance) => {
    const parent = createElementFromHtml(`<div class="jenkins-dropdown testtest"></div>`)
    parent.appendChild(tasks);
    instance.setContent(parent);
  })
}
