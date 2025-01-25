package jenkins.plugins;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.io.IOUtils;

public class SuggestedPlugins {
    private static Set<String> suggestedPlugins;

    /**
     * Loads and parses the platform-plugins.json file and initializes the list of suggested plugins.
     */
    private static void loadSuggestedPlugins() {
        if (suggestedPlugins == null) {
            suggestedPlugins = new HashSet<>();
            ClassLoader cl = SuggestedPlugins.class.getClassLoader();

            // TODO - This needs to be updated to support different update sites
            URL localPluginData = cl.getResource("jenkins/install/platform-plugins.json");
            try (var inputStream = localPluginData.openStream()) {
                String initialPluginJson = IOUtils.toString(inputStream, StandardCharsets.UTF_8);
                JSONArray categories = JSONArray.fromObject(initialPluginJson);

                // Iterate through categories and extract suggested plugins
                for (Object categoryObj : categories) {
                    JSONObject category = (JSONObject) categoryObj;
                    JSONArray plugins = category.getJSONArray("plugins");

                    for (Object pluginObj : plugins) {
                        JSONObject plugin = (JSONObject) pluginObj;
                        if (plugin.optBoolean("suggested", false)) {
                            suggestedPlugins.add(plugin.getString("name"));
                        }
                    }
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to load platform-plugins.json", e);
            }
        }
    }

    /**
     * Checks if the given plugin name is in the suggested list.
     */
    public static boolean isSuggested(String pluginName) {
        loadSuggestedPlugins();
        return suggestedPlugins.contains(pluginName);
    }
}
