import { createElementFromHtml } from "@/util/dom";
import behaviorShim from "@/util/behavior-shim";

behaviorShim.specify(
  "#button-computer-icon-legend",
  "computer-icon-legend",
  999,
  (button) => {
    button.addEventListener("click", () => {
      console.log("clicked");
      const template = document.querySelector("#template-computer-icon-legend");
      const title = template.getAttribute("data-title");
      const content = createElementFromHtml(
        "<div>" + template.innerHTML + "</div>",
      );

      dialog.modal(content, {
        maxWidth: "550px",
        title: title,
      });
    });
  },
);
