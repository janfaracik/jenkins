const searchBar = document.querySelector("#filter-box");

searchBar.addEventListener("input", () => {
  const filter = searchBar.value.toLowerCase().trim();
  const filterParts = filter.split(/ +/).filter(function (word) {
    return word.length > 0;
  });
  const items = document.getElementsBySelector("TR.plugin").concat(document.getElementsBySelector("TR.unavailable"));

  for (const item of items) {
    if ((filterParts.length < 1 || filter.length < 2) && item.hasClassName("hidden-by-default")) {
      item.addClassName("jenkins-hidden");
      continue;
    }

    const pluginId = item.getAttribute('data-plugin-id');
    const content = (item.querySelector('.details').innerText + " " + pluginId).toLowerCase();
    const hideItem = !filterParts.every(part => content.includes(part));

    item.classList.toggle("jenkins-hidden", hideItem);
  }
});

/**
 * Code for handling the enable/disable behavior based on plugin
 * dependencies and dependents.
 */
(function () {
  function selectAll(selector, element) {
    if (element) {
      return $(element).select(selector);
    } else {
      return Element.select(undefined, selector);
    }
  }

  function select(selector, element) {
    const elementsBySelector = selectAll(selector, element);
    if (elementsBySelector.length > 0) {
      return elementsBySelector[0];
    } else {
      return undefined;
    }
  }

  /**
   * Wait for document onload.
   */
  Element.observe(window, "load", function () {
    const pluginsTable = select('#plugins');
    const pluginTRs = selectAll('.plugin', pluginsTable);

    if (!pluginTRs) {
      return;
    }

    const pluginI18n = select('.plugins.i18n');

    function i18n(messageId) {
      return pluginI18n.getAttribute('data-' + messageId);
    }

    // Create a map of the plugin rows, making it easy to index them.
    const plugins = {};
    for (let i = 0; i < pluginTRs.length; i++) {
      const pluginTR = pluginTRs[i];
      const pluginId = pluginTR.getAttribute('data-plugin-id');

      plugins[pluginId] = pluginTR;
    }

    function getPluginTR(pluginId) {
      return plugins[pluginId];
    }

    function getPluginName(pluginId) {
      const pluginTR = getPluginTR(pluginId);
      if (pluginTR) {
        return pluginTR.getAttribute('data-plugin-name');
      } else {
        return pluginId;
      }
    }

    function processSpanSet(spans) {
      const ids = [];
      for (let i = 0; i < spans.length; i++) {
        const span = spans[i];
        const pluginId = span.getAttribute('data-plugin-id');
        const pluginName = getPluginName(pluginId);

        span.update(pluginName);
        ids.push(pluginId);
      }
      return ids;
    }

    function markAllDependentsDisabled(pluginTR) {
      const jenkinsPluginMetadata = pluginTR.jenkinsPluginMetadata;
      const dependentIds = jenkinsPluginMetadata.dependentIds;

      if (dependentIds) {
        // If the only dependent is jenkins-core (it's a bundle plugin), then lets
        // treat it like all its dependents are disabled. We're really only interested in
        // dependent plugins in this case.
        // Note: This does not cover "implied" dependencies ala detached plugins. See https://goo.gl/lQHrUh
        if (dependentIds.length === 1 && dependentIds[0] === 'jenkins-core') {
          pluginTR.addClassName('all-dependents-disabled');
          return;
        }

        for (let i = 0; i < dependentIds.length; i++) {
          const dependentId = dependentIds[i];

          if (dependentId === 'jenkins-core') {
            // Jenkins core is always enabled. So, make sure it's not possible to disable/uninstall
            // any plugins that it "depends" on. (we sill have bundled plugins)
            pluginTR.removeClassName('all-dependents-disabled');
            return;
          }

          // The dependent is a plugin....
          const dependentPluginTr = getPluginTR(dependentId);
          if (dependentPluginTr && dependentPluginTr.jenkinsPluginMetadata.enableInput.checked) {
            // One of the plugins that depend on this plugin, is marked as enabled.
            pluginTR.removeClassName('all-dependents-disabled');
            return;
          }
        }
      }

      pluginTR.addClassName('all-dependents-disabled');
    }

    function markHasDisabledDependencies(pluginTR) {
      const jenkinsPluginMetadata = pluginTR.jenkinsPluginMetadata;
      const dependencyIds = jenkinsPluginMetadata.dependencyIds;

      if (dependencyIds) {
        for (let i = 0; i < dependencyIds.length; i++) {
          const dependencyPluginTr = getPluginTR(dependencyIds[i]);
          if (dependencyPluginTr && !dependencyPluginTr.jenkinsPluginMetadata.enableInput.checked) {
            // One of the plugins that this plugin depend on, is marked as disabled.
            pluginTR.addClassName('has-disabled-dependency');
            return;
          }
        }
      }

      pluginTR.removeClassName('has-disabled-dependency');
    }

    function setEnableWidgetStates() {
      for (let i = 0; i < pluginTRs.length; i++) {
        const pluginMetadata = pluginTRs[i].jenkinsPluginMetadata;
        if (pluginTRs[i].hasClassName('has-dependents-but-disabled')) {
          if (pluginMetadata.enableInput.checked) {
            pluginTRs[i].removeClassName('has-dependents-but-disabled');
          }
        }
        markAllDependentsDisabled(pluginTRs[i]);
        markHasDisabledDependencies(pluginTRs[i]);
      }
    }

    function addDependencyInfoRow(pluginTR, infoTR) {
      infoTR.addClassName('plugin-dependency-info');
      pluginTR.insert({
        after: infoTR
      });
    }

    function removeDependencyInfoRow(pluginTR) {
      const nextRows = pluginTR.nextSiblings();
      if (nextRows && nextRows.length > 0) {
        const nextRow = nextRows[0];
        if (nextRow.hasClassName('plugin-dependency-info')) {
          nextRow.remove();
        }
      }
    }

    function populateEnableDisableInfo(pluginTR, infoContainer) {
      const pluginMetadata = pluginTR.jenkinsPluginMetadata;

      // Remove all existing class info
      infoContainer.removeAttribute('class');
      infoContainer.addClassName('enable-state-info');

      if (pluginTR.hasClassName('has-disabled-dependency')) {
        const dependenciesDiv = pluginMetadata.dependenciesDiv;
        const dependencySpans = pluginMetadata.dependencies;

        infoContainer.update('<div class="title">' + i18n('cannot-enable') + '</div><div class="subtitle">' + i18n('disabled-dependencies') + '.</div>');

        // Go through each dependency <span> element. Show the spans where the dependency is
        // disabled. Hide the others.
        for (let i = 0; i < dependencySpans.length; i++) {
          const dependencySpan = dependencySpans[i];
          const pluginId = dependencySpan.getAttribute('data-plugin-id');
          const depPluginTR = getPluginTR(pluginId);
          let enabled = false;
          if (depPluginTR) {
            const depPluginMetadata = depPluginTR.jenkinsPluginMetadata;
            enabled = depPluginMetadata.enableInput.checked;
          }
          if (enabled) {
            // It's enabled ... hide the span
            dependencySpan.setStyle({display: 'none'});
          } else {
            // It's disabled ... show the span
            dependencySpan.setStyle({display: 'inline-block'});
          }
        }

        dependenciesDiv.setStyle({display: 'inherit'});
        infoContainer.appendChild(dependenciesDiv);

        return true;
      }
      if (pluginTR.hasClassName('has-dependents')) {
        if (!pluginTR.hasClassName('all-dependents-disabled')) {
          const dependentIds = pluginMetadata.dependentIds;

          // If the only dependent is jenkins-core (it's a bundle plugin), then lets
          // treat it like all its dependents are disabled. We're really only interested in
          // dependent plugins in this case.
          // Note: This does not cover "implied" dependencies ala detached plugins. See https://goo.gl/lQHrUh
          if (dependentIds.length === 1 && dependentIds[0] === 'jenkins-core') {
            pluginTR.addClassName('all-dependents-disabled');
            return false;
          }

          infoContainer.update('<div class="title">' + i18n('cannot-disable') + '</div><div class="subtitle">' + i18n('enabled-dependents') + '.</div>');
          infoContainer.appendChild(getDependentsDiv(pluginTR, true));
          return true;
        }
      }

      if (pluginTR.hasClassName('possibly-has-implied-dependents')) {
        infoContainer.update('<div class="title">' + i18n('detached-disable') + '</div><div class="subtitle">' + i18n('detached-possible-dependents') + '</div>');
        infoContainer.appendChild(getDependentsDiv(pluginTR, true));
        return true;
      }

      return false;
    }

    function populateUninstallInfo(pluginTR, infoContainer) {
      // Remove all existing class info
      infoContainer.removeAttribute('class');
      infoContainer.addClassName('uninstall-state-info');

      if (pluginTR.hasClassName('has-dependents')) {
        infoContainer.update('<div class="title">' + i18n('cannot-uninstall') + '</div><div class="subtitle">' + i18n('installed-dependents') + '.</div>');
        infoContainer.appendChild(getDependentsDiv(pluginTR, false));
        return true;
      }

      if (pluginTR.hasClassName('possibly-has-implied-dependents')) {
        infoContainer.update('<div class="title">' + i18n('detached-uninstall') + '</div><div class="subtitle">' + i18n('detached-possible-dependents') + '</div>');
        infoContainer.appendChild(getDependentsDiv(pluginTR, false));
        return true;
      }

      return false;
    }

    function getDependentsDiv(pluginTR, hideDisabled) {
      const pluginMetadata = pluginTR.jenkinsPluginMetadata;
      const dependentsDiv = pluginMetadata.dependentsDiv;
      const dependentSpans = pluginMetadata.dependents;

      // Go through each dependent <span> element. If disabled should be hidden, show the spans where
      // the dependent is enabled and hide the others. Otherwise show them all.
      for (let i = 0; i < dependentSpans.length; i++) {
        const dependentSpan = dependentSpans[i];
        const dependentId = dependentSpan.getAttribute('data-plugin-id');

        if (!hideDisabled || dependentId === 'jenkins-core') {
          dependentSpan.setStyle({display: 'inline-block'});
        } else {
          const depPluginTR = getPluginTR(dependentId);
          const depPluginMetadata = depPluginTR.jenkinsPluginMetadata;
          if (depPluginMetadata.enableInput.checked) {
            // It's enabled ... show the span
            dependentSpan.setStyle({display: 'inline-block'});
          } else {
            // It's disabled ... hide the span
            dependentSpan.setStyle({display: 'none'});
          }
        }
      }

      dependentsDiv.setStyle({display: 'inherit'});
      return dependentsDiv;
    }

    function initPluginRowHandling(pluginTR) {
      const enableInput = select('.enable input', pluginTR);
      const dependenciesDiv = select('.dependency-list', pluginTR);
      const dependentsDiv = select('.dependent-list', pluginTR);
      const enableTD = select('td.enable', pluginTR);
      const uninstallTD = select('td.uninstall', pluginTR);

      pluginTR.jenkinsPluginMetadata = {
        enableInput: enableInput,
        dependenciesDiv: dependenciesDiv,
        dependentsDiv: dependentsDiv
      };

      if (dependenciesDiv) {
        pluginTR.jenkinsPluginMetadata.dependencies = selectAll('span', dependenciesDiv);
        pluginTR.jenkinsPluginMetadata.dependencyIds = processSpanSet(pluginTR.jenkinsPluginMetadata.dependencies);
      }
      if (dependentsDiv) {
        pluginTR.jenkinsPluginMetadata.dependents = selectAll('span', dependentsDiv);
        pluginTR.jenkinsPluginMetadata.dependentIds = processSpanSet(pluginTR.jenkinsPluginMetadata.dependents);
      }

      // Setup event handlers...
      if (enableInput) {
        // Toggling of the enable/disable checkbox requires a check and possible
        // change of visibility on the same checkbox on other plugins.
        Element.observe(enableInput, 'click', function () {
          setEnableWidgetStates();
        });
      }

      //
      const infoTR = document.createElement("tr");
      const infoTD = document.createElement("td");
      const infoDiv = document.createElement("div");
      infoTR.appendChild(infoTD)
      infoTD.appendChild(infoDiv)
      infoTD.setAttribute('colspan', '6'); // This is the cell that all info will be added to.
      infoDiv.style.display = "inherit";

      // We don't want the info row to appear immediately. We wait for e.g. 1 second and if the mouse
      // is still in there (hasn't left the cell) then we show. The following code is for clearing the
      // show timeout where the mouse has left before the timeout has fired.
      let showInfoTimeout = undefined;

      function clearShowInfoTimeout() {
        if (showInfoTimeout) {
          clearTimeout(showInfoTimeout);
        }
        showInfoTimeout = undefined;
      }

      // Handle mouse in/out of the enable/disable cell (left most cell).
      if (enableTD) {
        Element.observe(enableTD, 'mouseenter', function () {
          showInfoTimeout = setTimeout(function () {
            showInfoTimeout = undefined;
            infoDiv.update('');
            if (populateEnableDisableInfo(pluginTR, infoDiv)) {
              addDependencyInfoRow(pluginTR, infoTR);
            }
          }, 1000);
        });
        Element.observe(enableTD, 'mouseleave', function () {
          clearShowInfoTimeout();
          removeDependencyInfoRow(pluginTR);
        });
      }

      // Handle mouse in/out of the uninstall cell (right most cell).
      if (uninstallTD) {
        Element.observe(uninstallTD, 'mouseenter', function () {
          showInfoTimeout = setTimeout(function () {
            showInfoTimeout = undefined;
            infoDiv.update('');
            if (populateUninstallInfo(pluginTR, infoDiv)) {
              addDependencyInfoRow(pluginTR, infoTR);
            }
          }, 1000);
        });
        Element.observe(uninstallTD, 'mouseleave', function () {
          clearShowInfoTimeout();
          removeDependencyInfoRow(pluginTR);
        });
      }
    }

    for (let i = 0; i < pluginTRs.length; i++) {
      initPluginRowHandling(pluginTRs[i]);
    }

    setEnableWidgetStates();
  });
}());
