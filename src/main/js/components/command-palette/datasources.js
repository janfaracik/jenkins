import { LinkResult } from "./models";
import Search from "@/api/search";

function isExternal(url) {
  if (!/^https?:\/\//.test(url)) {
    return false;
  }
  return new URL(url).origin !== window.location.origin;
}

export const JenkinsSearchSource = {
  execute(query, scope) {
    const rootUrl = document.head.dataset.rooturl;

    function correctAddress(url) {
      if (url === "#" || /^https?:\/\//.test(url)) {
        return url;
      }

      if (url.startsWith("/")) {
        url = url.substring(1);
      }

      return rootUrl + "/" + url;
    }

    return Search.search(query, scope?.url).then((rsp) => {
      if (!rsp.ok) {
        return [];
      }

      return rsp.json().then((data) => {
        return data["suggestions"].slice().map((e) =>
          LinkResult({
            icon: e.icon,
            type: e.type,
            label: e.name,
            description: e.description,
            url: correctAddress(e.url),
            group: e.group,
            drillable: e.drillable,
            parent: e.parent,
            tab: e.tab,
            semantic: e.semantic,
            badge: e.badge,
            menuItem: e.menuItem ? JSON.parse(e.menuItem) : null,
            isExternal: isExternal(e.url),
          }),
        );
      });
    });
  },
};
