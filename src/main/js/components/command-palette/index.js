import { LinkResult } from "@/components/command-palette/models";
import { JenkinsSearchSource } from "./datasources";
import debounce from "lodash/debounce";
import * as Symbols from "./symbols";
import makeKeyboardNavigable from "@/util/keyboard";
import { xmlEscape } from "@/util/security";
import { createElementFromHtml } from "@/util/dom";
import { groupResultsByCategory } from "@/components/command-palette/utils";

const datasources = [JenkinsSearchSource];
const MAX_RESULTS_PER_GROUP = 5;

function startsWithQuery(result, query) {
  return result.label.toLowerCase().startsWith(query.toLowerCase());
}

function init() {
  const i18n = document.getElementById("command-palette-i18n");
  const headerCommandPaletteButton = document.getElementById(
    "root-action-SearchAction",
  );
  if (headerCommandPaletteButton === null) {
    return; // no JenkinsHeader, no h:searchbox
  }
  const commandPalette = document.getElementById("command-palette");
  const commandPaletteWrapper = commandPalette.querySelector(
    ".jenkins-command-palette__wrapper",
  );
  const commandPaletteInput = document.getElementById("command-bar");
  const commandPaletteSearchBarContainer = commandPalette.querySelector(
    ".jenkins-command-palette__search",
  );
  const searchResults = document.getElementById("search-results");
  const searchResultsContainer = document.getElementById(
    "search-results-container",
  );

  const hoverClass = "jenkins-command-palette__results__item--hover";

  const pageScopes = JSON.parse(commandPalette.dataset.scopes || "[]");
  const scopes = [];
  const renderedResults = new WeakMap();
  let latestRequest = 0;

  const scopesContainer = document.createElement("div");
  scopesContainer.className = "jenkins-command-palette__scopes";
  commandPaletteInput.before(scopesContainer);

  makeKeyboardNavigable(
    searchResultsContainer,
    () => searchResults.querySelectorAll("a"),
    hoverClass,
    (selectedItem, key, e) => {
      if (key !== "Tab" || e.shiftKey) {
        return;
      }

      const result = selectedItem && renderedResults.get(selectedItem);
      if (!result?.drillable) {
        return;
      }

      e.preventDefault();
      drillInto(result);
    },
    () => commandPalette.open,
  );

  commandPaletteInput.addEventListener("keydown", (e) => {
    if (e.key !== "Backspace" || commandPaletteInput.value !== "") {
      return;
    }

    if (scopes.length === 0) {
      return;
    }

    e.preventDefault();
    scopes.pop();
    updateScopes();
  });

  commandPalette.addEventListener("cancel", (e) => {
    if (scopes.length === 0) {
      return;
    }

    e.preventDefault();
    scopes.pop();
    updateScopes();
  });

  // Events
  headerCommandPaletteButton.addEventListener("click", function () {
    if (commandPalette.hasAttribute("open")) {
      hideCommandPalette();
    } else {
      showCommandPalette();
    }
  });

  commandPaletteWrapper.addEventListener("click", function (e) {
    if (e.target !== e.currentTarget) {
      return;
    }

    hideCommandPalette();
  });

  function drillInto(result) {
    scopes.push({
      label: result.label,
      url: result.url.endsWith("/") ? result.url : result.url + "/",
    });
    commandPaletteInput.value = "";
    updateScopes();
  }

  function updateScopes() {
    updateScopeChips();
    debouncedLoad.cancel();
    renderResults();
  }

  function updateScopeChips() {
    scopesContainer.innerHTML = "";
    scopes.forEach((scope) => {
      const chip = document.createElement("span");
      chip.className = "jenkins-command-palette__scope";
      chip.textContent = scope.label;
      scopesContainer.append(chip);
    });
  }

  function renderResults() {
    const query = commandPaletteInput.value;
    const scope = scopes.at(-1);
    const request = ++latestRequest;
    let results;

    if (scope) {
      results = Promise.all(
        datasources.map((ds) => ds.execute(query, scope)),
      ).then((e) => e.flat());
    } else if (query.length === 0) {
      results = Promise.all([
        LinkResult({
          icon: Symbols.HELP,
          type: "symbol",
          label: i18n.dataset.getHelp,
          url: document.querySelector("body").dataset.searchHelpUrl,
          isExternal: true,
          group: null,
        }),
      ]);
    } else {
      results = Promise.all(datasources.map((ds) => ds.execute(query))).then(
        (e) => e.flat(),
      );
    }

    results.then((results) => {
      if (request !== latestRequest) {
        return;
      }

      results = groupResultsByCategory(results);

      // Clear current search results
      searchResults.innerHTML = "";

      if ((!scope && query.length === 0) || Object.keys(results).length > 0) {
        for (const [group, items] of Object.entries(results)) {
          if (group !== "null") {
            const heading = document.createElement("p");
            heading.className = "jenkins-command-palette__results__heading";
            heading.innerText = group;
            searchResults.append(heading);
          }

          const prioritisedItems = [...items].sort(
            (a, b) =>
              Number(startsWithQuery(b, query)) -
              Number(startsWithQuery(a, query)),
          );

          prioritisedItems
            .slice(0, scope ? undefined : MAX_RESULTS_PER_GROUP)
            .forEach(function (obj) {
              const link = createElementFromHtml(obj.render());
              renderedResults.set(link, obj);
              link.addEventListener("mouseenter", (e) => itemMouseEnter(e));
              searchResults.append(link);
            });
        }

        updateSelectedItem(0);
      } else {
        const label = document.createElement("p");
        label.className = "jenkins-command-palette__info";
        label.innerHTML =
          "<span>" +
          i18n.dataset.noResultsFor +
          "</span> " +
          xmlEscape(commandPaletteInput.value);
        searchResults.append(label);
      }

      searchResultsContainer.style.height = searchResults.offsetHeight + "px";
      debouncedSpinner.cancel();
      commandPaletteSearchBarContainer.classList.remove(
        "jenkins-search--loading",
      );
    });
  }

  const debouncedSpinner = debounce(() => {
    commandPaletteSearchBarContainer.classList.add("jenkins-search--loading");
  }, 150);

  const debouncedLoad = debounce(() => {
    renderResults();
  }, 150);

  commandPaletteInput.addEventListener("input", () => {
    debouncedSpinner();
    debouncedLoad();
  });

  // Helper methods for visibility of command palette
  function showCommandPalette() {
    scopes.length = 0;
    scopes.push(...pageScopes);
    updateScopeChips();
    commandPalette.showModal();
    commandPaletteInput.focus();
    commandPaletteInput.setSelectionRange(0, commandPaletteInput.value.length);

    renderResults();
  }

  function hideCommandPalette() {
    commandPalette.setAttribute("closing", "");

    commandPalette.addEventListener(
      "animationend",
      () => {
        commandPalette.removeAttribute("closing");
        commandPalette.close();
      },
      { once: true },
    );
  }

  function itemMouseEnter(item) {
    let hoveredItems = document.querySelector("." + hoverClass);
    if (hoveredItems) {
      hoveredItems.classList.remove(hoverClass);
    }

    item.target.classList.add(hoverClass);
  }

  function updateSelectedItem(index, scrollIntoView = false) {
    const maxLength = searchResults.getElementsByTagName("a").length;
    const hoveredItem = document.querySelector("." + hoverClass);

    if (hoveredItem) {
      hoveredItem.classList.remove(hoverClass);
    }

    if (index < maxLength) {
      const element = Array.from(searchResults.getElementsByTagName("a"))[
        index
      ];
      element.classList.add(hoverClass);

      if (scrollIntoView) {
        element.scrollIntoView();
      }
    }
  }
}

export default { init };
