package jenkins.model.view;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.View;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;
import jenkins.model.menu.Semantic;
import jenkins.model.menu.event.ConfirmationEvent;
import jenkins.model.menu.event.Event;
import jenkins.model.run.Messages;

@Extension
public class DeleteViewAction extends TransientActionFactory<View> {

    @Override
    public Class<View> type() {
        return View.class;
    }

    @Override
    public Collection<? extends Action> createFor(View target) {
        if (!(target.getOwner().canDelete(target) && target.hasPermission(View.DELETE))) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Delete view";
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
            public String getUrlName() {
                return null;
            }

            @Override
            public Event getEvent() {
                return ConfirmationEvent.of(Messages.DeleteRunFactory_DeleteDialog_Title(), null,"doDelete");
            }

            @Override
            public Semantic getSemantic() {
                return Semantic.DESTRUCTIVE;
            }
        });
    }
}
