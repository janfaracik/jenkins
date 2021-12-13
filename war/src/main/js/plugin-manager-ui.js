import debounce from 'lodash/debounce'
import requestAnimationFrame from 'raf';

import pluginManagerAvailable from './templates/plugin-manager/available.hbs'
import pluginManager from './api/pluginManager';

var filterInput = document.getElementById('filter-box');
var installPluginsButton = document.getElementById('button-install-plugins');
var refreshServerButton = document.getElementById('button-refresh-server');

function applyFilter(searchQuery) {
    // debounce reduces number of server side calls while typing
    pluginManager.availablePluginsSearch(searchQuery.toLowerCase().trim(), 50, function (plugins) {
        var pluginsTable = document.getElementById('plugins');
        var tbody = pluginsTable.querySelector('tbody');
        var admin = pluginsTable.dataset.hasadmin === 'true';
        var selectedPlugins = [];

        filterInput.parentElement.classList.remove("jenkins-search--loading");

        function clearOldResults() {
            if (!admin) {
                tbody.innerHTML = '';
            } else {
                var rows = tbody.querySelectorAll('tr');
                if (rows) {
                    selectedPlugins = []
                    rows.forEach(function (row) {
                        var input = row.querySelector('input');
                        if (input.checked === true) {
                            var pluginName = input.name.split('.')[1];
                            selectedPlugins.push(pluginName)
                        } else {
                            row.remove();
                        }
                    })
                }
            }
        }

        clearOldResults()
        var rows = pluginManagerAvailable({
            plugins: plugins.filter(plugin => selectedPlugins.indexOf(plugin.name) === -1),
            admin
        });

        tbody.insertAdjacentHTML('beforeend', rows);

        addQuerySelectors();

        // @see JENKINS-64504 - Update the sticky buttons position after each search.
        requestAnimationFrame(() => {
            layoutUpdateCallback.call()
        })
    })
}

var handleFilter = function (e) {
    applyFilter(e.target.value)
};

var debouncedFilter = debounce(handleFilter, 150);

document.addEventListener("DOMContentLoaded", function () {
    filterInput.addEventListener('input', function (e) {
        debouncedFilter(e);
        filterInput.parentElement.classList.add("jenkins-search--loading");
    });

    applyFilter(filterInput.value);

    setTimeout(function () {
        layoutUpdateCallback.call();
    }, 350)
});

installPluginsButton.addEventListener("click", function () {
  const plugins = document.querySelectorAll('input[type=checkbox]:checked');
  pluginManager.installPlugins([...plugins].map(x => x.name), function() {
    console.log([...plugins].map(x => x.name))
    console.log("Doing something")
  });
});

refreshServerButton.addEventListener("click", function () {
  refreshServerButton.classList.add("jenkins-button--loading");
  refreshServerButton.disabled = true;
  pluginManager.refreshServer(function() {
    // No need to unset the class as we're reloading the page
    location.reload();
  });
});

// TODO
function addQuerySelectors() {
  document.querySelectorAll('button[id^=button-install-plugin-plugin-]').forEach(button => {
    button.addEventListener('click', () => {
      const pluginInstallId = button.dataset.pluginInstallId;
      console.log({plugins: [pluginInstallId], dynamicLoad: true})
      pluginManager.installPlugins([pluginInstallId], function(e) {
        console.log(e)
      });
    });
  });
}
