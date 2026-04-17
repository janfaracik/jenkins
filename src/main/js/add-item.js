import { getI18n } from "@/util/i18n";

const nameInput = document.querySelector(`#createItem input[name="name"]`);
const copyFromInput = document.querySelector(`#createItem input[name="from"]`);
const copyRadio = document.querySelector(`#createItem input[value="copy"]`);

document.addEventListener("DOMContentLoaded", () => {
  //////////////////////////
  // helper functions...

  function parseResponseFromCheckJobName(data) {
    var parser = new DOMParser();
    var html = parser.parseFromString(data, "text/html");
    var element = html.body.firstChild;
    if (element) {
      return element.textContent;
    }
    return undefined;
  }

  function getCopyFromValue() {
    return copyFromInput?.value ?? "";
  }

  function getItemTypeRadios() {
    return document.querySelectorAll('#items input[type="radio"][name="mode"]');
  }

  function isItemNameEmpty() {
    var itemName = nameInput.value;
    return itemName.trim() === "";
  }

  function getFieldValidationStatus(fieldId) {
    return document.querySelector("#" + fieldId)?.dataset.valid === "true";
  }

  function setFieldValidationStatus(fieldId, status) {
    const element = document.querySelector("#" + fieldId);
    if (element) {
      element.dataset.valid = status;
    }
  }

  /**
   * Shows or clears the validation message for the name input.
   *
   * Only updates the UI after the user has interacted with the input, which is
   * indicated by `nameInput.dataset.dirty` being set.
   */
  function activateValidationMessage(message) {
    if (!nameInput.dataset.dirty) {
      return;
    }

    updateValidationArea(
      document.querySelector(".validation-error-area"),
      message !== undefined && message !== ""
        ? `<div class="error">${message}</div>`
        : `<div/>`,
    );

    refreshSubmitButtonState();
  }

  function refreshSubmitButtonState() {
    const submitButton = document.querySelector(
      ".bottom-sticker-inner button[type=submit]",
    );
    submitButton.disabled = !getFormValidationStatus();
  }

  function getFormValidationStatus() {
    return (
      getFieldValidationStatus("name") &&
      (getFieldValidationStatus("items") || getFieldValidationStatus("from"))
    );
  }

  function cleanItemSelection() {
    getItemTypeRadios().forEach((radio) => {
      radio.checked = false;
    });
    setFieldValidationStatus("items", false);
  }

  function cleanCopyFromOption() {
    if (copyRadio) {
      copyRadio.checked = false;
    }
    if (copyFromInput) {
      copyFromInput.value = "";
    }
    setFieldValidationStatus("from", false);
  }

  function selectItemType() {
    cleanCopyFromOption();
    setFieldValidationStatus("items", true);

    if (getFieldValidationStatus("name")) {
      refreshSubmitButtonState();
    }
  }

  function bindItemTypeSelection() {
    getItemTypeRadios().forEach((radio) => {
      if (radio.dataset.addItemBound === "true") {
        return;
      }

      radio.dataset.addItemBound = "true";
      radio.addEventListener("change", selectItemType);
    });
  }

  // The main panel content is hidden by default via an inline style. We're ready to remove that now.
  document.querySelector("#add-item-panel").removeAttribute("style");

  bindItemTypeSelection();

  // Init NameField
  function nameFieldEvent() {
    if (!isItemNameEmpty()) {
      var itemName = nameInput.value;

      fetch(`checkJobName?value=${encodeURIComponent(itemName)}`).then(
        (response) => {
          response.text().then((data) => {
            var message = parseResponseFromCheckJobName(data);
            if (message !== "") {
              activateValidationMessage(message);
              setFieldValidationStatus("name", false);
              refreshSubmitButtonState();
            } else {
              activateValidationMessage("");
              setFieldValidationStatus("name", true);
              refreshSubmitButtonState();
            }
          });
        },
      );
    } else {
      setFieldValidationStatus("name", false);
      activateValidationMessage(getI18n("empty-name"));
      refreshSubmitButtonState();
    }
  }

  nameInput.addEventListener("blur", nameFieldEvent);
  nameInput.addEventListener("input", () => {
    nameInput.dataset.dirty = "true";
    nameFieldEvent();
  });

  // Init CopyFromField
  function copyFromFieldEvent() {
    if (getCopyFromValue().trim() === "") {
      if (copyRadio) {
        copyRadio.checked = false;
      }
      setFieldValidationStatus("from", false);
      refreshSubmitButtonState();
      return;
    }

    cleanItemSelection();
    if (copyRadio) {
      copyRadio.checked = true;
    }
    setFieldValidationStatus("from", true);
    refreshSubmitButtonState();
  }

  copyFromInput?.addEventListener("blur", copyFromFieldEvent);
  copyFromInput?.addEventListener("input", copyFromFieldEvent);

  // Focus the Name input on load
  document.querySelector("#add-item-panel #name").focus();

  // Disable the Submit button on load
  refreshSubmitButtonState();

  if (copyRadio !== null) {
    copyRadio.addEventListener("change", () => {
      copyFromInput.focus();
    });
  }
});
