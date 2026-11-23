package jenkins.plugins;

import hudson.model.UpdateSite;
import java.util.HashSet;
import java.util.Set;
import jenkins.install.SetupWizard;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

/**
 * The plugins the setup wizard suggests installing, as returned by {@link SetupWizard#loadPlatformPluginList()}.
 * Reloaded whenever the update site data changes.
 */
@Restricted(NoExternalUse.class)
public final class SuggestedPlugins {

    private record Snapshot(long dataTimestamp, Set<String> names) {}

    private static volatile Snapshot snapshot;

    private SuggestedPlugins() {}

    public static Set<String> names() {
        long dataTimestamp = Jenkins.get().getUpdateCenter().getSiteList().stream()
                .mapToLong(UpdateSite::getDataTimestamp)
                .max()
                .orElse(-1);
        Snapshot current = snapshot;
        if (current != null && current.dataTimestamp() == dataTimestamp) {
            return current.names();
        }
        Set<String> names = load();
        snapshot = new Snapshot(dataTimestamp, names);
        return names;
    }

    private static Set<String> load() {
        JSONArray categories = SetupWizard.loadPlatformPluginList();
        if (categories == null) {
            return Set.of();
        }
        Set<String> names = new HashSet<>();
        for (Object category : categories) {
            for (Object plugin : ((JSONObject) category).getJSONArray("plugins")) {
                JSONObject p = (JSONObject) plugin;
                if (p.optBoolean("suggested", false)) {
                    names.add(p.getString("name"));
                }
            }
        }
        return names;
    }
}
