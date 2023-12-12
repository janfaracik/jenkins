import debounce from "lodash/debounce";

const buildHistoryPage = document.getElementById("buildHistoryPage");
const pageSearchInput = buildHistoryPage.querySelector(
  "input",
);
const ajaxUrl = buildHistoryPage.getAttribute("page-ajax");
const card = document.querySelector("#jenkins-builds");
const xander = card.querySelector("#xander");
const container = card.querySelector(".app-builds-container");
const noBuilds = card.querySelector("#no-builds")

const updateBuildsRefreshInterval = 5000;

function loadPage() {
  const params = {
    search: pageSearchInput.value
  };

  fetch(ajaxUrl + toQueryString(params)).then((rsp) => {
    if (rsp.ok) {
      rsp.text().then((responseText) => {
        container.classList.remove("app-builds-container--loading");

        if (responseText.trim() === "") {
          xander.innerHTML = "";
          noBuilds.style.display = "block";
          return;
        }

        xander.innerHTML = responseText;
        noBuilds.style.display = "none";
        Behaviour.applySubtree(xander);
      });
    }
  });
}

const handleFilter = function () {
  loadPage({}, true);
};

const debouncedFilter = debounce(handleFilter, 300);

setInterval(() => {
  loadPage()
}, updateBuildsRefreshInterval)

document.addEventListener("DOMContentLoaded", function () {
  pageSearchInput.addEventListener("input", function () {
    container.classList.add("app-builds-container--loading");
    debouncedFilter();
  });

  loadPage({});
});

document.querySelectorAll(".task-link").forEach((taskLink) =>
  taskLink.addEventListener('click', () => {
    loadPage();
}))
