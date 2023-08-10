package jenkins.model.navigation;

import jenkins.management.Badge;
import jenkins.model.Jenkins;

public class PluginsNavigationItem implements NavigationItem {

    @Override
    public String getDisplayName() {
        return "Plugins";
    }

    @Override
    public String getIcon() {
        return "symbol-plugins";
    }

    @Override
    public String getUrl() {
        return "manage/pluginManager";
    }

    @Override
    public Badge getBadge() {
        Jenkins jenkins = Jenkins.get();

        return jenkins.getUpdateCenter().getBadge();
    }
}
