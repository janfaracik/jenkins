import Path from "@/util/path";
import behaviorShim from "@/util/behavior-shim";
import Utils from "@/components/dropdowns/utils";

function init() {
  generateJumplistAccessors();
  generateDropdowns();
}

/*
 * Appends a ⌄ button at the end of links which support jump lists
 */
function generateJumplistAccessors() {
  behaviorShim.specify("A.model-link", "-jumplist-", 999, (link) => {
    const isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
    // Firefox adds unwanted lines when copying buttons in text, so use a span instead
    const dropdownChevron = document.createElement(
      isFirefox ? "span" : "button",
    );
    dropdownChevron.className = "jenkins-menu-dropdown-chevron";
    dropdownChevron.dataset.href = link.href;
    dropdownChevron.addEventListener("click", (event) => {
      event.preventDefault();
    });
    link.appendChild(dropdownChevron);
  });
}

/*
 * Generates the dropdowns for the jump lists
 */
function generateDropdowns() {
  behaviorShim.specify(
    "li.children, #menuSelector, .jenkins-menu-dropdown-chevron",
    "-dropdown-",
    1000,
    (element) =>
      Utils.generateDropdown(element, (instance) => {
        const href = element.dataset.href;
        const jumplistType = !element.classList.contains("children")
          ? "contextMenu"
          : "childrenContextMenu";

        if (element.items) {
          instance.setContent(Utils.generateDropdownItems(element.items));
          return;
        }

        fetch(Path.combinePath(href, jumplistType))
          .then((response) => response.json())
          .then((json) =>
            instance.setContent(
              Utils.generateDropdownItems(
                mapChildrenItemsToDropdownItems(json.items),
              ),
            ),
          )
          .catch((error) => console.error(`Jumplist request failed:`, error))
          .finally(() => (instance.loaded = true));
      }),
  );
}

/**
 * Generates the contents for the dropdown
 * @param {DropdownItem[]}  items
 * @return {DropdownItem[]}
 */
function mapChildrenItemsToDropdownItems(items) {
  /** @type {number | null} */
  let initialGroup = null;

  return items.flatMap((item) => {
    if (item.type === "HEADER") {
      return {
        type: "HEADER",
        label: item.displayName,
      };
    }

    if (item.type === "SEPARATOR") {
      return {
        type: "SEPARATOR",
      };
    }

    const response = [];

    if (
      initialGroup != null &&
      item.group?.order !== initialGroup &&
      item.group.order > 2
    ) {
      response.push({
        type: "SEPARATOR",
      });
    }
    initialGroup = item.group?.order;

    response.push(item);
    return response;
  });
}

export default { init, mapChildrenItemsToDropdownItems };
