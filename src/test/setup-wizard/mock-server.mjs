import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 8099);
const TARGET = new URL(process.env.TARGET || "http://localhost:8080");
const PREFIX = process.env.PREFIX ?? "/jenkins";
const WIZARD_PROPERTIES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../core/src/main/resources/jenkins/install/pluginSetupWizard.properties",
);
const PLATFORM_PLUGINS = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../core/src/main/resources/jenkins/install/platform-plugins.json",
);
const STEP_MS = Number(process.env.STEP_MS || 120);
const UPDATES_JSON =
  process.env.UPDATES_JSON ||
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../war/work/updates/default.json",
  );

const SCENARIOS = {
  happy: "Everything installs",
  failures: "Some plugins fail to install",
  restart: "Plugins need a restart",
  offline: "No connection to the update site",
  resume: "Resume an interrupted install",
  "install-error": "Starting the install fails",
  "user-error": "Creating the first user fails validation",
  "url-error": "Instance URL fails validation",
  installing: "Stay on the installation screen",
};

const SCENARIO_START = {
  failures: () => finishInstall(),
  restart: async () => {
    await finishInstall();
    state.installState = "INITIAL_SETUP_COMPLETED";
  },
  installing: () => startInstall(suggestedPlugins()),
  "user-error": () => {
    state.installState = "CREATE_ADMIN_USER";
  },
  "url-error": () => {
    state.installState = "CONFIGURE_INSTANCE";
  },
};

const FAILING = new Set(["git", "gradle", "ldap", "email-ext"]);

let state;
let metadata;

function reset(scenario = "happy") {
  state = {
    scenario,
    installState: "NEW",
    jobs: [],
    startedAt: 0,
    restartAt: 0,
    restarted: false,
    proxyConfigured: false,
    unlocked: false,
    completed: false,
  };
}
reset();

function ok(data) {
  return { status: "ok", data };
}

function sendJson(res, body, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json;charset=UTF-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
  });
}

function fetchTarget(path) {
  return fetch(new URL(PREFIX + path, TARGET), {
    headers: { "Accept-Encoding": "identity" },
  });
}

let updateSite;

function loadUpdateSite() {
  if (updateSite !== undefined) {
    return updateSite;
  }
  try {
    const raw = fs.readFileSync(UPDATES_JSON, "utf8");
    updateSite = JSON.parse(
      raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1),
    ).plugins;
  } catch {
    console.warn(
      `No update site data at ${UPDATES_JSON}, descriptions of installed plugins will be missing`,
    );
    updateSite = null;
  }
  return updateSite;
}

function asFreshInstall(plugin) {
  const site = loadUpdateSite();
  const info = site && site[plugin.name];
  if (!plugin.installed || !info) {
    return plugin;
  }
  return {
    name: plugin.name,
    title: info.title || plugin.title,
    excerpt: info.excerpt,
    website: info.wiki || plugin.website,
    installed: false,
    dependencies: Object.fromEntries(
      (info.dependencies || [])
        .filter((d) => !d.optional)
        .map((d) => [d.name, d.version]),
    ),
  };
}

async function availablePlugins() {
  const response = await fetchTarget("/pluginManager/plugins");
  const json = await response.json();
  return json.data.map(asFreshInstall);
}

async function loadMetadata() {
  if (metadata) {
    return metadata;
  }
  metadata = new Map((await availablePlugins()).map((p) => [p.name, p]));
  return metadata;
}

function withDependencies(names) {
  const ordered = [];
  const seen = new Set();
  const visit = (name) => {
    if (seen.has(name)) {
      return;
    }
    seen.add(name);
    const plugin = metadata.get(name);
    for (const dep of Object.keys(plugin?.dependencies || {})) {
      if (metadata.has(dep)) {
        visit(dep);
      }
    }
    ordered.push(name);
  };
  names.forEach(visit);
  return ordered;
}

