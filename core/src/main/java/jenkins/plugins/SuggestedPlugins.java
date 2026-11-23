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
 * The plugins the setup wizard suggests installing, as listed in {@code jenkins/install/platform-plugins.json}.
 */
@Restricted(NoExternalUse.class)
public final class SuggestedPlugins {

    private SuggestedPlugins() {}

    public static boolean isSuggested(String pluginName) {
        return Holder.NAMES.contains(pluginName);
    }

    private static final class Holder {
        static final Set<String> NAMES = load();

        private static Set<String> load() {
            Set<String> names = new HashSet<>();
            try (InputStream in = SuggestedPlugins.class.getResourceAsStream("/jenkins/install/platform-plugins.json")) {
                if (in == null) {
                    return names;
                }
                JSONArray categories = JSONArray.fromObject(new String(in.readAllBytes(), StandardCharsets.UTF_8));
                for (Object category : categories) {
                    for (Object plugin : ((JSONObject) category).getJSONArray("plugins")) {
                        JSONObject p = (JSONObject) plugin;
                        if (p.optBoolean("suggested", false)) {
                            names.add(p.getString("name"));
                        }
                    }
                }
            } catch (IOException e) {
                throw new UncheckedIOException("Failed to load platform-plugins.json", e);
            }
            return Set.copyOf(names);
        }
    }
}
