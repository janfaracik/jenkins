document.querySelector("#upstream-projects").addEventListener("click", () => {
  const template = document.querySelector("#upstream-projects-template");
  const title = template.dataset.title;
  const content = template.content.firstElementChild.cloneNode(true);
  dialog.modal(content, {
    maxWidth: "550px",
    title: title,
  });
});
