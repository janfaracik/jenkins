/* global replaceDescription */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const widget = document.getElementById("description");
    const placeholder = document.querySelector(".app-description-widget__placeholder");
    let descriptionLink = document.querySelector("#description-link");
    descriptionLink.addEventListener("click", function (e) {
      e.preventDefault();
      let url = descriptionLink.getAttribute("data-url");
      let description = descriptionLink.getAttribute("data-description");
      const height = (widget.offsetHeight - 58) + "px";

      if (placeholder) {
        placeholder.remove();
      }

      if (url == null && description == null) {
        return replaceDescription(null, null, height);
      } else {
        return replaceDescription(description, url, height);
      }
    });
  });
})();

function replaceDescription(initialDescription, submissionUrl, height) {
  const d = document.getElementById("description");
  d.firstElementChild.nextElementSibling.innerHTML =
    "<div class='jenkins-spinner'></div>";
  let parameters = {};
  if (initialDescription !== undefined && submissionUrl !== undefined) {
    parameters = {
      description: initialDescription,
      submissionUrl: submissionUrl,
    };
  }
  fetch("./descriptionForm", {
    method: "post",
    headers: crumb.wrap({}),
    body: objectToUrlFormEncoded(parameters),
  }).then((rsp) => {
    rsp.text().then((responseText) => {
      d.innerHTML = responseText;
      evalInnerHtmlScripts(responseText, function () {
        Behaviour.applySubtree(d);
        const textarea = d.querySelector("textarea");
        textarea.style.height = height;
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      });
      layoutUpdateCallback.call();
      return false;
    });
  });
}
