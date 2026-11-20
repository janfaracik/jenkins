// htmlunit doesn't have JSON, so emulate it
if (typeof JSON=="undefined") {
    // biome-ignore lint/suspicious/noShadowRestrictedNames: polyfill for HtmlUnit
    var JSON = {
        parse : function (str) {
            return String.evalJSON(str);
        },
        stringify : function (obj) {
            return JSON.stringify(obj);
       }
    };
}
