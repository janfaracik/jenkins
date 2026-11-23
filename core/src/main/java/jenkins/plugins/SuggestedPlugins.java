package jenkins.plugins;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

/**
 * The plugins the setup wizard suggests installing, as listed in the bundled {@code jenkins/install/platform-plugins.json}.
 */
@Restricted(NoExternalUse.class)
public final class SuggestedPlugins {

    private static final Set<String> NAMES = load();

    private SuggestedPlugins() {}

    public static boolean contains(String pluginName) {
        return NAMES.contains(pluginName);
    }

    private static Set<String> load() {
        try (InputStream in = SuggestedPlugins.class.getResourceAsStream("/jenkins/install/platform-plugins.json")) {
            Set<String> names = new HashSet<>();
            for (Object category : JSONArray.fromObject(new String(in.readAllBytes(), StandardCharsets.UTF_8))) {
                for (Object plugin : ((JSONObject) category).getJSONArray("plugins")) {
                    JSONObject p = (JSONObject) plugin;
                    if (p.optBoolean("suggested")) {
                        names.add(p.getString("name"));
                    }
                }
            }
            return names;
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to load platform-plugins.json", e);
        }
    }
}
