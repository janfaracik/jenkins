import debounce from "lodash/debounce";
import BehaviorShim from "@/util/behavior-shim";

BehaviorShim.specify(
  "#buildHistoryPage",
  "build-history-page",
  1000,
  (buildHistoryPage) => {
    // Card/item controls
    const pageSearch = buildHistoryPage.querySelector(".jenkins-search");
    const pageSearchInput = buildHistoryPage.querySelector("input");
    const ajaxUrl = buildHistoryPage.getAttribute("page-ajax");
    const card = document.querySelector("#jenkins-builds");
    const contents = card.querySelector("#jenkins-build-history");
    const container = card.querySelector(".app-temporary-list");
    const loadingBuilds = card.querySelector("#loading-builds");
    const noBuilds = card.querySelector("#no-builds");
    const noBuildsYet = document.querySelector("#no-builds-yet");

    // Pagination controls
    const paginationControls = document.querySelector("#controls");

    // Refresh variables
    let buildRefreshTimeout;
    const updateBuildsRefreshInterval = 50000;

    /**
     * Refresh the 'Builds' card
     * @param {QueryParameters}  options
     */
    function load(options = {}) {
      /** @type {QueryParameters} */
      cancelRefreshTimeout();
      const params = Object.assign(
        {
          page: buildHistoryPage.dataset.pageCurrent || 1,
        },
        options,
        {
          search: pageSearchInput.value,
        },
      );

      // Avoid fetching if the page isn't visible
      if (document.hidden) {
        return;
      }

      createRefreshTimeout();

      fetch(ajaxUrl + toQueryString(params)).then((rsp) => {
        if (rsp.ok) {
          rsp.text().then((responseText) => {
            container.classList.remove("app-temporary-list--loading");
            pageSearch.classList.remove("jenkins-search--loading");

            // Show the 'No builds' text if there are no builds
            if (responseText.trim() === "") {
              contents.innerHTML = "";
              if (params.search) {
                noBuilds.style.display = "block";
              } else {
                noBuildsYet.classList.remove("jenkins-hidden");
                card.classList.add("jenkins-hidden");
              }
              loadingBuilds.style.display = "none";
              updateCardControls({
                pageCurrent: 1,
                pageTotal: 0,
                pageHasMore: false,
                pageEntryNewest: false,
                pageEntryOldest: false,
              });
              return;
            }

            // Show the refreshed builds list
            contents.innerHTML = responseText;
            if (params.search) {
              noBuilds.style.display = "hidden";
            } else {
              noBuildsYet.classList.add("jenkins-hidden");
              card.classList.remove("jenkins-hidden");
            }
            loadingBuilds.style.display = "none";
            BehaviorShim.applySubtree(contents);

            // Show the card controls
            const div = document.createElement("div");
            div.innerHTML = responseText;
            const innerChild = div.children[0];
            updateCardControls({
              pageCurrent: parseInt(innerChild.dataset.pageCurrent, 10) || 1,
              pageTotal: parseInt(innerChild.dataset.pageTotal, 10) || 1,
              pageHasMore: innerChild.dataset.pageHasMore === "true",
              pageEntryNewest: innerChild.dataset.pageEntryNewest,
              pageEntryOldest: innerChild.dataset.pageEntryOldest,
            });
          });
        } else {
          console.error(
            "Failed to load 'Builds' card, response from API is:",
            rsp,
          );
        }
      });
    }

    /**
     * Rebuilds the numbered page buttons and remembers the current page.
     * @param {NewCardControlsOptions}  parameters
     */
    function updateCardControls(parameters) {
      buildHistoryPage.dataset.pageCurrent = parameters.pageCurrent;
      buildHistoryPage.dataset.pageEntryNewest = parameters.pageEntryNewest;
      buildHistoryPage.dataset.pageEntryOldest = parameters.pageEntryOldest;

      paginationControls.innerHTML = "";
      paginationControls.classList.toggle(
        "jenkins-hidden",
        parameters.pageTotal <= 1 && !parameters.pageHasMore,
      );

      for (let i = 1; i <= parameters.pageTotal; i++) {
        const pageButton = document.createElement("button");
        pageButton.type = "button";
        pageButton.textContent = i.toString();
        pageButton.classList.add(
          "jenkins-button",
          "jenkins-button--tertiary",
          "app-temporary-list__page-button",
        );

        if (i === parameters.pageCurrent) {
          pageButton.classList.add("app-temporary-list__page-button--active");
          pageButton.disabled = true;
        } else {
          pageButton.addEventListener("click", () => {
            load({ page: i });
          });
        }

        paginationControls.appendChild(pageButton);
      }

      if (parameters.pageHasMore) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "app-temporary-list__page-ellipsis";
        ellipsis.textContent = "…";
        paginationControls.appendChild(ellipsis);
      }
    }

    function createRefreshTimeout() {
      cancelRefreshTimeout();
      buildRefreshTimeout = window.setTimeout(
        () => load(),
        updateBuildsRefreshInterval,
      );
    }

    function cancelRefreshTimeout() {
      if (buildRefreshTimeout) {
        window.clearTimeout(buildRefreshTimeout);
        buildRefreshTimeout = undefined;
      }
    }

    const debouncedLoad = debounce((options) => {
      load(options);
    }, 150);

    pageSearchInput.addEventListener("input", function () {
      container.classList.add("app-temporary-list--loading");
      pageSearch.classList.add("jenkins-search--loading");
      // A new search resets us back to the first page of results
      debouncedLoad({ page: 1 });
    });

    container.classList.add("app-temporary-list--loading");
    load();

    window.addEventListener("focus", function () {
      load();
    });
  },
);
