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

import { createElementFromHtml } from "@/util/dom";

document.querySelector("[href='/jenkins/job/Alien/build?delay=0sec']").addEventListener("click", (e) => {
  e.preventDefault()
  const template = document.querySelector("#buildwithparams");
//   const title = template.getAttribute("data-title");
  const content = createElementFromHtml(
    "<div>" + template.innerHTML + "</div>",
  );

  dialog.modal(content, {
    maxWidth: "1000px",
    title: 'Build with parameters',
  });
});
