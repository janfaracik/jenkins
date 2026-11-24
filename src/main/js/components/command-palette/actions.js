import Templates from "@/components/dropdowns/templates";
import behaviorShim from "@/util/behavior-shim";

const RUNNER_ID = "command-palette-action-runner";

function getRunner() {
  let runner = document.getElementById(RUNNER_ID);
  if (!runner) {
    runner = document.createElement("div");
    runner.id = RUNNER_ID;
    runner.hidden = true;
    document.body.append(runner);
  }
  return runner;
}

function clickable(element) {
  return element.matches("a, button")
    ? element
    : element.querySelector("a, button");
}

/**
 * Runs a page action the same way its dropdown menu item would
 * @param {Object} menuItem - the action's context menu item
 * @param {string} baseUrl - the URL relative links resolve against
 */
export function runAction(menuItem, baseUrl) {
  const scriptUrl = menuItem.event?.javascriptUrl;
  const pendingScript =
    scriptUrl && !document.querySelector(`script[src="${scriptUrl}"]`);

  const element = Templates.menuItem(
    menuItem,
    "jenkins-dropdown__item",
    baseUrl,
  );
  const runner = getRunner();
  runner.replaceChildren(element);

  if (pendingScript) {
    document
      .querySelector(`script[src="${scriptUrl}"]`)
      ?.addEventListener("load", () => clickable(element)?.click(), {
        once: true,
      });
    return;
  }

  behaviorShim.applySubtree(runner, true);
  clickable(element)?.click();
}
