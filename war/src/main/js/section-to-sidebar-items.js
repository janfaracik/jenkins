import {elementFromHtml, toId} from "./util/dom";

const DEFAULT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M262.29 192.31a64 64 0 1057.4 57.4 64.13 64.13 0 00-57.4-57.4zM416.39 256a154.34 154.34 0 01-1.53 20.79l45.21 35.46a10.81 10.81 0 012.45 13.75l-42.77 74a10.81 10.81 0 01-13.14 4.59l-44.9-18.08a16.11 16.11 0 00-15.17 1.75A164.48 164.48 0 01325 400.8a15.94 15.94 0 00-8.82 12.14l-6.73 47.89a11.08 11.08 0 01-10.68 9.17h-85.54a11.11 11.11 0 01-10.69-8.87l-6.72-47.82a16.07 16.07 0 00-9-12.22 155.3 155.3 0 01-21.46-12.57 16 16 0 00-15.11-1.71l-44.89 18.07a10.81 10.81 0 01-13.14-4.58l-42.77-74a10.8 10.8 0 012.45-13.75l38.21-30a16.05 16.05 0 006-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 00-6.07-13.94l-38.19-30A10.81 10.81 0 0149.48 186l42.77-74a10.81 10.81 0 0113.14-4.59l44.9 18.08a16.11 16.11 0 0015.17-1.75A164.48 164.48 0 01187 111.2a15.94 15.94 0 008.82-12.14l6.73-47.89A11.08 11.08 0 01213.23 42h85.54a11.11 11.11 0 0110.69 8.87l6.72 47.82a16.07 16.07 0 009 12.22 155.3 155.3 0 0121.46 12.57 16 16 0 0015.11 1.71l44.89-18.07a10.81 10.81 0 0113.14 4.58l42.77 74a10.8 10.8 0 01-2.45 13.75l-38.21 30a16.05 16.05 0 00-6.05 14.08c.33 4.14.55 8.3.55 12.47z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>`

window.addEventListener('load', function() {
  const sidebar = document.querySelector("#tasks")
  const sectionHeaders = document.querySelectorAll("h2, .jenkins-section > .jenkins-section__title")

  // Ensure sidebar is sticky
  sidebar.style.position = "sticky"
  sidebar.style.top = "calc(43px + 1.6rem)"

  // Create the sidebar items
  sectionHeaders.forEach(function (header, i) {
    const headerId = toId(header.textContent);
    header.id = headerId
    const icon = header.querySelector("svg") ? header.querySelector("svg").outerHTML : DEFAULT_ICON
    const item = elementFromHtml(`
        <div class="task">
            <span class="task-link-wrapper">
                <button data-section-id=${headerId} class="task-link">
                    <span class="task-icon-link">
                        ${icon}
                    </span>
                    <span class="task-link-text">
                        ${header.textContent}
                    </span>
                </button>
            </span>
        </div>
    `);
    item.addEventListener("click", (event) => {
      const headerToScrollTo = document.getElementById(event.target.dataset.sectionId)
      document.documentElement.scrollTop = i === 0 ? 0 : (headerToScrollTo.getBoundingClientRect().top + window.scrollY) - 70
    });

    sidebar.insertAdjacentElement('beforeend', item);
  })

  document.addEventListener("scroll", () => autoActivateTabs());
  autoActivateTabs();
})

/**
 * Watch page scrolling, changing the selected sidebar item as needed
 */
function autoActivateTabs() {
  const winScrollTop = Math.max(window.scrollY, 0)
  const sections = document.querySelectorAll("h2, .jenkins-section > .jenkins-section__title")

  let selectedSection = null

  // Calculate the top and height of each section to know when to switch selected sidebar item
  sections.forEach(function (section, i) {
    const previousSection = i === 1 ? document.querySelectorAll(".jenkins-section")[0] : sections[Math.max(i - 1, 0)].parentNode
    const viewportEntryOffset = i === 0 ? 0 : ((section.parentNode.getBoundingClientRect().top + window.scrollY) - (previousSection.offsetHeight / 2))

    if (winScrollTop >= viewportEntryOffset) {
      selectedSection = section
    }
  })

  document.querySelectorAll(".task-link--active").forEach(function (selected) {
    selected.classList.remove("task-link--active")
  })

  document.querySelector(".task-link[data-section-id='" + selectedSection.id + "']").classList.add("task-link--active")
}