import pluginSetupWizard from "./pluginSetupWizardGui";

function init() {
  document
    .querySelectorAll(".plugin-setup-wizard-container")
    .forEach(function (container) {
      if (container.children.length === 0) {
        pluginSetupWizard.init(container);
      }
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
