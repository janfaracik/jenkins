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

  console.log(data);

  data.forEach((item) => {
    const tableRow = createElementFromHtml(`<tr>
<td data="${item.iconColorOrdinal}"><a href="${item.consoleUrl}">${generateSVGIcon(item.iconName)}</a></td>
<td class="model-link iamlink" data="${item.number}"><a href="${item.number}/">${xmlEscape(item.displayName)}</a></td>
<td data="${item.duration}">${xmlEscape(item.durationString)}</td>
<td>${item}</td>
<td><button class="jenkins-button">...</button></td>
</tr>`);

    p.append(tableRow);
    behaviorShim.applySubtree(tableRow);
  });

  //   tr.appendChild(td);
  //   if (isDistributedBuildsEnabled) {
  //     var buildInfo = null;
  //     var buildInfoStr = escapeHTML(e.builtOnStr || "");
  //     if (e.builtOn) {
  //       buildInfo = document.createElement("a");
  //       buildInfo.href = rootURL + "/computer/" + e.builtOn;
  //       buildInfo.classList.add("model-link");
  //       buildInfo.innerText = buildInfoStr;
  //     } else {
  //       buildInfo = buildInfoStr;
  //     }
  //     td = document.createElement("td");
  //     if (buildInfo instanceof Node) {
  //       td.appendChild(buildInfo);
  //     } else {
  //       td.innerText = buildInfo;
  //     }
  //     tr.appendChild(td);
  //   }
  //   p.appendChild(tr);
  //   Behaviour.applySubtree(tr);
  // }
  // ts_refresh(p);

  generateSearchResults();
};

/**
 * Generate SVG Icon
 */
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
