import debounce from "lodash/debounce";

const buildHistoryPage = document.getElementById("buildHistoryPage");
const pageSearchInput = buildHistoryPage.querySelector(
  "input",
);
const ajaxUrl = buildHistoryPage.getAttribute("page-ajax");
const xander = document.querySelector("#xander");
const noBuilds = document.querySelector("#no-builds")

const updateBuildsRefreshInterval = 500000;

function loadPage() {
  const params = {
    search: pageSearchInput.value
  };

  fetch(ajaxUrl + toQueryString(params)).then((rsp) => {
    if (rsp.ok) {
      rsp.text().then((responseText) => {
        if (responseText.trim() === "") {
          xander.innerHTML = "";
          noBuilds.style.display = "block";
          return;
        }

        xander.innerHTML = responseText;
        noBuilds.style.display = "none";
      });
    }
  });
}

const handleFilter = function () {
  loadPage({}, true);
};

const debouncedFilter = debounce(handleFilter, 300);

setInterval(() => {
  loadPage({})
}, updateBuildsRefreshInterval)

document.addEventListener("DOMContentLoaded", function () {
  pageSearchInput.addEventListener("input", function () {
    debouncedFilter();
  });

  loadPage({});
});
