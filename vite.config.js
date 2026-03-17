import path from "node:path";
import { fileURLToPath } from "node:url";

import Handlebars from "handlebars";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolveFromRoot = (...segments) => path.resolve(__dirname, ...segments);

const input = {
  pluginSetupWizard: resolveFromRoot(
    "src/main/js/entries/pluginSetupWizard.js",
  ),
  "plugin-manager-ui": resolveFromRoot("src/main/js/plugin-manager-ui.js"),
  "add-item": resolveFromRoot("src/main/js/entries/add-item.js"),
  "pages/computer-set": resolveFromRoot("src/main/js/pages/computer-set"),
  "pages/dashboard": resolveFromRoot("src/main/js/pages/dashboard"),
  "pages/manage-jenkins/system-information": resolveFromRoot(
    "src/main/js/pages/manage-jenkins/system-information",
  ),
  app: resolveFromRoot("src/main/js/app.js"),
  header: resolveFromRoot("src/main/js/components/header/index.js"),
  "pages/cloud-set": resolveFromRoot("src/main/js/entries/pages/cloud-set.js"),
  "pages/manage-jenkins": resolveFromRoot("src/main/js/pages/manage-jenkins"),
  "pages/register": resolveFromRoot("src/main/js/pages/register"),
  "keyboard-shortcuts": resolveFromRoot("src/main/js/keyboard-shortcuts.js"),
  "sortable-drag-drop": resolveFromRoot("src/main/js/sortable-drag-drop.js"),
  "section-to-sidebar-items": resolveFromRoot(
    "src/main/js/section-to-sidebar-items.js",
  ),
  "section-to-tabs": resolveFromRoot("src/main/js/section-to-tabs.js"),
  "components/row-selection-controller": resolveFromRoot(
    "src/main/js/components/row-selection-controller",
  ),
  "pages/project/builds-card": resolveFromRoot(
    "src/main/js/pages/project/builds-card.js",
  ),
  "simple-page": resolveFromRoot("src/main/js/entries/simple-page.js"),
  styles: resolveFromRoot("src/main/js/entries/styles.js"),
};

const cssOnlyEntries = new Set(["styles.js", "simple-page.js"]);
const cssAssetNames = new Map([
  ["add-item.css", "add-item.css"],
  ["cloud-set.css", "pages/cloud-set.css"],
  ["pluginSetupWizard.css", "pluginSetupWizard.css"],
  ["simple-page.css", "simple-page.css"],
  ["styles.css", "styles.css"],
]);

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

function preserveJenkinsCssAssetsPlugin() {
  return {
    name: "preserve-jenkins-css-assets",
    enforce: "pre",
    transform(source, id) {
      if (!/\.(css|scss)$/.test(id)) {
        return null;
      }

      const nextSource = source.replace(
        /url\((['"]?)(\.\.\/images\/[^'")]+)\1\)/g,
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
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && cssOnlyEntries.has(fileName)) {
          delete bundle[fileName];
          delete bundle[`${fileName}.map`];
        }
      }

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

export default defineConfig(({ mode }) => ({
  appType: "custom",
  base: "./",
  publicDir: false,
  plugins: [handlebarsTemplatesPlugin(), preserveJenkinsCssAssetsPlugin()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: resolveFromRoot("src/main/js"),
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
      input,
      output: {
        assetFileNames(assetInfo) {
          const assetName = path.basename(
            assetInfo.names?.[0] || assetInfo.name || "",
          );

          if (cssAssetNames.has(assetName)) {
            return cssAssetNames.get(assetName);
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
