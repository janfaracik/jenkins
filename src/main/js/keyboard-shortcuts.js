import hotkeys from "hotkeys-js";
import { createElementFromHtml } from "./util/dom";

window.addEventListener("load", () => {
  const shortcuts = {};

  const openCommandPaletteButton = document.querySelector(
    "#root-action-SearchAction",
  );
  if (openCommandPaletteButton) {
    shortcuts[translateModifierKeysForUsersPlatform("CMD+K")] = {
      title: "Search Jenkins",
    };
    hotkeys(translateModifierKeysForUsersPlatform("CMD+K"), () => {
      openCommandPaletteButton.click();

      // Returning false stops the event and prevents default browser events
      return false;
    });
  }

  const pageSearchBar = document.querySelectorAll(
    "#page-body .jenkins-search__input",
  );
  if (pageSearchBar.length === 1) {
    shortcuts["/"] = { title: pageSearchBar[0].placeholder };
    hotkeys("/", () => {
      pageSearchBar[0].focus();

      // Returning false stops the event and prevents default browser events
      return false;
    });
  }

  //////

  document.querySelectorAll("[data-keyboard-shortcut]").forEach((e) => {
    const title = e.dataset.keyboardShortcutTitle;
    const subtitle = e.dataset.keyboardShortcutSubtitle;

    if (!title) {
      console.warn(
        `No title provided for keyboard shortcut ${e.dataset.keyboardShortcut}`,
        e,
      );
      return;
    }

    hotkeys(e.dataset.keyboardShortcut, () => {
      e.click();

      // Returning false stops the event and prevents default browser events
      return false;
    });

    shortcuts[
      translateModifierKeysForUsersPlatform(e.dataset.keyboardShortcut)
    ] = {
      title: title,
      subtitle: subtitle,
    };
  });

  const content = createElementFromHtml(
    "<div class='itsagame2'>" +
      Object.entries(shortcuts)
        .map(
          ([key, value]) =>
            `<div class="itsagame">${value.title}${value.subtitle ? `<span class="jenkins-!-text-color-secondary">${value.subtitle}</span>` : ``}<div class="jenkins-keyboard-shortcut">${tryTranslateToSymbol(key)}</div></div>`,
        )
        .join("") +
      "</div>",
  );

  // dialog.modal(content, {
  //   maxWidth: "550px",
  //   title: "Keyboard shortcuts",
  // });
});

function tryTranslateToSymbol(keyboardShortcut) {
  switch (keyboardShortcut) {
    case "/":
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="450px" height="450px" viewBox="0 0 450 450" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <line x1="292" y1="65" x2="158.851995" y2="384.354989" stroke="currentColor" stroke-width="42"></line>
    </g>
</svg>`;
    case "left":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>Arrow Back</title><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M244 400L100 256l144-144M120 256h292"/></svg>`;
    case "right":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>Arrow Forward</title><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M268 112l144 144-144 144M392 256H100"/></svg>`;
    default:
      return keyboardShortcut;
  }
}

/**
 * Given a keyboard shortcut, e.g. CMD+K, replace any included modifier keys for the user's
 * platform e.g. output will be CMD+K for macOS/iOS, CTRL+K for Windows/Linux
 * @param {string} keyboardShortcut The shortcut to translate
 */
function translateModifierKeysForUsersPlatform(keyboardShortcut) {
  const useCmdKey =
    navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
    navigator.platform.toUpperCase() === "IPHONE" ||
    navigator.platform.toUpperCase() === "IPAD";
  return keyboardShortcut.replace(/CMD|CTRL/gi, useCmdKey ? "⌘" : "CTRL");
}