async function startInstall(selected) {
  await loadMetadata();
  const correlationId = "mock-" + Date.now();
  const known = selected.filter((n) => metadata.has(n));
  state.jobs = withDependencies(known).map((name) => {
    const plugin = metadata.get(name);
    return {
      name,
      version: plugin.version || "1.0",
      title: plugin.title || name,
      ...(selected.includes(name) ? { correlationId } : {}),
    };
  });
  state.startedAt = Date.now();
  state.installState =
    state.jobs.length > 0 ? "INITIAL_PLUGINS_INSTALLING" : "CREATE_ADMIN_USER";
  return correlationId;
}

async function finishInstall() {
  await startInstall(suggestedPlugins());
  state.startedAt = Date.now() - state.jobs.length * STEP_MS;
}

function readProperties(file) {
  const text = fs.readFileSync(file, "utf8").replace(/\\\r?\n[ \t]*/g, "");
  const entries = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || /^[#!]/.test(trimmed)) {
      continue;
    }
    const match = trimmed.match(/^((?:\\.|[^=:\s])+)\s*[=:\s]\s*(.*)$/);
    if (!match) {
      continue;
    }
    const unescape = (value) =>
      value.replace(/\\u([0-9a-fA-F]{4})|\\(.)/g, (_, hex, ch) =>
        hex ? String.fromCharCode(parseInt(hex, 16)) : ch,
      );
    entries[unescape(match[1])] = unescape(match[2]);
  }
  return entries;
}

function suggestedPlugins() {
  return JSON.parse(fs.readFileSync(PLATFORM_PLUGINS, "utf8")).flatMap(
    (category) =>
      category.plugins.filter((p) => p.suggested).map((p) => p.name),
  );
}

function jobStatus(index, now) {
  if (state.scenario === "installing") {
    const installed = Math.floor(state.jobs.length * 0.4);
    if (index < installed) {
      return "Success";
    }
    return index === installed ? "Installing" : "Pending";
  }
  const elapsed = now - state.startedAt;
  const done = (index + 1) * STEP_MS;
  if (elapsed < index * STEP_MS) {
    return "Pending";
  }
  if (elapsed < done) {
    return "Installing";
  }
  const job = state.jobs[index];
  if (state.scenario === "failures" && FAILING.has(job.name)) {
    return "Failure";
  }
  if (state.scenario === "restart") {
    return "SuccessButRequiresRestart";
  }
  return "Success";
}

function installStatus() {
  const now = Date.now();
  const jobs = state.jobs.map((job, i) => {
    const installStatus = jobStatus(i, now);
    return {
      ...job,
      installStatus,
      requiresRestart: String(installStatus === "SuccessButRequiresRestart"),
    };
  });
  const finished = jobs.every((j) => /Success|Failure/.test(j.installStatus));
  const failed = jobs.some((j) => j.installStatus === "Failure");
  if (
    state.installState === "INITIAL_PLUGINS_INSTALLING" &&
    finished &&
    !failed
  ) {
    state.installState = "CREATE_ADMIN_USER";
  }
  return ok({ state: state.installState, jobs });
}

function restartStatus() {
  const restartRequired =
    state.scenario === "restart" &&
    state.jobs.length > 0 &&
    !(state.restartAt && Date.now() > state.restartAt);
  return ok({ restartRequired, restartSupported: true });
}

function formParam(body, name) {
  return new URLSearchParams(body).get(name);
}

