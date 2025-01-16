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

window.addEventListener("scroll", () => {
  const navigation = document.querySelector("#page-header");
  navigation.style.setProperty("--background-opacity", Math.min(70, window.scrollY) + "%");
  navigation.style.setProperty("--background-blur", Math.min(40, window.scrollY) + "px");
  navigation.style.setProperty("--border-opacity", Math.min(10, window.scrollY) + "%");
})
