import debounce from "lodash/debounce";
import tippy from "tippy.js";
import BehaviorShim from "@/util/behavior-shim";
import Templates from "@/components/dropdowns/templates";

const SELECTED_STATUS_ITEM_CLASS = "jenkins-dropdown__item--selected";
const MUTED_STATUS_ITEM_CLASS =
  "app-temporary-list__filter-panel__items__item--muted";

BehaviorShim.specify(
  "#buildHistoryPage",
  "build-history-page",
  1000,
  (buildHistoryPage) => {
    // Card/item controls
    // These now live in the app bar (jenkins/job/OverviewTab/index.jelly)
    // rather than inside #buildHistoryPage, so look them up from the document.
    const pageSearchInput = document.querySelector("#build-history-search");
    const pageSearch = pageSearchInput.closest(".jenkins-search");
    const statusFilterButton = document.querySelector(
      "#build-status-filter-button",
    );
    const statusFilterTemplate = document.querySelector(
      "#build-status-filter-template",
    );
    const ajaxUrl = buildHistoryPage.getAttribute("page-ajax");
    const card = document.querySelector("#jenkins-builds");
    const contents = card.querySelector("#jenkins-build-history");
    const container = card.querySelector(".app-temporary-list");
    const loadingBuilds = card.querySelector("#loading-builds");
    const noBuilds = card.querySelector("#no-builds");
    const noBuildsYet = document.querySelector("#no-builds-yet");

    // Pagination controls
    const paginationControls = document.querySelector("#controls");
    const paginationPrevious = document.querySelector("#up");
    const paginationNext = document.querySelector("#down");

    // Refresh variables
    let buildRefreshTimeout;
    const updateBuildsRefreshInterval = 50000;

    // Status filter state. Empty means "show everything".
    let selectedStatuses = new Set();

    /**
     * Refresh the 'Builds' card
     * @param {QueryParameters}  options
     */
    function load(options = {}) {
      /** @type {QueryParameters} */
      cancelRefreshTimeout();
      const params = Object.assign({}, options, {
        search: pageSearchInput.value,
        status: Array.from(selectedStatuses).join(","),
      });
      const paginationOrFirst =
        buildHistoryPage.dataset.pageHasUp === "false" ||
        "older-than" in params ||
        "newer-than" in params;

      // Avoid fetching if the page isn't visible
      if (document.hidden) {
        return;
      }

      createRefreshTimeout();

      // When we're not on the first page and this is not a load due to pagination
      // we need to set the correct value for older-than so we fetch the same set of runs
      if (!paginationOrFirst) {
        params["older-than"] = (
          BigInt(buildHistoryPage.dataset.pageEntryNewest) + 1n
        ).toString();
      }

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
                pageHasUp: false,
                pageHasDown: false,
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
              pageHasUp: innerChild.dataset.pageHasUp === "true",
              pageHasDown: innerChild.dataset.pageHasDown === "true",
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
     * Shows/hides the card's pagination controls depending on the passed parameter
     * @param {CardControlsOptions}  parameters
     */
    function updateCardControls(parameters) {
      paginationControls.classList.toggle(
        "jenkins-hidden",
        !parameters.pageHasUp && !parameters.pageHasDown,
      );
      paginationPrevious.classList.toggle(
        "app-temporary-list__button--disabled",
        !parameters.pageHasUp,
      );
      paginationNext.classList.toggle(
        "app-temporary-list__button--disabled",
        !parameters.pageHasDown,
      );

      buildHistoryPage.dataset.pageEntryNewest = parameters.pageEntryNewest;
      buildHistoryPage.dataset.pageEntryOldest = parameters.pageEntryOldest;
      buildHistoryPage.dataset.pageHasUp = parameters.pageHasUp;
    }

    paginationPrevious.addEventListener("click", () => {
      load({ "newer-than": buildHistoryPage.dataset.pageEntryNewest });
    });

    paginationNext.addEventListener("click", () => {
      load({ "older-than": buildHistoryPage.dataset.pageEntryOldest });
    });

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

    const debouncedLoad = debounce(() => {
      load();
    }, 150);

    pageSearchInput.addEventListener("input", function () {
      container.classList.add("app-temporary-list--loading");
      pageSearch.classList.add("jenkins-search--loading");
      debouncedLoad();
    });

    // Build the filter panel once and keep it around for the lifetime of the
    // page - tippy just shows/hides it, so listeners are only attached once.
    const statusFilterPanel =
      statusFilterTemplate.content.cloneNode(true).firstElementChild;

    /**
     * Applies the current selection to the filter panel's rows, the Reset link,
     * and the funnel trigger button.
     */
    function renderStatusSelection() {
      const hasSelection = selectedStatuses.size > 0;

      statusFilterPanel.querySelectorAll("[data-status]").forEach((item) => {
        const isSelected = selectedStatuses.has(item.dataset.status);
        item.classList.toggle(SELECTED_STATUS_ITEM_CLASS, isSelected);
        item.classList.toggle(
          MUTED_STATUS_ITEM_CLASS,
          hasSelection && !isSelected,
        );
      });

      statusFilterPanel
        .querySelector(".app-temporary-list__filter-panel__reset")
        .classList.toggle("jenkins-hidden", !hasSelection);

      statusFilterButton.classList.toggle(
        "app-temporary-list__filters__status-button--active",
        hasSelection,
      );
    }

    statusFilterPanel
      .querySelector(".app-temporary-list__filter-panel__items")
      .addEventListener("click", (event) => {
        const item = event.target.closest("[data-status]");
        if (!item) {
          return;
        }

        const status = item.dataset.status;
        if (selectedStatuses.size === 0) {
          // Nothing selected yet (i.e. everything shown) - isolate to just this one
          selectedStatuses = new Set([status]);
        } else if (selectedStatuses.has(status)) {
          selectedStatuses.delete(status);
        } else {
          selectedStatuses.add(status);
        }

        renderStatusSelection();
        container.classList.add("app-temporary-list--loading");
        pageSearch.classList.add("jenkins-search--loading");
        load();
      });

    statusFilterPanel
      .querySelector(".app-temporary-list__filter-panel__reset")
      .addEventListener("click", () => {
        selectedStatuses = new Set();
        renderStatusSelection();
        container.classList.add("app-temporary-list--loading");
        pageSearch.classList.add("jenkins-search--loading");
        load();
      });

    tippy(
      statusFilterButton,
      Object.assign({}, Templates.dropdown(), {
        content: statusFilterPanel,
      }),
    );

    container.classList.add("app-temporary-list--loading");
    load();

    window.addEventListener("focus", function () {
      load();
    });
  },
);
