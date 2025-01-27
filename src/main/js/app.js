import Dropdowns from "@/components/dropdowns";
import CommandPalette from "@/components/command-palette";
import Notifications from "@/components/notifications";
import SearchBar from "@/components/search-bar";
import Tooltips from "@/components/tooltips";
import StopButtonLink from "@/components/stop-button-link";
import ConfirmationLink from "@/components/confirmation-link";
import Dialogs from "@/components/dialogs";

Dropdowns.init();
CommandPalette.init();
Notifications.init();
SearchBar.init();
Tooltips.init();
StopButtonLink.init();
ConfirmationLink.init();
Dialogs.init();

const closer = document.querySelector("#closer")
const sidepanel = document.querySelector("#side-panel")
const thing = document.querySelector("#main-panel #opencloseting");

if (!sidepanel) {
  thing.remove();
} else {
  thing.addEventListener("click", () => {
    closer.classList.toggle("opennn");
    sidepanel.classList.toggle("opennn");
  })

  closer.addEventListener("click", () => {
    closer.classList.toggle("opennn");
    sidepanel.classList.toggle("opennn");
  })
}
