import Handlebars from "handlebars";
import jenkins from "./util/jenkins";
import behaviorShim from "./util/behavior-shim";
import pluginManager from "./api/pluginManager";
import securityConfig from "./api/securityConfig";
import errorPanel from "./templates/errorPanel.hbs";
import loadingPanel from "./templates/loadingPanel.hbs";
import progressPanel from "./templates/progressPanel.hbs";
import pluginSuccessPanel from "./templates/successPanel.hbs";
import pluginSelectionPanel from "./templates/pluginSelectionPanel.hbs";
import setupCompletePanel from "./templates/setupCompletePanel.hbs";
import proxyConfigPanel from "./templates/proxyConfigPanel.hbs";
import firstUserPanel from "./templates/firstUserPanel.hbs";
import configureInstancePanel from "./templates/configureInstance.hbs";
import offlinePanel from "./templates/offlinePanel.hbs";
import pluginSetupWizard from "./templates/pluginSetupWizard.hbs";
import incompleteInstallationPanel from "./templates/incompleteInstallationPanel.hbs";
import pluginSelectList from "./templates/pluginSelectList.hbs";
import installList from "./templates/installList.hbs";

Handlebars.registerPartial("pluginSelectList", pluginSelectList);
Handlebars.registerPartial("installList", installList);

function toFragment(html) {
  var template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
}

function isVisible(element) {
  return element.offsetParent !== null;
}

function iframeDocument(iframe) {
  return iframe ? iframe.contentDocument : null;
}

