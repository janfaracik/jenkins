package jenkins.model.log;

import hudson.Extension;
import hudson.logging.LogRecorder;
import hudson.model.Action;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;

@Extension
public class ConfigureAction extends TransientActionFactory<LogRecorder> {

    @Override
    public Class<LogRecorder> type() {
        return LogRecorder.class;
    }

    @Override
    public Collection<? extends Action> createFor(LogRecorder target) {
        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Configure";
            }

            @Override
            public String getIconFileName() {
                return "symbol-settings";
            }

            @Override
            public Group getGroup() {
                return Group.IN_APP_BAR;
            }

            @Override
            public String getUrlName() {
                return "configure";
            }
        });
    }
}
