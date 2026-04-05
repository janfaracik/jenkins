package jenkins.model.log;

import hudson.Extension;
import hudson.logging.LogRecorder;
import hudson.model.Action;
import java.util.Collection;
import java.util.Set;
import jenkins.model.Jenkins;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.action.DeleteAction;

@Extension
public class DeleteLogRecorderAction extends TransientActionFactory<LogRecorder> {

    @Override
    public Class<LogRecorder> type() {
        return LogRecorder.class;
    }

    @Override
    public Collection<? extends Action> createFor(LogRecorder target) {
        if (!Jenkins.get().hasPermission(Jenkins.ADMINISTER)) {
            return Set.of();
        }

        return Set.of(new DeleteAction("log recorder", target.getDisplayName()));
    }
}
