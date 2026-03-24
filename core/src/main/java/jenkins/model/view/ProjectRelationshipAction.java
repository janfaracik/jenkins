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
public class ProjectRelationshipAction extends TransientActionFactory<View> {

    @Override
    public Class<View> type() {
        return View.class;
    }

    @Override
    public Collection<? extends Action> createFor(View target) {
        if (!(target.hasPermission(Jenkins.READ) && Jenkins.get().getFingerprintMap().isReady())) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Project Relationship";
            }

            @Override
            public String getIconFileName() {
                return "symbol-project-relationship";
            }

            @Override
            public Group getGroup() {
                return Group.of(Integer.MAX_VALUE - 2);
            }

            @Override
            public String getUrlName() {
                return "/projectRelationship";
            }
        });
    }
}
