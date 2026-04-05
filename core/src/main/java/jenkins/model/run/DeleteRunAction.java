package jenkins.model.run;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.Run;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.experimentalflags.NewBuildPageUserExperimentalFlag;
import jenkins.model.menu.action.DeleteAction;

@Extension
public class DeleteRunAction extends TransientActionFactory<Run> {

    @Override
    public Class<Run> type() {
        return Run.class;
    }

    @Override
    public Collection<? extends Action> createFor(Run target) {
        Boolean newBuildPageEnabled = new NewBuildPageUserExperimentalFlag().getFlagValue();

        // This condition can be removed when the flag has been removed
        if (!newBuildPageEnabled) {
            return Set.of();
        }

        if (!target.hasPermission(Run.DELETE) || target.isKeepLog()) {
            return Set.of();
        }

        return Set.of(new DeleteAction("Build", target.getDisplayName()));
    }
}
