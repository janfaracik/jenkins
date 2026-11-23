package jenkins.plugins;

import hudson.model.UpdateSite;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import jenkins.install.SetupWizard;
import jenkins.model.Jenkins;
import jenkins.util.Timer;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

/**
 * The plugins the setup wizard suggests installing, as returned by {@link SetupWizard#loadPlatformPluginList()}.
 * Starts from the bundled list and refreshes in the background whenever the update site data changes.
 */
@Restricted(NoExternalUse.class)
public final class SuggestedPlugins {

    private record Snapshot(long dataTimestamp, Set<String> names) {}

    private static volatile Snapshot snapshot = new Snapshot(Long.MIN_VALUE, parse(SetupWizard.loadBundledPlatformPluginList()));

    private static final AtomicBoolean refreshing = new AtomicBoolean();

    private SuggestedPlugins() {}

    public static Set<String> names() {
        long dataTimestamp = Jenkins.get().getUpdateCenter().getSiteList().stream()
                .mapToLong(UpdateSite::getDataTimestamp)
                .max()
                .orElse(-1);
        Snapshot current = snapshot;
        if (current.dataTimestamp() != dataTimestamp && refreshing.compareAndSet(false, true)) {
            Timer.get().submit(() -> refresh(dataTimestamp));
        }
        return current.names();
    }

    private static void refresh(long dataTimestamp) {
        try {
            JSONArray categories = SetupWizard.loadPlatformPluginList();
            Set<String> names = categories == null ? snapshot.names() : parse(categories);
            snapshot = new Snapshot(dataTimestamp, names);
        } finally {
            refreshing.set(false);
        }
    }

    private static Set<String> parse(JSONArray categories) {
        if (categories == null) {
            return Set.of();
        }
        Set<String> names = new HashSet<>();
        for (Object category : categories) {
            if (!(category instanceof JSONObject c)) {
                continue;
            }
            JSONArray plugins = c.optJSONArray("plugins");
            if (plugins == null) {
                continue;
            }
            for (Object plugin : plugins) {
                if (plugin instanceof JSONObject p && p.optBoolean("suggested", false) && p.optString("name", null) != null) {
                    names.add(p.getString("name"));
                }
            }
        }
        return Set.copyOf(names);
    }
}
