/**
 * Generate SVG Icon
 */
function generateSVGIcon(iconName) {
  const icons = document.querySelector("#jenkins-build-status-icons");

  return icons.content.querySelector(`#${iconName}`).cloneNode(true);
}

/**
 * Public method to be called by progressiveRendering's callback
 */
window.displayBuilds = function (data) {
  var rootUrl = document.head.getAttribute("data-rooturl");
  var p = document.getElementById("projectStatus");
  p.style.display = "";
  for (var x = 0; data.length > x; x++) {
    var e = data[x];
    var tr = document.createElement("tr");

    var td1 = document.createElement("td");
    td1.setAttribute("data", e.iconColorOrdinal);
    td1.classList.add("jenkins-table__cell--tight", "jenkins-table__icon");
    var div1 = document.createElement("div");
    div1.classList.add("jenkins-table__cell__button-wrapper");
    var svg = generateSVGIcon(e.iconName);
    div1.appendChild(svg);
    td1.appendChild(div1);
    tr.appendChild(td1);

    var td2 = document.createElement("td");
    var a1 = document.createElement("a");
    a1.classList.add("jenkins-table__link", "model-link");
    a1.href = rootUrl + "/" + e.parentUrl;
    var span1 = document.createElement("span");
    // TODO port Functions#breakableString to JavaScript and use .textContent rather than .innerHTML
    span1.innerHTML = e.parentFullDisplayName;
    a1.appendChild(span1);
    td2.appendChild(a1);
    var a2 = document.createElement("a");
    a2.classList.add(
      "jenkins-table__link",
      "jenkins-table__badge",
      "model-link",
      "inside",
    );
    a2.href = rootUrl + "/" + e.url;
    a2.textContent = e.displayName;
    td2.appendChild(a2);
    tr.appendChild(td2);

    var td3 = document.createElement("td");
    td3.setAttribute("data", e.timestampString2);
    td3.textContent = e.timestampString;
    tr.appendChild(td3);

    var td4 = document.createElement("td");
    if (e.buildStatusSummaryWorse) {
      td4.style.color = "var(--red)";
    }
    td4.textContent = e.buildStatusSummaryMessage;
    tr.appendChild(td4);

    var td5 = document.createElement("td");
    td5.classList.add("jenkins-table__cell--tight");
    var div2 = document.createElement("div");
    div2.classList.add("jenkins-table__cell__button-wrapper");
    var a3 = document.createElement("a");
    a3.classList.add("jenkins-button");
    a3.href = e.consoleUrl;
    a3.innerHTML = p.dataset.consoleOutputIcon;
    div2.appendChild(a3);
    td5.appendChild(div2);
    tr.appendChild(td5);

    p.appendChild(tr);
    Behaviour.applySubtree(tr);
  }
  ts_refresh(p);
};
