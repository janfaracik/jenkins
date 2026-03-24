package jenkins.model.view;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.View;
import java.util.Collection;
import java.util.Set;
import jenkins.model.Jenkins;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;

@Extension
public class BuildHistoryAction extends TransientActionFactory<View> {

    @Override
    public Class<View> type() {
        return View.class;
    }

    @Override
    public Collection<? extends Action> createFor(View target) {
        if (!target.hasPermission(Jenkins.READ)) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Build History";
            }

            @Override
            public String getIconFileName() {
                return "symbol-build-history";
            }

            @Override
            public Group getGroup() {
                return Group.of(Integer.MAX_VALUE - 2);
            }

            @Override
            public String getUrlName() {
                return "buildHistory";
            }
        });
    }
}
