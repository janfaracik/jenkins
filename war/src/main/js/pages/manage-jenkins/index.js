const searchBarInput = document.querySelector("#settings-search-bar");

searchBarInput.suggestions = function () {
  return Array.from(document.querySelectorAll(".jenkins-section__item"))
    .map((item) => ({
      url: item.querySelector("a").href,
      icon: item.querySelector(
        ".jenkins-section__item__icon svg, .jenkins-section__item__icon img",
      ).outerHTML,
      label: item.querySelector("dt").textContent,
    }))
    .filter((item) => !item.url.endsWith("#"));
};

const booter = document.querySelector(".booter");
const img = document.querySelector(".booter img");

document.addEventListener("mousemove", parallax);
function parallax(event) {
  this.querySelectorAll(".mouse").forEach((shift) => {
    const position = shift.getAttribute("value");

    const half = window.innerWidth / 2;
    const posFromHalf = (half - event.pageX) * -1;
    const offsetX = posFromHalf / half;


    const halfY = window.innerHeight / 2;
    const posYFromHalf = (halfY - event.pageY) * -1;
    const offsetY = posYFromHalf / halfY;

    const x = position * offsetX;
    const y = position * offsetY;

    shift.style.setProperty('--shadow-offset-x', x + 'px');
    shift.style.setProperty('--shadow-offset-y', y + 'px');
    shift.style.translate = `${x}px ${y}px`;
    shift.style.rotate = `${x}deg`;
  });
}
