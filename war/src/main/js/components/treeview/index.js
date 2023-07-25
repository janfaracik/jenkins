import { createElementFromHtml } from "@/util/dom";
import behaviorShim from "@/util/behavior-shim";

function init() {
  function insertIntoTree(tree, path) {
    const parts = path.split('/');
    let currentNode = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (!currentNode[part]) {
        if (i === parts.length - 1) {
          currentNode[part] = path; // Store the full path as the leaf node
        } else {
          currentNode[part] = {}; // Create a new subdirectory node
        }
      }

      currentNode = currentNode[part];
    }
  }

  function listToTree(paths) {
    const tree = {};

    for (const path of paths) {
      insertIntoTree(tree, path);
    }

    return tree;
  }

  const treeme = document.querySelector(`[data-type="treeview"]`);
  const treedata = treeme.dataset.treeviewData.replace("[", "").replace("]", "").split(", ");
  const treeObject = listToTree(treedata);

  treeme.appendChild(createNestedDivs(treeObject));

  function createNestedDivs(tree) {
    const response = createElementFromHtml(`<div class="jenkins-treeview__group-inner"></div>`)

    for (const key in tree) {
      if (typeof tree[key] === 'string') {
        const node = createElementFromHtml(`
        <a class="jenkins-treeview__item" href="${key}">
          ${key}
        </a>
      `);
        response.appendChild(node);
      } else {
        const node = createElementFromHtml(`
        <button class="jenkins-treeview__folder jenkins-treeview__folder--collapsed">
          <div class="iconthing">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144"/></svg>
          </div>
          ${key}
        </button>
      `);

        response.appendChild(node);
        response.appendChild(createNestedDivs(tree[key]));
      }
    }

    const wrapper = createElementFromHtml(`<div class="jenkins-treeview__group jenkins-treeview__group--collapsed"></div>`)
    wrapper.appendChild(response);
    return wrapper;
  }

  behaviorShim.specify(
    ".jenkins-treeview__folder",
    "-treeeeee-",
    1000,
    (element) => {
      element.addEventListener("click", () => {
        element.classList.toggle('jenkins-treeview__folder--collapsed');
        element.nextSibling.classList.toggle('jenkins-treeview__group--collapsed');
      })
    }
  );

}

export default { init };
