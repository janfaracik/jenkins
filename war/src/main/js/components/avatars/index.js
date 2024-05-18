import behaviorShim from "@/util/behavior-shim";

const primaryColors = [
  "blue",
  "orange",
  "red",
  "green",
  "pink",
  "brown",
  "cyan",
  "yellow",
  "indigo",
  "purple",
];
const secondaryColors = Array.from(primaryColors).reverse();

function getInitials(name) {
  return name
    .match(/(^\S\S?|\b\S)?/g)
    .join("")
    .match(/(^\S|\S$)?/g)
    .join("")
    .toUpperCase();
}

/**
 * Generate a random number based on the string seed
 * @param {string} seed
 * @param {number} maximum
 */
function generateColorIndex(seed, maximum) {
  let random = 0;
  for (let i = 0; i < seed.length; i++) {
    random += seed.charCodeAt(i);
  }
  random = random % maximum;

  return random;
}

function init() {
  behaviorShim.specify(".jenkins-avatar", "-avatar-", 1000, (avatar) => {
    const fullName = avatar.dataset.fullname;
    const initials = getInitials(fullName);
    const initialsElement = avatar.querySelector(".jenkins-avatar__initials");
    const colorIndex = generateColorIndex(fullName, primaryColors.length);
    const angle = `${generateColorIndex(fullName, 360)}deg`;
    const primaryColor = `var(--${primaryColors[colorIndex]})`;
    const secondaryColor = `var(--${secondaryColors[colorIndex]})`;

    avatar.style.setProperty("--gradient-angle", angle);
    avatar.style.setProperty("--gradient-1", primaryColor);
    avatar.style.setProperty("--gradient-2", secondaryColor);
    initialsElement.dataset.initials = initials;
    initialsElement.textContent = initials;
  });
}

export default { init };
