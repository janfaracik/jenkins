import behaviorShim from "@/util/behavior-shim";
import { createElementFromHtml } from "@/util/dom";

let activeController = null;
let activeRequestId = 0;

behaviorShim.specify(
  "[data-type='main-panel-thing']",
  "",
  999,
  (mainPanelThing) => {
    const interceptUrl = new URL(
      mainPanelThing.dataset.interceptUrl,
      window.location.href,
    );
    const getTabs = () =>
      Array.from(document.querySelectorAll(".app-build-tabs a"));

    behaviorShim.specify("a", "link", 999, (link) => {
      if (!shouldInterceptLink(link, interceptUrl)) {
        return;
      }

      link.addEventListener("click", (e) => {
        if (!shouldHandleLinkClick(e, link)) {
          return;
        }

        e.preventDefault();
        loadPage(mainPanelThing, link.href, getTabs(), { updateHistory: true });
      });
    });

    window.addEventListener("popstate", () => {
      const currentUrl = new URL(window.location.href);

      if (!shouldInterceptUrl(currentUrl, interceptUrl)) {
        return;
      }

      loadPage(mainPanelThing, currentUrl.href, getTabs());
    });

    syncActiveTab(getTabs(), window.location.href);
    actuallyLoadPage(mainPanelThing, window.location.href);
  },
);

function loadPage(mainPanelThing, href, tabs, options = {}) {
  const { updateHistory = false } = options;
  const targetUrl = new URL(href, window.location.href);

  syncActiveTab(tabs, targetUrl.href);

  if (updateHistory && targetUrl.href !== window.location.href) {
    history.pushState({}, "", targetUrl.href);
  }

  actuallyLoadPage(mainPanelThing, targetUrl.href);
}

function actuallyLoadPage(mainPanelThing, href) {
  activeRequestId += 1;
  const requestId = activeRequestId;

  if (activeController) {
    activeController.abort();
  }

  activeController = new AbortController();

  mainPanelThing.innerHTML = "";
  mainPanelThing.append(
    createElementFromHtml(
      `<div class="underthegunagain"><div class="jenkins-spinner"></div></div>`,
    ),
  );

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
      recreateScripts(mainPanelThing);
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

/*
 * Recreate script tags to ensure they are executed, as innerHTML does not execute scripts.
 */
function recreateScripts(form) {
  const scripts = form.getElementsByTagName("script");
  if (scripts.length === 0) {
    behaviorShim.applySubtree(form, false);
    return;
  }
  for (let i = 0; i < scripts.length; i++) {
    const script = document.createElement("script");
    if (scripts[i].text) {
      script.text = scripts[i].text;
    } else {
      for (let j = 0; j < scripts[i].attributes.length; j++) {
        if (scripts[i].attributes[j].name in HTMLScriptElement.prototype) {
          script[scripts[i].attributes[j].name] =
            scripts[i].attributes[j].value;
        }
      }
    }

    scripts[i].parentNode.replaceChild(script, scripts[i]);
  }
}

function shouldHandleLinkClick(event, link) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    (!link.target || link.target === "_self") &&
    !link.hasAttribute("download")
  );
}

function shouldInterceptLink(link, interceptUrl) {
  const href = link.getAttribute("href");
  if (!href) {
    return false;
  }

  let targetUrl;
  try {
    targetUrl = new URL(href, window.location.href);
  } catch {
    return false;
  }

  if (!shouldInterceptUrl(targetUrl, interceptUrl)) {
    return false;
  }

  return !isHashOnlyNavigation(targetUrl);
}

function shouldInterceptUrl(targetUrl, interceptUrl) {
  const normalizedTargetPath = normalizePathname(targetUrl.pathname);
  const normalizedInterceptPath = normalizePathname(interceptUrl.pathname);

  return (
    targetUrl.origin === interceptUrl.origin &&
    (normalizedTargetPath === normalizedInterceptPath ||
      (normalizedInterceptPath !== "/" &&
        normalizedTargetPath.startsWith(`${normalizedInterceptPath}/`)))
  );
}

function isHashOnlyNavigation(targetUrl) {
  const currentUrl = new URL(window.location.href);
  return (
    targetUrl.pathname === currentUrl.pathname &&
    targetUrl.search === currentUrl.search &&
    targetUrl.hash !== currentUrl.hash
  );
}

function syncActiveTab(tabs, href) {
  const activeHref = normalizeUrlForComparison(href);

  tabs.forEach((tab) => {
    const isActive = normalizeUrlForComparison(tab.href) === activeHref;
    tab.classList.toggle("jenkins-button--tertiary", !isActive);
  });
}

function normalizeUrlForComparison(href) {
  const url = new URL(href, window.location.href);
  url.hash = "";
  url.pathname = normalizePathname(url.pathname);

  return `${url.origin}${url.pathname}${url.search}`;
}

function normalizePathname(pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}
