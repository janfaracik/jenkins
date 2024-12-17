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

const sidepanel = document.querySelector("#side-panel")
const thing = document.querySelector("#main-panel #opencloseting");

console.log(sidepanel, thing)
thing.addEventListener("click", () => {
  console.log('hi')
  sidepanel.classList.toggle("opennn");
})

// sidepanel.classList.toggle("opennn");
