import * as Symbols from "./symbols";
import { xmlEscape } from "@/util/security";

/**
 * @param {Object} params
 * @param {string} params.icon
 * @param {string} params.label
 * @param {string | null | undefined} params.description
 * @param {'symbol' | 'image'} params.type
 * @param {string} params.url
 * @param {string | null} params.group
 * @param {boolean | undefined} params.isExternal
 * @param {boolean | undefined} params.drillable
 * @param {string[] | string | null | undefined} params.parent
 */
export function LinkResult(params) {
  return {
    label: params.label,
    url: params.url,
    group: params.group,
    icon: params.icon,
    type: params.type,
    drillable: params.drillable === true,
    tab: params.tab === true,
    render: () => {
      return `<a class="jenkins-command-palette__results__item" href="${xmlEscape(params.url)}">
        ${params.type === "image" ? `<img alt="${xmlEscape(params.label)}" class="jenkins-command-palette__results__item__icon jenkins-avatar" src="${params.icon}" />` : ""}
        ${params.type !== "image" ? `<div class="jenkins-command-palette__results__item__icon">${params.icon}</div>` : ""}
        ${[]
          .concat(params.parent ?? [])
          .map(
            (segment) =>
              `<span class="jenkins-command-palette__results__item__parent">${xmlEscape(segment)}</span>`,
          )
          .join("")}
        ${xmlEscape(params.label)}
        ${params.description ? `<span class="jenkins-command-palette__results__item__description">${xmlEscape(params.description)}</span>` : ""}
        ${params.isExternal ? Symbols.EXTERNAL_LINK : ""}
        ${params.drillable ? `<span class="jenkins-command-palette__results__item__hint jenkins-keyboard-shortcut">Tab</span>` : ""}
    </a>`;
    },
  };
}
