import { createElementFromHtml } from "@/util/dom";
import makeKeyboardNavigable from "@/util/keyboard";
import { xmlEscape } from "@/util/security";

const SELECTED_CLASS = "jenkins-search__results-item--selected";

function init() {
  const searchBarInputs = document.querySelectorAll(".auto-complete");

  Array.from(searchBarInputs)
    // .filter((searchBar) => searchBar.suggestions)
    .forEach((searchBar) => {
      const searchWrapper = searchBar.parentElement;
      // TODO - or else by default it's absolutely positioned, making "width:100%" break
      searchWrapper.style.position = "relative";
      const searchResultsContainer = createElementFromHtml(
        `<div class="jenkins-search__results-container"></div>`,
      );
      searchWrapper.appendChild(searchResultsContainer);
      const searchResults = createElementFromHtml(
        `<div class="jenkins-search__results"></div>`,
      );
      searchResultsContainer.appendChild(searchResults);

      searchBar.addEventListener("input", () => {
        const query = searchBar.value.toLowerCase();

        // Hide the suggestions if the search query is empty
        if (query.length === 0) {
          hideResultsContainer();
          return;
        }

        showResultsContainer();

        function appendResults(container, results) {
          results.forEach((item, index) => {
            const button = createElementFromHtml(
              `<button type="button" class="${index === 0 ? SELECTED_CLASS : ""}">
                        ${xmlEscape(item.name)}
                      </button>`,
            );
            button.addEventListener("click", () => {
              searchBar.value = item.name;
              hideResultsContainer();
            });
            container.appendChild(button);
          });

          if (results.length === 0 && container === searchResults) {
            container.appendChild(
              createElementFromHtml(
                `<p class="jenkins-search__results__no-results-label">No results</p>`,
              ),
            );
          }
        }

        // Filter results
        const url =
          searchBar.getAttribute("autoCompleteUrl") + "?value=" + query;
        fetch(url).then((rsp) => {
          rsp.json().then((result) => {
            searchResults.innerHTML = "";
            appendResults(searchResults, result["suggestions"]);
            searchResultsContainer.style.height =
              searchResults.offsetHeight + "px";
          });
        });
      });

      function showResultsContainer() {
        searchResultsContainer.classList.add(
          "jenkins-search__results-container--visible",
        );
      }

      function hideResultsContainer() {
        searchResultsContainer.classList.remove(
          "jenkins-search__results-container--visible",
        );
        searchResultsContainer.style.height = "1px";
      }

      searchBar.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
        }
      });

      makeKeyboardNavigable(
        searchResultsContainer,
        () => searchResults.querySelectorAll("button"),
        SELECTED_CLASS,
      );

      // Workaround: Firefox doesn't update the dropdown height correctly so
      // let's bind the container's height to it's child
      // Disabled in HtmlUnit
      if (!window.isRunAsTest) {
        new ResizeObserver(() => {
          searchResultsContainer.style.height =
            searchResults.offsetHeight + "px";
        }).observe(searchResults);
      }

      searchBar.addEventListener("focusin", () => {
        if (searchBar.value.length !== 0) {
          searchResultsContainer.style.height =
            searchResults.offsetHeight + "px";
          showResultsContainer();
        }
      });

      document.addEventListener("click", (event) => {
        if (searchWrapper.contains(event.target)) {
          return;
        }

        hideResultsContainer();
      });
    });
}

export default { init };
