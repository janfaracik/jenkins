(function () {
  const buildCaption = document.querySelector("[data-status-url]");
  const progress = buildCaption.dataset.progress;
  const url = buildCaption.dataset.statusUrl;
  const title = document.title;

  function updateBuildCaptionIcon() {
    fetch(url).then((rsp) => {
      if (rsp.ok) {
        let isBuilding = rsp.headers.get("X-Building");
        if (isBuilding === "true") {
          setTimeout(updateBuildCaptionIcon, 5000);
          let progress = rsp.headers.get("X-Progress");
          let runtime = rsp.headers.get("X-Executor-Runtime");
          let remaining = rsp.headers.get("X-Executor-Remaining");
          let stuck = rsp.headers.get("X-Executor-Stuck");
          let progressBar = document.querySelector(".app-progress-bar");
          let progressBarDone = document.querySelector(
            ".app-progress-bar span",
          );
          if (progressBar) {
            let tooltip = progressBar.dataset.tooltipTemplate;
            tooltip = tooltip.replace("%0", runtime).replace("%1", remaining);
            progressBar.setAttribute("tooltip", tooltip);
            progressBar.setAttribute("title", tooltip);
            Behaviour.applySubtree(progressBar, true);
            if (stuck === "true") {
              progressBar.classList.add("app-progress-bar--error");
            } else {
              progressBar.classList.remove("app-progress-bar--error");
            }
          }
          if (progressBarDone) {
            progressBarDone.style.width = `${progress}%`;
          }
          setTitle(progress);
        } else {
          let progressBar = document.querySelector(
            ".build-caption-progress-container",
          );
          if (progressBar) {
            progressBar.style.display = "none";
          }
          document.title = title;
        }
        rsp.text().then((responseText) => {
          // The first svg selector can be removed once experimental Run UI is default
          buildCaption.querySelector(
            "svg, .app-build-bar__content__headline svg",
          ).outerHTML = responseText;
          Behaviour.applySubtree(buildCaption, false);
        });
      }
    });
  }

  function setTitle(percentage) {
    if (percentage === "-1") {
      return;
    }

    document.title = "(" + percentage + "%) " + title;
  }

  setTimeout(updateBuildCaptionIcon, 5000);
  setTitle(progress);
})();
