import BehaviorShim from "@/util/behavior-shim";

const rowSelectionControllers = document.querySelectorAll(
  ".jenkins-table__checkbox",
);

rowSelectionControllers.forEach((headerCheckbox) => {
  const table = headerCheckbox.closest(".jenkins-table");
  const checkboxClass = headerCheckbox.dataset.checkboxClass;
  const tableCheckboxes = table.querySelectorAll(
    `input[type='checkbox'].${checkboxClass}`,
  );
  const moreOptionsButton = table.querySelector(
    ".jenkins-table__checkbox-options",
  );

  if (tableCheckboxes.length === 0) {
    headerCheckbox.disabled = true;
    if (moreOptionsButton) {
      moreOptionsButton.disabled = true;
    }
  }

  const allCheckboxesSelected = () => {
    const selectedCheckboxes = Array.from(tableCheckboxes).filter(
      (e) => e.checked,
    );
    return tableCheckboxes.length === selectedCheckboxes.length;
  };

  const anyCheckboxesSelected = () => {
    const selectedCheckboxes = Array.from(tableCheckboxes).filter(
      (e) => e.checked,
    );
    return selectedCheckboxes.length > 0;
  };

  tableCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateIcon();
    });
  });

  headerCheckbox.addEventListener("click", () => {
    const newValue = !allCheckboxesSelected();
    tableCheckboxes.forEach((e) => (e.checked = newValue));
    updateIcon();
  });

  BehaviorShim.specify("[data-select='all']", "data-select-all", 0, (moreOptionsAllButton) => {
    moreOptionsAllButton.addEventListener("click", () => {
      tableCheckboxes.forEach((e) => (e.checked = true));
      updateIcon();
    });
  })

  BehaviorShim.specify("[data-select='none']", "data-select-all", 0, (moreOptionsNoneButton) => {
    moreOptionsNoneButton.addEventListener("click", () => {
      tableCheckboxes.forEach((e) => (e.checked = false));
      updateIcon();
    });
  });

  function updateIcon() {
    headerCheckbox.classList.remove("jenkins-table__checkbox--all");
    headerCheckbox.classList.remove("jenkins-table__checkbox--indeterminate");

    if (allCheckboxesSelected()) {
      headerCheckbox.classList.add("jenkins-table__checkbox--all");
      return;
    }

    if (anyCheckboxesSelected()) {
      headerCheckbox.classList.add("jenkins-table__checkbox--indeterminate");
    }
  }

  window.updateTableHeaderCheckbox = updateIcon;
});
