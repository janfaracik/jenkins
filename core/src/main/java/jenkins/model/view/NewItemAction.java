package jenkins.model.view;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.View;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.experimentalflags.NewDashboardPageUserExperimentalFlag;
import jenkins.model.menu.Group;

@Extension
public class NewItemAction extends TransientActionFactory<View> {

    @Override
    public Class<View> type() {
        return View.class;
    }

    @Override
    public Collection<? extends Action> createFor(View target) {
        Boolean newDashboardPageEnabled = new NewDashboardPageUserExperimentalFlag().getFlagValue();

        // This condition can be removed when the flag has been removed
        if (!newDashboardPageEnabled) {
            return Set.of();
        }

        if (!target.hasPermission(View.CREATE)) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "New Item";
            }

            @Override
            public String getIconFileName() {
                return "symbol-add";
            }

            @Override
            public Group getGroup() {
                return Group.FIRST_IN_APP_BAR;
            }

            @Override
            public String getUrlName() {
                if (target.isDefault()) {
                    return "/newJob";
                }

                return "newJob";
            }
        });
    }
}
