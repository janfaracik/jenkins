import path from "node:path";
import { fileURLToPath } from "node:url";

import Handlebars from "handlebars";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolveFromRoot = (...segments) => path.resolve(__dirname, ...segments);
const resolveFromMain = (...segments) =>
  resolveFromRoot("src/main", ...segments);
const sourceRoots = {
  js: resolveFromMain("js"),
  scss: resolveFromMain("scss"),
};
const fromJs = (source) => ({ root: "js", source });
const fromScss = (source) => ({ root: "scss", source });
const jenkinsRuntimeAssetPath = /^(?:\.\.\/)+images\//;

const bundles = [
  {
    name: "pluginSetupWizard",
    script: "pluginSetupWizard.js",
    style: fromScss("pluginSetupWizard.scss"),
  },
  { name: "plugin-manager-ui", script: "plugin-manager-ui.js" },
  {
    name: "add-item",
    script: "add-item.js",
    style: fromJs("add-item.scss"),
  },
  { name: "pages/computer-set", script: "pages/computer-set" },
  { name: "pages/dashboard", script: "pages/dashboard" },
  {
    name: "pages/manage-jenkins/system-information",
    script: "pages/manage-jenkins/system-information",
  },
  { name: "app", script: "app.js" },
  { name: "header", script: "components/header/index.js" },
  {
    name: "pages/cloud-set",
    script: "pages/cloud-set",
    style: fromJs("pages/cloud-set/index.scss"),
  },
  { name: "pages/manage-jenkins", script: "pages/manage-jenkins" },
  { name: "pages/register", script: "pages/register" },
  { name: "keyboard-shortcuts", script: "keyboard-shortcuts.js" },
  { name: "sortable-drag-drop", script: "sortable-drag-drop.js" },
  {
    name: "section-to-sidebar-items",
    script: "section-to-sidebar-items.js",
  },
  { name: "section-to-tabs", script: "section-to-tabs.js" },
  {
    name: "components/row-selection-controller",
    script: "components/row-selection-controller",
  },
  {
    name: "pages/project/builds-card",
    script: "pages/project/builds-card.js",
  },
  { name: "simple-page", style: fromScss("simple-page.scss") },
  { name: "styles", style: fromScss("styles.scss") },
];

function resolveSource({ root, source }) {
  return path.resolve(sourceRoots[root], source);
}

const input = Object.fromEntries(
  bundles.flatMap(({ name, script, style }) => [
    ...(script ? [[name, resolveSource(fromJs(script))]] : []),
    ...(style ? [[`__css/${name}`, resolveSource(style)]] : []),
  ]),
);

const cssAssetNames = new Map(
  bundles
    .filter(({ style }) => style)
    .map(({ name, style }) => [
      resolveSource(style).split(path.sep).join("/"),
      `${name}.css`,
    ]),
);

const templateHelpers = {
  id: true,
  ifeq: true,
  ifneq: true,
  "in-array": true,
  replace: true,
  pluginCountForCategory: true,
  totalPluginCount: true,
  inSelectedPlugins: true,
  dependencyCount: true,
  eachDependency: true,
  ifVisibleDependency: true,
  hasDependencies: true,
};

function isJenkinsRuntimeAssetPath(source) {
  return jenkinsRuntimeAssetPath.test(source);
}

/**
 * Vite/Rollup plugin that turns .hbs files into runtime Handlebars template modules.
 *
 * Precompiles each template at build time, imports the Handlebars runtime and
 * Jenkins helper registration, then exports a callable template function so
 * templates can be rendered without compiling in the browser.
 */
function handlebarsTemplatesPlugin() {
  return {
    name: "jenkins-handlebars-templates",
    transform(source, id) {
      if (!id.endsWith(".hbs")) {
        return null;
      }

      const precompiled = Handlebars.precompile(source, {
        knownHelpers: templateHelpers,
        knownHelpersOnly: false,
      });

      return {
        code: [
          'import Handlebars from "handlebars/runtime.js";',
          'import registerHandlebarsHelpers from "@/handlebars-helpers/register";',
          "registerHandlebarsHelpers(Handlebars);",
          `export default Handlebars.template(${precompiled});`,
        ].join("\n"),
        map: null,
      };
    },
  };
}

/**
 * Vite/Rollup plugin that preserves Jenkins-relative image URLs in CSS.
 *
 * Rewrites relative url("../../images/...") references to a temporary
 * placeholder before asset processing so the bundler does not fingerprint,
 * inline, or relocate those files, then restores the original url(...) in
 * emitted CSS.
 */
function preserveJenkinsCssAssetsPlugin() {
  return {
    name: "preserve-jenkins-css-assets",
    enforce: "pre",
    transform(source, id) {
      if (!/\.(css|scss)$/.test(id)) {
        return null;
      }

      const nextSource = source.replace(
        /url\((['"]?)((?:\.\.\/)+images\/[^'")]+)\1\)/g,
        (_match, _quote, assetPath) => `jenkins-asset("${assetPath}")`,
      );

      if (nextSource === source) {
        return null;
      }

      return {
        code: nextSource,
        map: null,
      };
    },
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) {
          continue;
        }

        asset.source = String(asset.source).replace(
          /jenkins-asset\((['"][^'"]+['"])\)/g,
          "url($1)",
        );
      }
    },
  };
}

export default defineConfig(() => ({
  appType: "custom",
  base: "./",
  publicDir: false,
  plugins: [handlebarsTemplatesPlugin(), preserveJenkinsCssAssetsPlugin()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: sourceRoots.js,
      },
      {
        find: /^handlebars$/,
        replacement: resolveFromRoot("node_modules/handlebars/runtime.js"),
      },
    ],
  },
  build: {
    emptyOutDir: true,
    manifest: false,
    outDir: resolveFromRoot("war/src/main/webapp/jsbundles"),
    rollupOptions: {
      external(source) {
        return typeof source === "string" && isJenkinsRuntimeAssetPath(source);
      },
      input,
      output: {
        assetFileNames(assetInfo) {
          for (const fileName of assetInfo.originalFileNames || []) {
            const cssAssetName = cssAssetNames.get(
              path.resolve(fileName).split(path.sep).join("/"),
            );

            if (cssAssetName) {
              return cssAssetName;
            }
          }

          return "assets/[name]-[hash][extname]";
        },
        chunkFileNames: "chunks/[name]-[hash].js",
        entryFileNames: "[name].js",
        manualChunks(id) {
          if (id.includes("/node_modules/")) {
            return "vendors";
          }
        },
      },
    },
    sourcemap: true,
  },
}));
