import hotkeys from "hotkeys-js"

const ADD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 112v288M400 256H112"/></svg>`

window.addEventListener("load", () => {
  document.querySelectorAll("[data-keyboard-shortcut]").forEach(function(element) {
    hotkeys(translateKeyboardShortcutForOS(element.dataset.keyboardShortcut), () => {
      element.click()
      // Returning false stops the event and prevents default browser events
      return false
    })
  })
})

/**
 * Translates a given keyboard shortcut, e.g. CMD+K, into an OS friendly version, e.g. CTRL+K
 * @param {string} keyboardShortcut The shortcut for translation
 */
function translateKeyboardShortcutForOS(keyboardShortcut) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
  return keyboardShortcut.replace("CMD", isMac ? "CMD" : "CTRL")
}

/**
 * Translates a given keyboard shortcut, e.g. CMD+K, into a UI friendly version, e.g. ⌘+K
 * @param {string} keyboardShortcut The shortcut for translation
 */
function translateKeyboardShortcutForUI(keyboardShortcut) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
  return keyboardShortcut.replace("CMD", isMac ? "⌘" : "CTRL")
}

/**
 * Generates a UI representation of the given keyboard shortcut
 * @param {string} keyboardShortcut The shortcut for generation
 */
export function generateKeyboardShortcutUI(keyboardShortcut) {
  return translateKeyboardShortcutForUI(keyboardShortcut)
    .split("+")
    .map(shortcut => `<span class="shortcut">${shortcut}</span>`)
    .join(ADD_SVG)
}

export default { generateKeyboardShortcutUI }
