import AppBar from "@/components/app-bar";
import Dropdowns from "@/components/dropdowns";
import CommandPalette from "@/components/command-palette";
import Notifications from "@/components/notifications";
import SearchBar from "@/components/search-bar";
import Tooltips from "@/components/tooltips";
import StopButtonLink from "@/components/stop-button-link";
import ConfirmationLink from "@/components/confirmation-link";
import Dialogs from "@/components/dialogs";
import Defer from "@/components/defer";
import behaviorShim from "@/util/behavior-shim";
import { createElementFromHtml } from "@/util/dom";

AppBar.init();
Dropdowns.init();
CommandPalette.init();
Defer.init();
Notifications.init();
SearchBar.init();
Tooltips.init();
StopButtonLink.init();
ConfirmationLink.init();
Dialogs.init();

let activeController = null;
let activeRequestId = 0;

behaviorShim.specify("[data-type='main-panel-thing']", '', 999, (mainPanelThing) => {
  const tabs = document.querySelectorAll(".app-build-tabs a");
  const interceptUrl = mainPanelThing.dataset.interceptUrl;

  behaviorShim.specify("a", "link", 999, (link) => {
    if (link.href.includes(interceptUrl)) {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        // do the thing
        loadPage(mainPanelThing, link, tabs);
      })
    }
  });

  actuallyLoadPage(mainPanelThing, window.location.href);
});

function loadPage(mainPanelThing, link, tabs) {
  // Do some magic
  tabs.forEach((tab) => {
    tab.classList.add("jenkins-button--tertiary");
  });

  link.classList.remove("jenkins-button--tertiary");

  actuallyLoadPage(mainPanelThing, link.href);
}

function actuallyLoadPage(mainPanelThing, href) {
  activeRequestId += 1;
  const requestId = activeRequestId;

  if (activeController) {
    activeController.abort();
  }

  activeController = new AbortController();

  mainPanelThing.innerHTML = "";
  mainPanelThing.append(createElementFromHtml(`<div class="underthegunagain"><div class="jenkins-spinner"></div></div>`));

  fetch(href, {
    method: "GET",
    headers: crumb.wrap({
      "X-Content-Only": true,
    }),
    signal: activeController.signal,
  })
    .then((rsp) => {
      if (!rsp.ok) {
        throw new Error(`Request failed: ${rsp.status}`);
      }
      return rsp.text();
    })
    .then((responseText) => {
      if (requestId !== activeRequestId) {
        return;
      }

      mainPanelThing.innerHTML = responseText;
    })
    .catch((err) => {
      if (err.name === "AbortError") {
        return;
      }

      if (requestId !== activeRequestId) {
        return;
      }

      mainPanelThing.innerHTML = "<div>Failed to load page</div>";
      console.error(err);
    });
}
