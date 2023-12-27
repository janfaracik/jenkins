package jenkins.model.navigation;

import org.kohsuke.stapler.Stapler;
import org.kohsuke.stapler.StaplerRequest;

public class DashboardNavigationItem implements NavigationItem {

    @Override
    public String getDisplayName() {
        return "Dashboard";
    }

    @Override
    public String getIcon() {
        return "symbol-home";
    }

    @Override
    public String getUrl() {
        StaplerRequest currentRequest = Stapler.getCurrentRequest();
        currentRequest.getWebApp().getDispatchValidator().allowDispatch(currentRequest, Stapler.getCurrentResponse());

        return currentRequest.getContextPath();
    }
}
