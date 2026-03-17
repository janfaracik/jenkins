/*
 * Some internal jQuery extensions.
 *
 * Bundling jQuery as a module means this extends the imported instance.
 */
import $ from "jquery";
import windowHandle from "window-handle";

/**
 * TODO: look into other way of doing this
 */
var $ext;

export var getJQuery = function () {
  if (!$ext) {
    initJQueryExt();
  }
  return $ext;
};

/*
 * Clear the $ext instance if the window changes. Primarily for unit testing.
 */
windowHandle.getWindow(function () {
  $ext = undefined;
});

/**
 * Adds the :containsci selector to jQuery
 */
function initJQueryExt() {
  $ext = $;

  /**
   * A pseudo selector that performs a case insensitive text contains search i.e. the same
   * as the standard ':contains' selector, but case insensitive.
   */
  $ext.expr[":"].containsci = $ext.expr.createPseudo(function (text) {
    return function (element) {
      var elementText = $ext(element).text();
      var result = elementText.toUpperCase().indexOf(text.toUpperCase()) !== -1;
      return result;
    };
  });
}
initJQueryExt();
