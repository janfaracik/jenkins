// const searchBarInput = document.querySelector("#settings-search-bar");
//
// searchBarInput.suggestions = function () {
//   return Array.from(document.querySelectorAll(".task-link"))
//     .map((item) => ({
//       url: item.href,
//       icon: item.querySelector(".task-icon-link svg, .task-icon-link img")
//         .outerHTML,
//       label: item.querySelector(".task-link-text")?.textContent,
//     }))
//     .filter((item) => !item.url.endsWith("#"));
// };

import behaviorShim from "@/util/behavior-shim";

const mainThing = document.querySelector(".mainthing");
Array.from(document.querySelectorAll(".task-link")).forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const selected = link.classList.contains("task-link--active");

    if (selected) {
      return;
    }

    mainThing.innerHTML = `<p class="jenkins-spinner"></p>`;

    const clazz = link.dataset.clazz;
    document.querySelectorAll(".task-link--active").forEach(b => b.classList.remove("task-link--active"));
    link.classList.add("task-link--active");

    window.history.pushState(null, null, link.href);

    fetch("ting?url=" + clazz).then(response => {
      response.text().then(text => {
        mainThing.innerHTML = text;
        executeScripts(mainThing);
        setTimeout(() => behaviorShim.applySubtree(mainThing, true), 100)
      })
    });
  })
})

function executeScripts(element) {
  // Find all script tags
  const scripts = element.querySelector("#page-body").getElementsByTagName('script');

  // Execute each script
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const scriptSrc = script.getAttribute('src');

    if (scriptSrc) {
      // Create a new script element
      const newScript = document.createElement('script');
      newScript.src = scriptSrc;
      newScript.type = 'text/javascript';
      newScript.defer = true;
      // newScript.async = false; // Ensure scripts are loaded in order if necessary
      document.body.appendChild(newScript);
    }
  }
}

document.querySelector(".task-link").click();
