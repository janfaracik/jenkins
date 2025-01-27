package jenkins.model.run;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.Run;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;
import jenkins.model.menu.event.Event;
import jenkins.model.menu.event.LinkEvent;

@Extension
public class EditRunAction extends TransientActionFactory<Run> {

    @Override
    public Class<Run> type() {
        return Run.class;
    }

    @Override
    public Collection<? extends Action> createFor(Run target) {
        if (!target.hasPermission(Run.UPDATE)) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                // TODO - Clarify run vs build, what's the preferred terminology
                return target.hasPermission(Run.UPDATE) ? "Edit build information" : "View build information";
            }

            @Override
            public String getIconFileName() {
                return "symbol-edit";
            }

            @Override
            public Group getGroup() {
                return Group.IN_APP_BAR;
            }

            @Override
            public Event getEvent() {
                return LinkEvent.of("configure");
            }
        });
    }
}
