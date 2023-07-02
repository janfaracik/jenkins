import { showModal } from "@/components/modals";
import { createElementFromHtml } from "@/util/dom";

document.querySelectorAll("[data-modal='true']").forEach((e) => {
  e.addEventListener("click", () => {
    const parent = e.closest("tr");
    const template = parent.querySelector("template");
    const title = template.getAttribute("data-title");
    const content = createElementFromHtml(
      "<div>" + template.innerHTML + "</div>"
    );

    showModal(content, {
      maxWidth: "750px",
      title: title,
    });
  });
})
