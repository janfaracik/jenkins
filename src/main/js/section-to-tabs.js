// Converts a page's section headings into clickable tabs, see 'About Jenkins' page for example
const tabPanes = document.querySelectorAll(".jenkins-tab-pane");
const content = document.querySelector("#main-panel");

// Hide tab panes
tabPanes.forEach((tabPane) => {
  tabPane.style.display = "none";
});

// Show the first
tabPanes[0].style.display = "block";

const tabBar = document.createElement("div");
tabBar.className = "tabBar";

// Add tabs for each tab pane
tabPanes.forEach((tabPane, index) => {
  const tabPaneTitle = tabPane.querySelector(".jenkins-tab-pane__title");
  tabPaneTitle.style.display = "none";

  const tab = document.createElement("a");
  tab.className = "jenkins-button jenkins-button--tertiary";
  tab.setAttribute("href", "#");
  tab.innerText = tabPaneTitle.textContent;

  if (index === 0) {
    tab.classList.remove("jenkins-button--tertiary");
  }

  tab.addEventListener("click", function (e) {
    e.preventDefault();
    tabBar.querySelectorAll(".jenkins-button").forEach((tab) => {
      tab.classList.add("jenkins-button--tertiary");
    });
    tab.classList.remove("jenkins-button--tertiary");

    tabPanes.forEach((tabPane) => {
      tabPane.style.display = "none";
    });
    tabPanes[index].style.display = "block";
  });

  tabBar.append(tab);
});

content.insertBefore(tabBar, tabPanes[0]);