var createPluginSetupWizard = function (appendTarget) {
  Handlebars.registerHelper("inSelectedPlugins", function (val, options) {
    if (selectedPluginNames.indexOf(val) >= 0) {
      return options.fn();
    }
  });

  var handleGenericError = function (success) {
    return function () {
      var self = this || window;

      if (self.isError) {
        var errorMessage = self.errorMessage;
        if (!errorMessage || self.errorMessage === "timeout") {
          errorMessage = translations.installWizard_error_connection;
        } else {
          errorMessage =
            translations.installWizard_error_message + " " + errorMessage;
        }
        setPanel(errorPanel, { errorMessage: errorMessage });
        return;
      }
      success.apply(self, arguments);
    };
  };

  var pluginList;
  var selectedPluginNames;

  var categories = [];
  var availablePlugins = {};
  var categorizedPlugins = {};

  var wizard = toFragment(pluginSetupWizard()).firstElementChild;
  appendTarget.append(wizard);
  var container = wizard.querySelector(".app-setup-wizard__dialog");
  var currentPanel;

  var self = this;

  var find = function (selector) {
    return wizard.querySelector(selector);
  };

  var findAll = function (selector) {
    return Array.from(wizard.querySelectorAll(selector));
  };

  var on = function (type, selector, handler) {
    wizard.addEventListener(type, function (e) {
      var target = e.target.closest(selector);
      if (target && wizard.contains(target)) {
        handler.call(target, e);
      }
    });
  };

  var setButtonsDisabled = function (disabled) {
    findAll("button").forEach(function (button) {
      button.disabled = disabled;
    });
  };

  var translations = {};

  var getJenkinsVersionFull = function () {
    return document.body.dataset.version || "";
  };

  var getJenkinsVersion = function () {
    return getJenkinsVersionFull().replace(/(\d[.][\d.]+).*/, "$1");
  };

  var setPanel = function (panel, data, onComplete) {
    var oncomplete = function () {
      var content = Array.from(
        document.querySelectorAll("[data-load-content]"),
      );
      if (content.length === 0) {
        if (onComplete) {
          onComplete();
        }
        return;
      }
      content.forEach(function (el) {
        jenkins.get(
          el.getAttribute("data-load-content"),
          function (html) {
            el.innerHTML = html;
            if (onComplete) {
              onComplete();
            }
          },
          { dataType: "html" },
        );
      });
    };
    var html = panel(
      Object.assign(
        {
          translations: translations,
          baseUrl: jenkins.baseUrl,
          jenkinsVersion: getJenkinsVersion(),
        },
        data,
      ),
    );
    if (panel === currentPanel) {
      var focused = document.activeElement;
      var focusPath = [];
      while (focused && focused.parentElement && focused !== document.body) {
        focusPath.push(
          Array.from(focused.parentElement.children).indexOf(focused),
        );
        focused = focused.parentElement;
      }
      toFragment(html)
        .querySelectorAll("[id]")
        .forEach(function (el) {
          var existing = document.getElementById(el.id);
          if (existing && el.outerHTML !== existing.outerHTML) {
            existing.replaceWith(el);
          }
        });

      oncomplete();

      var e = document.body;
      for (var i = focusPath.length - 1; i >= 0 && e; i--) {
        e = e.children[focusPath[i]];
      }
      if (e && document.activeElement !== e) {
        e.focus();
      }
      return;
    }

    var append = function () {
      currentPanel = panel;
      container.replaceChildren(toFragment(html));

      oncomplete();
    };

    append();
  };

  var installingPlugins = [];
  var failedPluginNames = [];
  var getInstallingPlugin = function (plugName) {
    for (var i = 0; i < installingPlugins.length; i++) {
      var p = installingPlugins[i];
      if (p.name === plugName) {
        return p;
      }
    }
    return null;
  };
  var setFailureStatus = function (plugData) {
    var plugFailIdx = failedPluginNames.indexOf(plugData.name);
    if (/.*Fail.*/.test(plugData.installStatus)) {
      if (plugFailIdx < 0) {
        failedPluginNames.push(plugData.name);
      }
    } else if (plugFailIdx >= 0) {
      failedPluginNames.splice(plugFailIdx, 1);
    }
  };

  var getAllDependencies = function (pluginName, deps) {
    if (!deps) {
      deps = [];
      getAllDependencies(pluginName, deps);
      return deps;
    }
    if (deps.indexOf(pluginName) >= 0) {
      return;
    }
    deps.push(pluginName);

    var plug = availablePlugins[pluginName];
    if (plug) {
      if (plug.dependencies) {
        for (var k in plug.dependencies) {
          getAllDependencies(k, deps);
        }
      }
      if (plug.neededDependencies) {
        for (var i = 0; i < plug.neededDependencies.length; i++) {
          getAllDependencies(plug.neededDependencies[i].name, deps);
        }
      }
    }
  };

  var dependencyLabel = function (plugin) {
    var count = (plugin.allDependencies || []).length - 1;
    if (count < 1) {
      return "";
    }
    if (count === 1) {
      return translate("installWizard_installing_dependency", "+ 1 dependency");
    }
    return translate(
      "installWizard_installing_dependencies",
      "+ {0} dependencies",
    ).replace("{0}", count);
  };

  var initInstallingPluginList = function () {
    installingPlugins = [];
    for (var i = 0; i < selectedPluginNames.length; i++) {
      var p = availablePlugins[selectedPluginNames[i]];
      if (p) {
        installingPlugins.push(
          Object.assign(
            { installStatus: "pending", dependencyLabel: dependencyLabel(p) },
            p,
          ),
        );
      }
    }
  };

  var renderProgressPanel = function (data) {
    return progressPanel(
      Object.assign(
        {
          title: translate(
            "installWizard_installingPlugins_title",
            "Installing plugins",
          ),
        },
        data,
      ),
    );
  };

  var installPlugins = function (pluginNames) {
    selectedPluginNames = pluginNames;
    setPanel(renderProgressPanel, { installingPlugins: [] });

    pluginManager.installPlugins(
      pluginNames,
      handleGenericError(function () {
        showStatePanel();
      }),
    );
  };

  var enableButtonsAfterFrameLoad = function () {
    findAll("iframe[src]").forEach(function (iframe) {
      iframe.addEventListener("load", function () {
        setButtonsDisabled(false);
      });
    });
  };

  var enableButtonsImmediately = function () {
    setButtonsDisabled(false);
  };

  var displayErrors = function (iframe, errors) {
    if (!errors) {
      return;
    }
    var doc = iframeDocument(iframe);
    Object.keys(errors).forEach(function (name) {
      var inputField = doc.querySelector('[name="' + name + '"]');
      var row = inputField ? inputField.closest(".jenkins-form-item") : null;
      if (!row) {
        return;
      }
      row.classList.add("has-error");
      var errorArea = row.querySelector(".error-panel");
      if (errorArea) {
        errorArea.textContent = errors[name];
      }
    });
  };

  var setupFirstUser = function () {
    setPanel(firstUserPanel, {}, enableButtonsAfterFrameLoad);
  };

  var showConfigureInstance = function (messages) {
    setPanel(configureInstancePanel, messages, enableButtonsAfterFrameLoad);
  };

  var showSetupCompletePanel = function (messages) {
    pluginManager.getRestartStatus(function (restartStatus) {
      setPanel(setupCompletePanel, Object.assign({}, restartStatus, messages));
    });
  };

  var stateHandlers = {
    DEFAULT: function () {
      loadCustomPluginPanel();
    },
    CREATE_ADMIN_USER: function () {
      setupFirstUser();
    },
    CONFIGURE_INSTANCE: function () {
      showConfigureInstance();
    },
    RUNNING: function () {
      showSetupCompletePanel();
    },
    INITIAL_SETUP_COMPLETED: function () {
      showSetupCompletePanel();
    },
    INITIAL_PLUGINS_INSTALLING: function () {
      showInstallProgress();
    },
  };
  var showStatePanel = function (state) {
    if (!state) {
      pluginManager.installStatus(
        handleGenericError(function (data) {
          showStatePanel(data.state);
        }),
      );
      return;
    }
    if (state in stateHandlers) {
      stateHandlers[state]();
    } else {
      stateHandlers.DEFAULT();
    }
  };

  var showInstallProgress = function () {
    if (failedPluginNames.length > 0) {
      setPanel(pluginSuccessPanel, {
        installingPlugins: installingPlugins,
        failedPlugins: true,
      });
      return;
    }

    initInstallingPluginList();
    setPanel(renderProgressPanel, { installingPlugins: installingPlugins });

    var updateStatus = function () {
      pluginManager.installStatus(
        handleGenericError(function (data) {
          var jobs = data.jobs;

          var i, j;
          var complete = 0;
          var total = 0;

          for (i = 0; i < jobs.length; i++) {
            j = jobs[i];
            total++;
            if (
              /.*Success.*/.test(j.installStatus) ||
              /.*Fail.*/.test(j.installStatus)
            ) {
              complete++;
            }
          }

          if (total === 0) {
            total = installingPlugins.length;
          }

          var progressBar = find(".app-setup-wizard__progress > span");
          if (progressBar) {
            progressBar.style.width = (100.0 * complete) / total + "%";
          }

          var active = new Set();

          for (i = 0; i < jobs.length; i++) {
            j = jobs[i];
            setFailureStatus(j);

            if (/.*Install.*/.test(j.installStatus)) {
              active.add(j.name);
            }

            var own = getInstallingPlugin(j.name);
            if (!own) {
              continue;
            }
            if (/.*Success.*/.test(j.installStatus)) {
              own.installStatus = "success";
            } else if (/.*Fail.*/.test(j.installStatus)) {
              own.installStatus = "fail";
              own.errorMessage = j.errorMessage || "";
            }
          }

          var current = null;
          installingPlugins.forEach(function (plugin) {
            if (/success|fail/.test(plugin.installStatus)) {
              return;
            }
            var busy = (plugin.allDependencies || [plugin.name]).some(
              function (name) {
                return active.has(name);
              },
            );
            if (busy && !current) {
              current = plugin;
              plugin.installStatus = "installing";
              return;
            }
            plugin.installStatus = "pending";
          });

          var done = installingPlugins.filter(function (plugin) {
            return /success|fail/.test(plugin.installStatus);
          }).length;

          var status = find(".app-setup-wizard__install-status");
          if (status && current) {
            status.textContent = translate(
              "installWizard_installing_status",
              "Installing {0} - {1} of {2}",
            )
              .replace("{0}", current.title)
              .replace("{1}", Math.min(done + 1, installingPlugins.length))
              .replace("{2}", installingPlugins.length);
          }

          if (complete < total && data.state === "INITIAL_PLUGINS_INSTALLING") {
            setTimeout(updateStatus, 250);
            return;
          }

          if (progressBar) {
            progressBar.style.width = "100%";
          }
          showStatePanel(data.state);
        }),
      );
    };

    setTimeout(updateStatus, 250);
  };

  var finishInstallation = function () {
    closeInstaller();
  };

  var loadPluginData = function (oncomplete) {
    pluginManager.availablePlugins(
      handleGenericError(function (availables) {
        var i, plug;
        for (i = 0; i < availables.length; i++) {
          plug = availables[i];
          availablePlugins[plug.name] = plug;
        }
        for (i = 0; i < availables.length; i++) {
          plug = availables[i];
          plug.allDependencies = getAllDependencies(plug.name);
        }
        oncomplete();
      }),
    );
  };

  var loadPluginCategories = function (oncomplete) {
    loadPluginData(function () {
      categories = [];
      for (var i = 0; i < pluginList.length; i++) {
        var a = pluginList[i];
        categories.push(a.category);
        var plugs = (categorizedPlugins[a.category] = []);
        for (var c = 0; c < a.plugins.length; c++) {
          var plugInfo = a.plugins[c];
          var plug = availablePlugins[plugInfo.name];
          if (!plug) {
            plug = {
              name: plugInfo.name,
              title: plugInfo.name,
            };
          }
          plugs.push({
            category: a.category,
            plugin: Object.assign({}, plug, {
              usage: plugInfo.usage,
              suggested: plugInfo.suggested,
              title: plugInfo.title ? plugInfo.title : plug.title,
              excerpt: plugInfo.excerpt ? plugInfo.excerpt : plug.excerpt,
              updated: new Date(plug.buildDate),
            }),
          });
        }
      }
      oncomplete();
    });
  };

  var stickyOffset = function (list) {
    var bar = list.querySelector(".jenkins-app-bar--sticky");
    if (!bar) {
      return 0;
    }
    return bar.offsetHeight + parseFloat(getComputedStyle(list).paddingTop) * 2;
  };

  var pinnedCategory = null;

  var setActiveCategory = function (id) {
    findAll(".app-setup-wizard__category .task-link").forEach(function (link) {
      link.classList.toggle(
        "task-link--active",
        link.getAttribute("href") === "#" + id,
      );
    });
  };

  var trackActiveCategory = function () {
    var list = find(".app-setup-wizard__picker-list");
    if (!list) {
      return;
    }
    var update = function () {
      if (pinnedCategory) {
        setActiveCategory(pinnedCategory);
        return;
      }
      var headings = Array.from(
        list.querySelectorAll(".app-setup-wizard__picker-category"),
      );
      if (headings.length === 0) {
        return;
      }
      var atBottom =
        list.scrollTop + list.clientHeight >= list.scrollHeight - 1;
      if (atBottom) {
        setActiveCategory(headings[headings.length - 1].id);
        return;
      }
      var active = headings[0].id;
      headings.forEach(function (heading) {
        if (heading.offsetTop - list.scrollTop <= stickyOffset(list) + 10) {
          active = heading.id;
        }
      });
      setActiveCategory(active);
    };
    list.addEventListener("scroll", update, { passive: true });
    list.addEventListener("scrollend", function () {
      pinnedCategory = null;
    });
    update();
  };

  var trackBottomBar = function () {
    var list = find(".app-setup-wizard__picker-list");
    var shadow = find(
      ".app-setup-wizard__picker-list .jenkins-bottom-app-bar__shadow",
    );
    if (!list || !shadow) {
      return;
    }
    new IntersectionObserver(
      function (entries) {
        shadow.classList.toggle(
          "jenkins-bottom-app-bar__shadow--stuck",
          entries[0].intersectionRatio < 1,
        );
      },
      { root: list, threshold: [1] },
    ).observe(shadow);
  };

  var loadCustomPluginPanel = function () {
    loadPluginCategories(function () {
      setPanel(pluginSelectionPanel, pluginSelectionPanelData(), function () {
        trackActiveCategory();
        trackBottomBar();
        document
          .querySelectorAll(".app-setup-wizard__picker [tooltip]")
          .forEach(function (element) {
            behaviorShim.applySubtree(element, true);
          });
      });
    });
  };

  var translate = function (key, fallback) {
    return key in translations ? translations[key] : fallback;
  };

  var selectedCountLabel = function () {
    return translate(
      "installWizard_installCustom_selectedCount",
      "{0} selected",
    ).replace("{0}", selectedPluginNames.length);
  };

  var installLabel = function () {
    if (selectedPluginNames.length === 0) {
      return translations.installWizard_continue;
    }
    return translate(
      "installWizard_installCustom_installPlugins",
      "Install plugins",
    );
  };

  var pluginSelectionPanelData = function () {
    return {
      categories: categories,
      categorizedPlugins: categorizedPlugins,
      selectedPlugins: selectedPluginNames,
      selectedCount: selectedCountLabel(),
      installLabel: installLabel(),
      additionalPluginsNote: translate(
        "installWizard_installCustom_additionalPlugins",
        "Additional plugins can be installed once initial setup is complete.",
      ),
      hasSelection: selectedPluginNames.length > 0,
    };
  };

  var removePlugin = function (arr, item) {
    for (var i = arr.length; i--;) {
      if (arr[i] === item) {
        arr.splice(i, 1);
      }
    }
  };

  var refreshPluginSelectionPanel = function () {
    findAll(".app-setup-wizard__picker-item input[type=checkbox]").forEach(
      function (checkbox) {
        var selected = selectedPluginNames.indexOf(checkbox.name) >= 0;
        checkbox.checked = selected;
        checkbox
          .closest(".app-setup-wizard__picker-item")
          .classList.toggle(
            "app-setup-wizard__picker-item--selected",
            selected,
          );
      },
    );
    var info = find("#plugin-selected-info");
    if (info) {
      info.textContent = selectedCountLabel();
    }
    var install = find(".app-setup-wizard__picker-list .install-selected");
    if (install) {
      install.textContent = installLabel();
    }
    var skip = find(".app-setup-wizard__picker-list .skip-plugin-installs");
    if (skip) {
      skip.classList.toggle("jenkins-hidden", selectedPluginNames.length === 0);
    }
    if (lastSearch !== "") {
      searchForPlugins(lastSearch, false);
    }
  };

  on(
    "change",
    ".app-setup-wizard__picker-list input[type=checkbox]",
    function () {
      if (this.checked) {
        selectedPluginNames.push(this.name);
      } else {
        removePlugin(selectedPluginNames, this.name);
      }
      refreshPluginSelectionPanel();
    },
  );

  var containsText = function (element, text) {
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.data.toLowerCase().indexOf(text) !== -1) {
        return true;
      }
    }
    return false;
  };

  var findIndex = 0;
  var lastSearch = "";

  var scrollPlugin = function (list, matches, term) {
    if (matches.length === 0) {
      return;
    }
    findIndex = lastSearch !== term ? 0 : (findIndex + 1) % matches.length;
    var plugin = matches[findIndex];
    list.scrollTo({
      top: plugin.offsetTop - stickyOffset(list),
      behavior: "smooth",
    });
  };

  var searchForPlugins = function (text, scroll) {
    var list = find(".app-setup-wizard__picker-list");
    if (!list) {
      return;
    }
    var plugins = Array.from(
      list.querySelectorAll(".app-setup-wizard__picker-item"),
    );
    var headings = list.querySelectorAll(".app-setup-wizard__picker-category");

    plugins.forEach(function (plugin) {
      plugin.classList.remove("app-setup-wizard__picker-item--match");
    });
    headings.forEach(function (heading) {
      heading.classList.remove("app-setup-wizard__picker-category--match");
    });

    if (text.length <= 1) {
      findIndex = 0;
      list.classList.remove("app-setup-wizard__picker-list--searching");
      lastSearch = text;
      return;
    }

    var needle = text.toLowerCase();
    var matches = plugins.filter(function (plugin) {
      return Array.from(
        plugin.querySelectorAll(
          ".app-setup-wizard__picker-name, .app-setup-wizard__picker-description",
        ),
      ).some(function (el) {
        return containsText(el, needle);
      });
    });
    if (lastSearch !== text && scroll) {
      scrollPlugin(list, matches, text);
    }
    matches.forEach(function (plugin) {
      plugin.classList.add("app-setup-wizard__picker-item--match");
      var heading = plugin.parentElement.previousElementSibling;
      if (heading) {
        heading.classList.add("app-setup-wizard__picker-category--match");
      }
    });
    list.classList.add("app-setup-wizard__picker-list--searching");
    lastSearch = text;
  };

  on("input", ".app-setup-wizard__search-input", function () {
    searchForPlugins(this.value, true);
  });

  on("keydown", ".app-setup-wizard__picker-list", function (e) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") {
      return;
    }
    var plugin = e.target.closest(".app-setup-wizard__picker-item");
    if (!plugin) {
      return;
    }
    var visiblePlugins = findAll(".app-setup-wizard__picker-item").filter(
      isVisible,
    );
    var next = visiblePlugins.indexOf(plugin) + (e.key === "ArrowUp" ? -1 : 1);
    if (next < 0 || next >= visiblePlugins.length) {
      return;
    }
    var checkbox = visiblePlugins[next].querySelector("input[type=checkbox]");
    if (checkbox) {
      e.preventDefault();
      checkbox.focus();
    }
  });

  var setSearch = function (value) {
    var searchbox = find("input[name=searchbox]");
    if (searchbox) {
      searchbox.value = value;
    }
    searchForPlugins(value, false);
  };

  var selectCategory = function () {
    setSearch("");
    var target = document.getElementById(
      this.getAttribute("href").substring(1),
    );
    var list = find(".app-setup-wizard__picker-list");
    if (!target || !list) {
      return;
    }
    pinnedCategory = target.id;
    setActiveCategory(target.id);
    list.scrollTo({
      top: target.offsetTop - stickyOffset(list),
      behavior: "smooth",
    });
  };

  var handleFirstUserResponseSuccess = function (data) {
    if (data.status === "ok") {
      showStatePanel();
      return;
    }
    setPanel(errorPanel, {
      errorMessage: "Error trying to create first user: " + data.statusText,
    });
  };

  var replaceIframeContent = function (iframeId, res) {
    var responseText = res.responseText;
    var page = new DOMParser().parseFromString(responseText, "text/html");
    var main = page.getElementById("main-panel");
    if (main) {
      responseText = responseText.replace(
        /body([^>]*)[>](.|[\r\n])+[<][/]body/,
        "body$1>" + main.innerHTML + "</body",
      );
    }
    var doc = iframeDocument(document.getElementById(iframeId));
    doc.open();
    doc.write(responseText);
    doc.close();
    setButtonsDisabled(false);
  };

  var handleFirstUserResponseError = function (res) {
    replaceIframeContent("setup-first-user", res);
  };

  var iframeForm = function (selector) {
    var doc = iframeDocument(find(selector));
    return doc ? doc.querySelector("form:not(.no-json)") : null;
  };

  var saveFirstUser = function () {
    setButtonsDisabled(true);
    securityConfig.saveFirstUser(
      iframeForm("iframe#setup-first-user"),
      handleFirstUserResponseSuccess,
      handleFirstUserResponseError,
    );
  };

  var firstUserSkipped = false;
  var skipFirstUser = function () {
    setButtonsDisabled(true);
    firstUserSkipped = true;
    jenkins.get(
      "/api/json?tree=url",
      function (data) {
        if (data.url) {
          showSetupCompletePanel({
            message: translations.installWizard_firstUserSkippedMessage,
          });
          return;
        }
        showConfigureInstance();
      },
      {
        error: function () {
          showConfigureInstance();
        },
      },
    );
  };

  var handleConfigureInstanceResponseSuccess = function (data) {
    if (data.status !== "ok") {
      setPanel(configureInstancePanel, {}, function () {
        enableButtonsImmediately();
        displayErrors(find("iframe#setup-configure-instance"), data.data);
      });
      return;
    }
    if (firstUserSkipped) {
      showSetupCompletePanel({
        message: translations.installWizard_firstUserSkippedMessage,
      });
      return;
    }
    showStatePanel();
  };

  var handleConfigureInstanceResponseError = function (res) {
    replaceIframeContent("setup-configure-instance", res);
  };

  var saveConfigureInstance = function () {
    setButtonsDisabled(true);
    securityConfig.saveConfigureInstance(
      iframeForm("iframe#setup-configure-instance"),
      handleConfigureInstanceResponseSuccess,
      handleConfigureInstanceResponseError,
    );
  };

  var skipConfigureInstance = function () {
    setButtonsDisabled(true);

    var message = "";
    if (firstUserSkipped) {
      message += translations.installWizard_firstUserSkippedMessage;
    }
    message += translations.installWizard_configureInstanceSkippedMessage;

    showSetupCompletePanel({ message: message });
  };

  var setupProxy = function () {
    setPanel(proxyConfigPanel, {}, enableButtonsAfterFrameLoad);
  };

  var saveProxyConfig = function () {
    securityConfig.saveProxy(iframeForm("iframe[src]"), function () {
      jenkins.goTo("/");
    });
  };

  var retryFailedPlugins = function () {
    var failedPlugins = failedPluginNames;
    failedPluginNames = [];
    installPlugins(failedPlugins);
  };

  var continueWithFailedPlugins = function () {
    pluginManager.installPluginsDone(function () {
      pluginManager.installStatus(
        handleGenericError(function (data) {
          failedPluginNames = [];
          showStatePanel(data.state);
        }),
      );
    });
  };

  var resumeInstallation = function () {
    initInstallingPluginList = function () {};
    selectedPluginNames = installingPlugins
      .filter(function (plug) {
        return plug.installStatus === "pending";
      })
      .map(function (plug) {
        return plug.name;
      });
    installPlugins(selectedPluginNames);
  };

  var restartJenkins = function () {
    pluginManager.restartJenkins(function () {
      setPanel(loadingPanel);

      var pingUntilRestarted = function () {
        pluginManager.getRestartStatus(function (restartStatus) {
          if (!this.isError && !restartStatus.restartRequired) {
            jenkins.goTo("/");
            return;
          }
          if (this.isError || restartStatus.restartSupported) {
            setTimeout(pingUntilRestarted, 1000);
            return;
          }
          throw new Error(translations.installWizard_error_restartNotSupported);
        });
      };

      pingUntilRestarted();
    });
  };

  var closeInstaller = function () {
    pluginManager.completeInstall(
      handleGenericError(function () {
        jenkins.goTo("/");
      }),
    );
  };

  var startOver = function () {
    jenkins.goTo("/");
  };

  var actions = {
    ".install-home": function () {
      showStatePanel();
    },
    ".install-selected": function () {
      installPlugins(selectedPluginNames);
    },
    ".install-done": finishInstallation,
    ".select-category": selectCategory,
    ".resume-installation": resumeInstallation,
    ".install-done-restart": restartJenkins,
    ".save-first-user:not([disabled])": saveFirstUser,
    ".skip-first-user": skipFirstUser,
    ".save-configure-instance:not([disabled])": saveConfigureInstance,
    ".skip-configure-instance": skipConfigureInstance,
    ".show-proxy-config": setupProxy,
    ".save-proxy-config": saveProxyConfig,
    ".skip-plugin-installs": function () {
      installPlugins([]);
    },
    ".retry-failed-plugins": retryFailedPlugins,
    ".continue-with-failed-plugins": continueWithFailedPlugins,
    ".start-over": startOver,
  };

  setPanel(loadingPanel);

  var extensionTranslationOverrides = [];
  if ("undefined" !== typeof setupWizardExtensions) {
    setupWizardExtensions.forEach(function (extension) {
      extension.call(self, {
        jenkins: jenkins,
        pluginManager: pluginManager,
        setPanel: setPanel,
        addActions: function (pluginActions) {
          Object.assign(actions, pluginActions);
        },
        addStateHandlers: function (pluginStateHandlers) {
          Object.assign(stateHandlers, pluginStateHandlers);
        },
        translationOverride: function (it) {
          extensionTranslationOverrides.push(it);
        },
        setSelectedPluginNames: function (pluginNames) {
          selectedPluginNames = pluginNames.slice(0);
        },
        showStatePanel: showStatePanel,
        installPlugins: installPlugins,
        pluginSelectionPanelData: pluginSelectionPanelData,
        loadPluginCategories: loadPluginCategories,
      });
    });
  }

  wizard.addEventListener("click", function (e) {
    for (var selector in actions) {
      var target = e.target.closest(selector);
      if (target && wizard.contains(target)) {
        e.preventDefault();
        actions[selector].call(target, e);
        return;
      }
    }
  });

  var showInitialSetupWizard = function () {
    /* globals defaultUpdateSiteId: true */
    jenkins.testConnectivity(
      defaultUpdateSiteId,
      handleGenericError(function (isConnected, isFatal, errorMessage) {
        if (!isConnected) {
          if (isFatal) {
            console.log(
              "Default update site connectivity check failed with fatal error: " +
                errorMessage,
            );
          }
          setPanel(offlinePanel);
          return;
        }

        pluginManager.init(
          handleGenericError(function () {
            pluginList = pluginManager.plugins();
            selectedPluginNames = pluginManager.recommendedPluginNames();

            pluginManager.installStatus(
              handleGenericError(function (data) {
                var jobs = data.jobs;

                if (jobs.length > 0) {
                  if (installingPlugins.length !== 0) {
                    showStatePanel(data.state);
                    return;
                  }
                  selectedPluginNames = [];
                  loadPluginData(
                    handleGenericError(function () {
                      for (var i = 0; i < jobs.length; i++) {
                        var j = jobs[i];
                        if (j.correlationId) {
                          selectedPluginNames.push(j.name);
                        }
                        setFailureStatus(j);
                      }
                      showStatePanel(data.state);
                    }),
                  );
                  return;
                }

                pluginManager.incompleteInstallStatus(
                  handleGenericError(function (incompleteStatus) {
                    var incompletePluginNames = Object.keys(incompleteStatus);

                    if (incompletePluginNames.length === 0) {
                      showStatePanel();
                      return;
                    }

                    selectedPluginNames = incompletePluginNames;
                    loadPluginData(
                      handleGenericError(function () {
                        initInstallingPluginList();

                        for (var plugName in incompleteStatus) {
                          var j = getInstallingPlugin(plugName);

                          if (!j) {
                            console.warn(
                              'Plugin "' +
                                plugName +
                                '" not found in the list of installing plugins.',
                            );
                            continue;
                          }

                          var status = incompleteStatus[plugName];

                          if (/.*Success.*/.test(status)) {
                            j.installStatus = "success";
                          } else if (/.*Install.*/.test(status)) {
                            j.installStatus = "pending";
                          } else if (/.*Fail.*/.test(status)) {
                            j.installStatus = "fail";
                          }
                        }
                        setPanel(incompleteInstallationPanel, {
                          installingPlugins: installingPlugins,
                        });
                      }),
                    );
                  }),
                );
              }),
            );
          }),
        );
      }),
    );
  };

  jenkins.loadTranslations(
    "jenkins.install.pluginSetupWizard",
    handleGenericError(function (localizations) {
      translations = localizations;
      var version = document.createElement("div");
      version.className = "app-setup-wizard__version";
      version.textContent =
        translations.installWizard_jenkinsVersionTitle +
        " " +
        getJenkinsVersionFull();
      wizard.append(version);
      extensionTranslationOverrides.forEach(function (override) {
        override(translations);
      });
      showInitialSetupWizard();
    }),
  );
};

export default { init: createPluginSetupWizard };
