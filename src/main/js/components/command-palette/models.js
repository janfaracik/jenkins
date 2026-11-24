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
 * @param {Object | null | undefined} params.menuItem
 * @param {string | null | undefined} params.semantic
 * @param {{text: string, tooltip: string, severity: string} | null | undefined} params.badge
 * @param {string[] | string | null | undefined} params.parent
 */
export function LinkResult(params) {
  const runsAction = Boolean(params.menuItem) && params.url === "#";

  return {
    label: params.label,
    url: params.url,
    group: params.group,
    icon: params.icon,
    type: params.type,
    drillable: params.drillable === true,
    tab: params.tab === true,
    menuItem: params.menuItem,
    runsAction,
    render: () => {
      const semantic = params.semantic
        ? ` jenkins-!-${xmlEscape(params.semantic)}-color`
        : "";
      const opening = runsAction
        ? `<button type="button" class="jenkins-command-palette__results__item${semantic}">`
        : `<a class="jenkins-command-palette__results__item${semantic}" href="${xmlEscape(params.url)}">`;
      return `${opening}
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
        ${params.badge ? `<span class="jenkins-command-palette__results__item__badge jenkins-badge jenkins-!-${xmlEscape(params.badge.severity)}-color" tooltip="${xmlEscape(params.badge.tooltip ?? "")}">${xmlEscape(params.badge.text)}</span>` : ""}
        ${params.description ? `<span class="jenkins-command-palette__results__item__description">${xmlEscape(params.description)}</span>` : ""}
        ${params.isExternal ? Symbols.EXTERNAL_LINK : ""}
        ${params.drillable ? `<span class="jenkins-command-palette__results__item__hint jenkins-keyboard-shortcut">Tab</span>` : ""}
    ${runsAction ? "</button>" : "</a>"}`;
    },
  };
}
