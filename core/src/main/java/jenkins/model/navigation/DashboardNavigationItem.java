package jenkins.model.navigation;

import org.kohsuke.stapler.Stapler;
import org.kohsuke.stapler.StaplerRequest2;

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
        StaplerRequest2 currentRequest = Stapler.getCurrentRequest2();
        currentRequest.getWebApp().getDispatchValidator().allowDispatch(currentRequest, Stapler.getCurrentResponse2());

        return currentRequest.getContextPath();
    }
}
