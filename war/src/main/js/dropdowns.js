import tippy from 'tippy.js'

let dropdownInstances = []
const globalPlugin = {
  fn() {
    return {
      onCreate(instance) {
        dropdownInstances = dropdownInstances.concat(instance);
      },
      onDestroy(instance) {
        dropdownInstances = dropdownInstances.filter(i => i !== instance);
      }
    }
  }
}

tippy.setDefaultProps({
  plugins: [globalPlugin]
})

function combinePath(a,b) {
  var qs
  var i = a.indexOf('?')
  if (i >= 0) {
    qs=a.substring(i);
  } else {
    qs=""
  }

  i = a.indexOf('#')
  if (i >= 0) {
    a=a.substring(0, i)
  }

  if (a.endsWith('/')) {
    return a + b + qs
  }
  return a + '/' + b + qs
}

registerDropdowns()

/**
 * Registers dropdowns for the page
 * If called again, destroys existing dropdowns and registers them again (useful for progressive rendering)
 */
function registerDropdowns() {
  dropdownInstances.forEach(instance => {
    instance.destroy()
  })

  tippy('[dropdown]', {
    content: element => document.getElementById(element.getAttribute('menu')).innerHTML,
    interactive: true,
    trigger: 'click',
    allowHTML: true,
    placement: "bottom-start",
    arrow: false,
    theme: 'popover',
    offset: [0, 0],
    animation: 'popover'
  })

  document.querySelectorAll("A.model-link").forEach(function (link) {
    const dropdownChevron = document.createElement("button")
    dropdownChevron.className = "jenkins-menu-dropdown-chevron"
    dropdownChevron.setAttribute("href", link.href)
    dropdownChevron.addEventListener("click", function(event) {
      event.preventDefault()
    })
    link.appendChild(dropdownChevron)
  });

  const generatePopoverDetails = (isSubmenu) => {
    return {
      content: "<p class='jenkins-spinner'></p>",
      interactive: true,
      trigger: isSubmenu ? "mouseenter" : "click",
      allowHTML: true,
      placement: isSubmenu ? "right-start" : "bottom-start",
      arrow: false,
      theme: 'popover',
      appendTo: document.body,
      offset: isSubmenu ? [-7, 0] : [0, 0],
      animation: 'popover',
      onShow(instance) {
        instance.popper.addEventListener("click", () => {
          instance.hide();
        });

        // If the instance already has existing items, render those instead
        if (instance.reference.items || (instance.reference.target && instance.reference.target.items)) {
          generateMenuItems(instance.reference.items || instance.reference.target.items())
        } else {
          const href = instance.reference.target ? instance.reference.target.href : instance.reference.getAttribute('href')

          fetch(combinePath(href, "contextMenu"))
            .then((response) => response.json())
            .then((json) => generateMenuItems(json.items))
            .catch((error) => {
              // Fallback if the network request failed
              instance.setContent(`Request failed. ${error}`)
            })
        }

        function generateMenuItems(items) {
          let menuItems = document.createElement("div")
          menuItems.append(...items.map(function (x) {
            if (x.type === "HEADER") {
              return createElementFromHTML(`<p class="jenkins-popover__header">${x.text || x.displayName}</p>`)
            }

            if (x.type === "SEPARATOR") {
              return createElementFromHTML(`<div class="jenkins-popover__separator"></div>`)
            }

            const tagName = x.post ? "button" : "a";

            const menuItem = createElementFromHTML(`<${tagName} class="jenkins-popover__item" href="${x.url}">
                                      ${x.icon ? `<div class="jenkins-popover__item__icon"><img src="${x.icon}" alt="" /></div>` : ``}
                                      ${x.text || x.displayName}
                                      ${x.subMenu != null ? `<span class="jenkins-popover__item__chevron"></span>` : ``}
                                  </${tagName}>`)

            if (x.post || x.requiresConfirmation) {
              menuItem.addEventListener("click", () => {
                if (x.requiresConfirmation) {
                  if (confirm((x.text || x.displayName) + ": are you sure?")) { // TODO I18N
                    var form = document.createElement('form');
                    form.setAttribute('method', x.post ? 'POST' : 'GET');
                    form.setAttribute('action', x.url);
                    if (x.post) {
                      crumb.appendToForm(form);
                    }
                    document.body.appendChild(form);
                    form.submit();
                  }
                } else {
                  new Ajax.Request(x.url);
                }
              })
            }

            if (x.subMenu != null) {
              menuItem.items = x.subMenu.items
              tippy(menuItem, generatePopoverDetails(true))
            }

            return menuItem
          }))

          instance.setContent(menuItems)
        }

      },
      onHidden(instance) {
        instance.setContent("<p class='jenkins-spinner'></p>")
      }
    }
  }

  tippy('li.children, #menuSelector, .jenkins-menu-dropdown-chevron', generatePopoverDetails(false))

  function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
  }

  document.querySelectorAll(".hetero-list-add").forEach(function(e) {
    // Templates for hetero-lists are stored in a div on load (.prototypes), so we
    // need to take them and translate them into template objects we can use for our dropdown menu
    const prototypes = e.parentElement.previousSibling
    const insertionPoint = e.parentElement.previousSibling.previousSibling

    // Initialize drag and drop
    const supportsDragDrop = registerSortableDragDrop(insertionPoint.parentElement);

    // Translate the .prototypes div children into templates for the dropdown menu
    const templates = [];
    [...prototypes.children].forEach(function (n) {
      const name = n.getAttribute("name");
      const title = n.getAttribute("title");
      const descriptorId = n.getAttribute("descriptorId");
      templates.push({html: n.innerHTML, name, title, descriptorId});
    });

    // Remove the .prototypes div to prevent tampering
    Element.remove(prototypes);

    // Generate a list of menu items for the dropdown to use
    let menuItems = document.createElement("div")
    menuItems.append(...templates.map(function (templateItem) {
      const menuItem = createElementFromHTML(`<button type="button" class="jenkins-popover__item">
                        ${templateItem.title}
                      </button>`)

      menuItem.addEventListener("click", () => {
        const card = document.createElement("div");
        card.className = "repeated-chunk";
        card.setAttribute("name", templateItem.name);
        card.setAttribute("descriptorId", templateItem.descriptorId);
        card.innerHTML = templateItem.html;

        insertionPoint.parentElement.insertBefore(card, insertionPoint)

        renderOnDemand(findElementsBySelector(card,"div.config-page")[0],() => {});

        Behaviour.applySubtree(card,true);
        ensureVisible(card);
        layoutUpdateCallback.call();

        if (supportsDragDrop) {
          registerSortableDragDrop(insertionPoint.parentElement)
        }
      });

      return menuItem
    }))

    // Add the tippy dropdown to the .hetero-list-add button
    tippy(e, {
      interactive: true,
      trigger: 'click',
      allowHTML: true,
      placement: "bottom-start",
      arrow: false,
      theme: 'popover',
      offset: [0, 0],
      animation: 'popover',
      content: menuItems,
      onShow(instance) {
        instance.popper.addEventListener("click", () => {
          instance.hide();
        });
      },
    })
  })
}