const mocks = {
  "GET /pluginManager/plugins": async () => ok(await availablePlugins()),
  "GET /updateCenter/connectionStatus": () => {
    const offline = state.scenario === "offline" && !state.proxyConfigured;
    const status = offline ? "ERROR" : "OK";
    return ok({ updatesite: status, internet: status });
  },
  "GET /updateCenter/installStatus": () => {
    if (state.scenario === "install-error") {
      return {
        status: "error",
        message: "Mock: the update site rejected the request",
      };
    }
    return installStatus();
  },
  "GET /updateCenter/incompleteInstallStatus": () => {
    if (state.scenario !== "resume" || state.jobs.length > 0) {
      return ok({});
    }
    return ok({
      "cloudbees-folder": "Success",
      "antisamy-markup-formatter": "Success",
      "build-timeout": "Pending",
      "credentials-binding": "Pending",
      timestamper: "Pending",
    });
  },
  "POST /pluginManager/installPlugins": async (body) => {
    if (state.scenario === "install-error") {
      return {
        status: "error",
        message: "Mock: the update site rejected the request",
      };
    }
    const correlationId = await startInstall(JSON.parse(body).plugins || []);
    return ok({ correlationId });
  },
  "POST /pluginManager/installPluginsDone": () => {
    state.installState = "CREATE_ADMIN_USER";
    return ok({});
  },
  "POST /pluginManager/proxyConfigure": () => {
    state.proxyConfigured = true;
    return "";
  },
  "POST /setupWizard/createAdminUser": async (body, res) => {
    if (state.scenario === "user-error") {
      const page = await (
        await fetchTarget("/setupWizard/setupWizardFirstUser")
      ).text();
      const banner =
        '<div class="error" style="margin:1rem 0">Mock: password and confirmation do not match</div>';
      res.writeHead(422, { "Content-Type": "text/html;charset=UTF-8" });
      res.end(page.replace(/(<form[^>]*>)/, `$1${banner}`));
      return undefined;
    }
    state.installState = "CONFIGURE_INSTANCE";
    return ok({ crumbRequestField: "Jenkins-Crumb", crumb: "mock-crumb" });
  },
  "POST /setupWizard/configureInstance": (body) => {
    const json = JSON.parse(formParam(body, "json") || "{}");
    const rootUrl = json.rootUrl ?? formParam(body, "rootUrl") ?? "";
    if (state.scenario === "url-error" || !/^https?:\/\//.test(rootUrl)) {
      return {
        status: "error",
        message: "Mock: validation failed",
        data: { rootUrl: "Mock: please provide a valid URL" },
      };
    }
    state.installState = "INITIAL_SETUP_COMPLETED";
    return ok({ crumbRequestField: "Jenkins-Crumb", crumb: "mock-crumb" });
  },
  "POST /setupWizard/completeInstall": () => {
    state.completed = true;
    state.installState = "RUNNING";
    return ok({});
  },
  "GET /setupWizard/restartStatus": restartStatus,
  "POST /updateCenter/safeRestart": () => {
    state.restartAt = Date.now() + 3000;
    return "";
  },
};

function panel() {
  const links = Object.entries(SCENARIOS)
    .map(
      ([name, label]) =>
        `<a href="${PREFIX}/__mock/scenario/${name}" title="${label}" style="display:block;padding:2px 0;color:${
          name === state.scenario ? "#fff;font-weight:600" : "#bbb"
        }">${name}</a>`,
    )
    .join("");
  return `<div style="position:fixed;left:12px;bottom:12px;z-index:2147483647;background:#222;color:#fff;font:12px/1.4 system-ui;padding:10px 12px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.3)"><strong>Wizard mock</strong> · ${state.installState}${links}</div>`;
}

async function serveWithWizard(res, targetPath) {
  const response = await fetchTarget(targetPath);
  const html = await response.text();
  const assets =
    `<link rel="stylesheet" href="${PREFIX}/jsbundles/pluginSetupWizard.css" type="text/css" />` +
    `<script src="${PREFIX}/jsbundles/pluginSetupWizard.js" type="text/javascript"></script>`;
  const injected = html.includes("jsbundles/pluginSetupWizard.js")
    ? html
    : html.replace("</body>", `${assets}</body>`);
  res.writeHead(200, { "Content-Type": "text/html;charset=UTF-8" });
  res.end(injected.replace("</body>", `${panel()}</body>`));
}

function redirect(res, path) {
  res.writeHead(302, { Location: PREFIX + path });
  res.end();
}

