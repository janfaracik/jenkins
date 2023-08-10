package jenkins.model.navigation;

import hudson.model.AdministrativeMonitor;
import java.util.List;
import jenkins.management.Badge;
import jenkins.model.Jenkins;

public class SettingsNavigationItem implements NavigationItem {

    @Override
    public String getDisplayName() {
        return "Settings";
    }

    @Override
    public String getIcon() {
        return "symbol-settings";
    }

    @Override
    public String getUrl() {
        return "manage";
    }

    @Override
    public Badge getBadge() {
        Jenkins jenkins = Jenkins.get();
        List<AdministrativeMonitor> activeAdministrativeMonitors = jenkins.getActiveAdministrativeMonitors();

        return new Badge(String.valueOf(activeAdministrativeMonitors.size()),
                activeAdministrativeMonitors.size() + " notifications",
                Badge.Severity.DANGER);
    }
}
