import Utils from "@/components/dropdowns/utils";
import behaviorShim from "@/util/behavior-shim";

/**
 * Creates a new dropdown based on the element's next sibling
 */
function init() {
  behaviorShim.specify(
    "[data-dropdown='true']",
    "-dropdown-",
    1000,
    (element) => {
      Utils.generateDropdown(element, (instance) => {
        const elements =
          element.nextElementSibling.content.children[0].children;
        const mappedItems = convertHtmlToItems(elements);

        instance.setContent(Utils.generateDropdownItems(mappedItems));
      });
    },
  );
}

/**
 * @param {HTMLElement[]} children
 * @return {DropdownItem[]}
 */
function convertHtmlToItems(children) {
  /** @type {DropdownItem[]} */
  const items = [];

  Array.from(children).forEach((child) => {
    const attributes = child.dataset;

    /** @type {DropdownItemType} */
    const type = child.dataset.dropdownType;

    switch (type) {
      case "ITEM": {
        const item = {
          displayName: attributes.dropdownText,
          id: attributes.dropdownId,
          icon: attributes.dropdownIcon,
          iconXml: attributes.dropdownIcon,
          clazz: attributes.dropdownClazz,
          semantic: attributes.dropdownSemantic,
        };

        if (attributes.dropdownConfirmationTitle) {
          item.event = {
            title: attributes.dropdownConfirmationTitle,
            description: attributes.dropdownConfirmationDescription,
            postTo: attributes.dropdownConfirmationUrl,
          };
        }

        if (attributes.dropdownHref) {
          item.event = {
            url: attributes.dropdownHref,
            type: "GET"
          };
        }

        items.push(item);
        break;
      }
      case "SUBMENU":
        items.push({
          type: "ITEM",
          displayName: attributes.dropdownText,
          icon: attributes.dropdownIcon,
          iconXml: attributes.dropdownIcon,
          event: {
            actions: convertHtmlToItems(child.content.children),
          },
        });
        break;
      case "SEPARATOR":
        items.push({ type: type });
        break;
      case "HEADER":
        items.push({ type: type, displayName: attributes.dropdownText });
        break;
      case "CUSTOM":
        items.push({ type: type, contents: child.content.cloneNode(true) });
        break;
    }
  });

  return items;
}

export default { init };