function proxy(req, res) {
  const headers = { ...req.headers, host: TARGET.host };
  delete headers["accept-encoding"];
  const upstream = http.request(
    {
      hostname: TARGET.hostname,
      port: TARGET.port,
      path: req.url,
      method: req.method,
      headers,
    },
    (up) => {
      const out = { ...up.headers };
      if (out.location) {
        out.location = out.location.replace(
          TARGET.origin,
          `http://localhost:${PORT}`,
        );
      }
      res.writeHead(up.statusCode, out);
      up.pipe(res);
    },
  );
  upstream.on("error", (e) => {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end(`Mock: cannot reach ${TARGET.origin} (${e.message})`);
  });
  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    console.error(
      `error ${req.method} ${req.url}: ${e.cause?.code || e.message}`,
    );
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
    }
    res.end(
      `Mock: cannot reach ${TARGET.origin}${PREFIX} (${e.cause?.code || e.message})`,
    );
  });
});

async function handle(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (!url.pathname.startsWith(PREFIX)) {
    res.writeHead(302, { Location: `${PREFIX}/setupWizard/` });
    res.end();
    return;
  }
  const path = url.pathname.slice(PREFIX.length) || "/";

  const scenario = path.match(/^\/__mock\/scenario\/([\w-]+)$/);
  if (scenario) {
    reset(SCENARIOS[scenario[1]] ? scenario[1] : "happy");
    console.log(`scenario: ${state.scenario}`);
    if (state.scenario === "happy") {
      redirect(res, "/login");
      return;
    }
    state.unlocked = true;
    await SCENARIO_START[state.scenario]?.();
    redirect(res, "/setupWizard/");
    return;
  }

  if (req.method === "GET" && path === "/" && !state.completed) {
    redirect(res, state.unlocked ? "/setupWizard/" : "/login");
    return;
  }

  if (req.method === "GET" && path === "/login" && !state.unlocked) {
    await serveWithWizard(res, "/setupWizard/authenticate-security-token");
    return;
  }

  if (req.method === "POST" && /j_spring_security_check$/.test(path)) {
    state.unlocked = true;
    console.log(`mock  POST ${path}`);
    redirect(res, "/setupWizard/");
    return;
  }

  if (req.method === "GET" && path === "/setupWizard/") {
    await serveWithWizard(res, "/setupWizard/");
    return;
  }

  if (
    req.method === "GET" &&
    path === "/i18n/resourceBundle" &&
    url.searchParams.get("baseName") === "jenkins.install.pluginSetupWizard"
  ) {
    sendJson(res, ok(readProperties(WIZARD_PROPERTIES)));
    return;
  }

  const mock = mocks[`${req.method} ${path}`];
  if (mock) {
    const body = req.method === "POST" ? await readBody(req) : "";
    const result = await mock(body, res);
    console.log(`mock  ${req.method} ${path}`);
    if (result === undefined) {
      return;
    }
    if (typeof result === "string") {
      res.writeHead(200, { "Content-Type": "text/html;charset=UTF-8" });
      res.end(result);
      return;
    }
    sendJson(res, result);
    return;
  }

  const validation = /^\/descriptorByName\/[^/]+\/check[A-Z]\w*$/.test(path);
  if (req.method !== "GET" && req.method !== "HEAD" && !validation) {
    console.warn(`blocked ${req.method} ${path}`);
    sendJson(
      res,
      { status: "error", message: `Mock: ${req.method} ${path} is not mocked` },
      501,
    );
    return;
  }

  proxy(req, res);
}

server.listen(PORT, () => {
  console.log(
    `Setup wizard mock: http://localhost:${PORT}${PREFIX}/setupWizard/`,
  );
  console.log(`Proxying GET requests to ${TARGET.origin}${PREFIX}`);
  console.log(`Scenarios: ${Object.keys(SCENARIOS).join(", ")}`);
});
