import behaviorShim from "@/util/behavior-shim";

function init() {
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
