import Dropdowns from "@/components/dropdowns";
import CommandPalette from "@/components/command-palette";
import Notifications from "@/components/notifications";
import SearchBar from "@/components/search-bar";
import Tooltips from "@/components/tooltips";
import StopButtonLink from "@/components/stop-button-link";
import ConfirmationLink from "@/components/confirmation-link";
import Dialogs from "@/components/dialogs";
import Utils from "@/components/dropdowns/utils";
import Path from "@/util/path";
import { createElementFromHtml } from "@/util/dom";

Dropdowns.init();
CommandPalette.init();
Notifications.init();
SearchBar.init();
Tooltips.init();
StopButtonLink.init();
ConfirmationLink.init();
Dialogs.init();

const sidepanel = document.querySelector("#side-panel #tasks")
const thing2 = document.querySelector("#main-panel #opencloseting");

if (!sidepanel) {
  thing2.remove();
  thing2.remove();
}

Utils.generateDropdown(thing2, (instance) => {
  const parent = createElementFromHtml(`<div class="jenkins-dropdown testtest"></div>`)
  parent.append(sidepanel.cloneNode(true))
  instance.setContent(parent);
})
