import Dropdowns from "@/components/dropdowns";
import Notifications from "@/components/notifications";
import SearchBar from "@/components/search-bar";
import Tooltips from "@/components/tooltips";
import StopButtonLink from "@/components/stop-button-link";
import ConfirmationLink from "@/components/confirmation-link";
import Dialogs from "@/components/dialogs";

Dropdowns.init();
Notifications.init();
SearchBar.init();
Tooltips.init();
StopButtonLink.init();
ConfirmationLink.init();
Dialogs.init();

// Bootstrap deprecations

const deprecatedClasses = ['.container', '.container-fluid', '.row', '.col-md-24'];
const matchedClasses = document.querySelectorAll(deprecatedClasses.join(', '));
if (matchedClasses.length > 0) {
  console.warn('This page contains several deprecated classes - these should be updated', matchedClasses)
}
