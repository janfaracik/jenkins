import behaviorShim from "@/util/behavior-shim";
import { createElementFromHtml } from "@/util/dom";

let activeController = null;
let activeRequestId = 0;
let preloadedPage = null;

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

    behaviorShim.specify(
      ".app-build-bar__tabs .app-build-tabs a, .app-build__navigation-previous, .app-build__navigation-next",
      "run-link",
      999,
      (link) => {
        if (!shouldInterceptLink(link, interceptUrl)) {
          return;
        }

        link.addEventListener("click", (e) => {
          if (!shouldHandleLinkClick(e, link)) {
            return;
          }

          e.preventDefault();
          loadPage(mainPanelThing, link.href, getTabs(), {
            updateHistory: true,
          });
        });

        link.addEventListener("pointerdown", (e) => {
          if (!shouldPreloadLinkEvent(e)) {
            return;
          }

          preloadPage(link.href);
        });
      },
    );

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
  cancelPreloadedPage(href);

  mainPanelThing.innerHTML = "";
  mainPanelThing.append(
    createElementFromHtml(
      `<div class="underthegunagain"><div class="jenkins-spinner"></div></div>`,
    ),
  );

  const request =
    consumePreloadedPage(href) ?? requestPage(href, activeController.signal);

  request
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

function preloadPage(href) {
  const targetUrl = new URL(href, window.location.href);
  if (preloadedPage?.href === targetUrl.href) {
    return;
  }

  cancelPreloadedPage();

  const controller = new AbortController();
  const promise = requestPage(targetUrl.href, controller.signal).catch((err) => {
    if (preloadedPage?.promise === promise) {
      preloadedPage = null;
    }

    throw err;
  });

  preloadedPage = {
    controller,
    href: targetUrl.href,
    promise,
  };
}

function consumePreloadedPage(href) {
  if (!preloadedPage || preloadedPage.href !== href) {
    return null;
  }

  const { promise } = preloadedPage;
  preloadedPage = null;
  return promise;
}

function cancelPreloadedPage(hrefToKeep) {
  if (!preloadedPage || preloadedPage.href === hrefToKeep) {
    return;
  }

  preloadedPage.controller.abort();
  preloadedPage = null;
}

function requestPage(href, signal) {
  return fetch(href, {
    method: "GET",
    headers: crumb.wrap({
      "X-Content-Only": true,
    }),
    signal,
  }).then((rsp) => {
    if (!rsp.ok) {
      throw new Error(`Request failed: ${rsp.status}`);
    }

    return rsp.text();
  });
}

/*
 * Recreate script tags to ensure they are executed, as innerHTML does not execute scripts.
 */
function recreateScripts(form) {
  const scripts = Array.from(form.getElementsByTagName("script"));
  if (scripts.length === 0) {
    behaviorShim.applySubtree(form, false);
    return;
  }

  scripts.forEach((existingScript) => {
    const script = recreateScript(existingScript);
    existingScript.parentNode.replaceChild(script, existingScript);
  });

  behaviorShim.applySubtree(form, false);
}

function recreateScript(existingScript) {
  const script = document.createElement("script");

  for (let i = 0; i < existingScript.attributes.length; i++) {
    script.setAttribute(
      existingScript.attributes[i].name,
      existingScript.attributes[i].value,
    );
  }

  if (existingScript.text) {
    script.text = existingScript.text;
  }

  return script;
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

function shouldPreloadLinkEvent(event) {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
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
