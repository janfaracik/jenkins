import debounce from "lodash/debounce";

const buildHistoryPage = document.getElementById("buildHistoryPage");
const pageSearchInput = buildHistoryPage.querySelector(
  "input",
);
const ajaxUrl = buildHistoryPage.getAttribute("page-ajax");
const card = document.querySelector("#jenkins-builds");
const contents = card.querySelector("#jenkins-build-history");
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
          contents.innerHTML = "";
          noBuilds.style.display = "block";
          return;
        }

        if (!document.startViewTransition) {
          contents.innerHTML = responseText;
          noBuilds.style.display = "none";
          Behaviour.applySubtree(contents);
        } else {
          document.startViewTransition(() => {
            contents.innerHTML = responseText;
            noBuilds.style.display = "none";
            Behaviour.applySubtree(contents);
          });
        }
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
