import Dropdowns from "@/components/dropdowns";
import CommandPalette from "@/components/command-palette";
import Notifications from "@/components/notifications";
import SearchBar from "@/components/search-bar";
import Tooltips from "@/components/tooltips";
import StopButtonLink from "@/components/stop-button-link";
import ConfirmationLink from "@/components/confirmation-link";
import Dialogs from "@/components/dialogs";
import Utils from "@/components/dropdowns/utils";
import { createElementFromHtml } from "@/util/dom";

Dropdowns.init();
CommandPalette.init();
Notifications.init();
SearchBar.init();
Tooltips.init();
StopButtonLink.init();
ConfirmationLink.init();
Dialogs.init();

const sidepanel = document.querySelector("#side-panel")
const tasks = document.querySelector("#side-panel #tasks")
const widgets = document.querySelector("#side-panel .pane-frame, #side-panel .jenkins-card");
const sidepanelMenu = document.querySelector("#side-panel-menu");

if (!tasks) {
  sidepanelMenu.remove();
}

if (!widgets && tasks) {
  sidepanel.style.display = "none";
}

Utils.generateDropdown(sidepanelMenu, (instance) => {
  const parent = createElementFromHtml(`<div class="jenkins-dropdown testtest"></div>`)
  parent.appendChild(tasks);
  instance.setContent(parent);
})
