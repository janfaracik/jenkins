const eslintConfigPrettier = require("eslint-config-prettier");
const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
  // Global ignores
  {
    ignores: [
      "**/target/",
      "**/work/",

      // Node
      "**/node/",

      // Generated JavaScript Bundles
      "**/jsbundles/",

      // External scripts
      "war/.pnp.cjs",
      "war/.pnp.loader.mjs",
      "war/src/main/js/plugin-setup-wizard/bootstrap-detached.js",
      "war/src/main/webapp/scripts/yui/*",
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        applyTooltip: "readonly",
        AutoScroller: "readonly",
        Behaviour: "readonly",
        breadcrumbs: "readonly",
        buildFormTree: "readonly",
        CodeMirror: "readonly",
        ComboBox: "readonly",
        COMBOBOX_VERSION: "writeable",
        createSearchBox: "readonly",
        crumb: "readonly",
        dialog: "readonly",
        ensureVisible: "readonly",
        escapeHTML: "readonly",
        findAncestor: "readonly",
        findAncestorClass: "readonly",
        findElementsBySelector: "readonly",
        findFormParent: "readonly",
        fireEvent: "readonly",
        Form: "readonly",
        FormChecker: "readonly",
        getElementOverflowParams: "readonly",
        hoverNotification: "readonly",
        iota: "writeable",
        isInsideRemovable: "readonly",
        isPageVisible: "readonly",
        isRunAsTest: "readonly",
        layoutUpdateCallback: "readonly",
        loadScript: "readonly",
        makeButton: "readonly",
        notificationBar: "readonly",
        object: "readonly",
        objectToUrlFormEncoded: "readonly",
        onSetupWizardInitialized: "readonly",
        refillOnChange: "readonly",
        refreshPart: "readonly",
        registerSortableDragDrop: "readonly",
        renderOnDemand: "readonly",
        rootURL: "readonly",
        safeValidateButton: "readonly",
        setupWizardExtensions: "readonly",
        SharedArrayBuffer: "readonly",
        shortenName: "readonly",
        Sortable: "readonly",
        toQueryString: "readonly",
        ts_refresh: "readonly",
        updateOptionalBlock: "readonly",
        Utilities: "readonly",
        UTILITIES_VERSION: "writeable",
        YAHOO: "readonly",
      },
    },
  },
  // Uses eslint default ruleset
  js.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      curly: "error",
    },
  },
  {
    files: [
      "eslint.config.cjs",
      "war/postcss.config.js",
      "war/webpack.config.js",
      "war/.stylelintrc.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
