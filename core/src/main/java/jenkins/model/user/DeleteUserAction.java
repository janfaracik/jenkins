package jenkins.model.user;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.User;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;
import jenkins.model.menu.Semantic;
import jenkins.model.menu.event.ConfirmationEvent;
import jenkins.model.menu.event.Event;

@Extension
public class DeleteUserAction extends TransientActionFactory<User> {

    @Override
    public Class<User> type() {
        return User.class;
    }

    @Override
    public Collection<? extends Action> createFor(User target) {
        if (!target.canDelete()) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Delete user";
            }

            @Override
            public String getIconFileName() {
                return "symbol-trash";
            }

            @Override
            public Group getGroup() {
                return Group.LAST_IN_MENU;
            }

            @Override
            public Event getEvent() {
                return ConfirmationEvent.of("are u sure", "???",  "doDelete");
            }

            @Override
            public Semantic getSemantic() {
                return Semantic.DESTRUCTIVE;
            }
        });
    }
}
