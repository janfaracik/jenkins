package jenkins.model.navigation;

import hudson.model.AdministrativeMonitor;
import hudson.model.PageDecorator;
import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import jenkins.management.AdministrativeMonitorsDecorator;
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
        AdministrativeMonitorsDecorator decorator = jenkins.getExtensionList(PageDecorator.class)
                .get(AdministrativeMonitorsDecorator.class);
        Collection<AdministrativeMonitor> activeAdministrativeMonitors = Optional.ofNullable(decorator.getMonitorsToDisplay()).orElse(Collections.emptyList());
        boolean anySecurity = activeAdministrativeMonitors.stream().anyMatch(AdministrativeMonitor::isSecurity);

        if (activeAdministrativeMonitors.isEmpty()) {
            return null;
        }

        String suffix = activeAdministrativeMonitors.size() > 1 ? "notifications" : "notification";

        return new Badge(String.valueOf(activeAdministrativeMonitors.size()),
                activeAdministrativeMonitors.size() + " " + suffix,
                anySecurity ? Badge.Severity.DANGER : Badge.Severity.WARNING);
    }
}
