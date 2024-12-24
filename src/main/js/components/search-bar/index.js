import { createElementFromHtml } from "@/util/dom";
import makeKeyboardNavigable from "@/util/keyboard";
import { xmlEscape } from "@/util/security";

const SELECTED_CLASS = "jenkins-search__results-item--selected";

function init() {
  const searchBarInputs = document.querySelectorAll(".jenkins-search__input");

  Array.from(searchBarInputs)
    .filter((searchBar) => searchBar.suggestions || searchBar.getAttribute("fillUrl"))
    .forEach((searchBar) => {
      const searchWrapper = searchBar.parentElement.parentElement;
      const searchResultsContainer = createElementFromHtml(
        `<div class="jenkins-search__results-container"></div>`,
      );
      searchWrapper.appendChild(searchResultsContainer);
      const searchResults = createElementFromHtml(
        `<div class="jenkins-search__results"></div>`,
      );
      searchResultsContainer.appendChild(searchResults);

      searchBar.addEventListener("input", () => {
        const fillUrl = searchBar.getAttribute("fillUrl");

        const mockPromise = new Promise((resolve) => {
          const query = searchBar.value.toLowerCase();
          resolve({
            ok: true,
            json: () =>
              Promise.resolve(
                searchBar
                  .suggestions()
                  .filter((item) => item.displayName.toLowerCase().includes(query))
                  .slice(0, 5)
              ),
          });
        });

        const fetchPromise = fillUrl
          ? fetch(fillUrl, {
            headers: crumb.wrap({
              "Content-Type": "application/x-www-form-urlencoded",
            }),
            method: "post",
            body: new URLSearchParams({ value: searchBar.value }),
          })
          : mockPromise;

        fetchPromise.then((rsp) => {
          if (rsp.ok) {
            rsp.json().then((results) => {
              const query = searchBar.value.toLowerCase();

              // Hide the suggestions if the search query is empty
              if (query.length === 0) {
                hideResultsContainer();
                return;
              }

              showResultsContainer();

              function appendResults(container, results) {
                results.forEach((item, index) => {
                  container.appendChild(
                    createElementFromHtml(
                      `<a class="${index === 0 ? SELECTED_CLASS : ""}" href="${
                        item.url
                      }"><div>${item.icon}</div>${xmlEscape(item.displayName)}</a>`,
                    ),
                  );
                });

                if (results.length === 0 && container === searchResults) {
                  container.appendChild(
                    createElementFromHtml(
                      `<p class="jenkins-search__results__no-results-label">No results</p>`,
                    ),
                  );
                }
              }

              searchResults.innerHTML = "";
              appendResults(searchResults, results);
              searchResultsContainer.style.height = searchResults.offsetHeight + "px";
            });
          }
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
        () => searchResults.querySelectorAll("a"),
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
