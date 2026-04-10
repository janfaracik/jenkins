import behaviorShim from "@/util/behavior-shim";

behaviorShim.specify(
  ".app-system-actions__restart-dialog",
  "system-actions-restart-dialog",
  1000,
  (form) => {
    const restartImmediatelyOption = form.querySelector(
      "input[name='safeRestart'][value='false']",
    );
    const messageEntry = form.querySelector(
      ".app-system-actions__restart-message",
    );
    const messageInput = messageEntry?.querySelector("input[name='message']");

    if (!restartImmediatelyOption || !messageEntry || !messageInput) {
      return;
    }

    const syncMessageState = () => {
      const disableMessage = restartImmediatelyOption.checked;
      messageInput.disabled = disableMessage;
    };

    restartImmediatelyOption.addEventListener("change", syncMessageState);

    syncMessageState();
  },
);
