package jenkins.model.job;

import hudson.Extension;
import hudson.model.AbstractProject;
import hudson.model.Action;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;

@Extension
public class WorkspacesAction extends TransientActionFactory<AbstractProject> {

    @Override
    public Class<AbstractProject> type() {
        return AbstractProject.class;
    }

    @Override
    public Collection<? extends Action> createFor(AbstractProject target) {
        if (!target.hasPermission(AbstractProject.WORKSPACE)) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return Messages.WorkspacesAction_Title();
            }

            @Override
            public String getIconFileName() {
                return "symbol-folder";
            }

            @Override
            public String getUrlName() {
                return "ws";
            }
        });
    }
}
