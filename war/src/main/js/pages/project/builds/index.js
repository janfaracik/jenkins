import behaviorShim from "@/util/behavior-shim";
import { createElementFromHtml } from "@/util/dom";
import { xmlEscape } from "@/util/security";

/**
 * @typedef {Object} Build
 * @property {string} iconName
 * @property {number} iconColorOrdinal
 * @property {string} iconColorDescription
 * @property {number} number
 * @property {string} displayName
 * @property {number} duration
 * @property {string} durationString
 * @property {string} consoleUrl
 */

/**
 * Public method to be called by progressiveRendering's callback
 * @param {Build[]} data
 */
window.buildTimeTrend_displayBuilds = function (data) {
  const p = document.querySelector("tbody");
  const isDistributedBuildsEnabled =
    "true" === p.getAttribute("data-is-distributed-build-enabled");
  const rootURL = document.head.getAttribute("data-rooturl");

  data.forEach((item) => {
    let distributedBuildColumn = ``;

    if (isDistributedBuildsEnabled) {
      var buildInfo;
      var buildInfoStr = xmlEscape(item.builtOnStr || "");
      if (item.builtOn) {
        buildInfo = document.createElement("a");
        buildInfo.href = rootURL + "/computer/" + item.builtOn;
        buildInfo.classList.add("model-link");
        buildInfo.innerText = buildInfoStr;
      } else {
        buildInfo = buildInfoStr;
      }
      const td = document.createElement("td");
      if (buildInfo instanceof Node) {
        td.appendChild(buildInfo);
      } else {
        td.innerText = buildInfo;
      }
      distributedBuildColumn = td.innerHTML;
    }

    const tableRow = createElementFromHtml(`<tr>
<td class="jenkins-table__cell--tight jenkins-table__icon" data="${item.iconColorOrdinal}"><div class="jenkins-table__cell__button-wrapper"><a href="${item.consoleUrl}">${generateSVGIcon(item.iconName)}</a></div></td>
<td data="${item.number}"><a class="iamlink" href="${item.number}/">${xmlEscape(item.displayName)}</a></td>
<td data="${item.duration}">${xmlEscape(item.durationString)}</td>
${distributedBuildColumn}
<td><button data-href="${item.number}/" class="jenkins-button jenkins-button--tertiary jenkins-jumplist-link"><div class="jenkins-overflow-button__ellipsis">
          <span></span>
          <span></span>
         <span></span>
        </div></button></td>
</tr>`);

    p.append(tableRow);
    behaviorShim.applySubtree(tableRow);
  });

  ts_refresh(p);
  generateSearchResults();
};

function generateSVGIcon(iconName) {
  const icons = document.querySelector("#jenkins-build-status-icons");

  return icons.content.querySelector(`#${iconName}`).outerHTML;
}

function generateSearchResults() {
  const searchBarInput = document.querySelector("#search-bar-builds");

  searchBarInput.suggestions = function () {
    return Array.from(document.querySelectorAll("tbody tr")).map((item) => ({
      url: item.querySelector(".iamlink").href,
      icon: item.querySelector("svg").outerHTML,
      label: item.querySelector(".iamlink").textContent,
    }));
  };

  behaviorShim.applySubtree(searchBarInput, true);
}
