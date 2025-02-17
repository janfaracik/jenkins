import Utils from "@/components/dropdowns/utils";
import { createElementFromHtml } from "@/util/dom";

const BREAKPOINT = "768";
const SIDEPANEL = document.querySelector("#side-panel");
const TASKS = SIDEPANEL.querySelector("#tasks");
const TASK_ITEMS = Array.from(TASKS.children);
const SIDEPANEL_MENU_BUTTON = document.querySelector("#side-panel-menu");

let isAboveBreakpoint = window.innerWidth > BREAKPOINT;

function init() {
  window.addEventListener("resize", () => onWidthChange(evaluate));
  evaluate();
}

function evaluate() {
  // Reset state if need be
  if (!TASK_ITEMS[0].closest("#side-panel")) {
    TASK_ITEMS.forEach(item => {
      TASKS.appendChild(item);
    });
  }

  // Generate the dropdown if we're below the breakpoint
  if (!isAboveBreakpoint) {
    Utils.generateDropdown(SIDEPANEL_MENU_BUTTON, (instance) => {
      const parent = createElementFromHtml(
        `<div class="jenkins-dropdown app-side-panel-menu__dropdown"></div>`,
      );
      TASK_ITEMS.forEach(item => {
        parent.appendChild(item);
      });
      instance.setContent(parent);
    });
  }
}

function onWidthChange(callback) {
  const currentWidth = window.innerWidth;
  const isNowAboveBreakpoint = currentWidth > BREAKPOINT;

  // Trigger only if the state changes
  if (isNowAboveBreakpoint !== isAboveBreakpoint) {
    callback();
    isAboveBreakpoint = isNowAboveBreakpoint;
  }
}

export default { init };
