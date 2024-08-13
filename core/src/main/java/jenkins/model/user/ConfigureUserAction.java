package jenkins.model.user;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.User;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;
import jenkins.model.menu.event.Event;
import jenkins.model.menu.event.LinkEvent;

@Extension
public class ConfigureUserAction extends TransientActionFactory<User> {

    @Override
    public Class<User> type() {
        return User.class;
    }

    @Override
    public Collection<? extends Action> createFor(User target) {
        // TODO
//        if (!target.hasPermission(User.UPDATE)) {
//            return Set.of();
//        }

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
            public Event getEvent() {
                return LinkEvent.of("account");
            }
        });
    }
}
