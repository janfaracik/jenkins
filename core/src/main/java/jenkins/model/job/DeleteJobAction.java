package jenkins.model.job;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.Job;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;
import jenkins.model.menu.Semantic;
import jenkins.model.menu.event.ConfirmationEvent;
import jenkins.model.menu.event.Event;
import jenkins.model.run.Messages;

@Extension
public class DeleteJobAction extends TransientActionFactory<Job> {

    @Override
    public Class<Job> type() {
        return Job.class;
    }

    @Override
    public Collection<? extends Action> createFor(Job target) {
        if (!target.hasPermission(Job.DELETE)) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return Messages.DeleteRunFactory_Delete();
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
                return ConfirmationEvent.of(Messages.DeleteRunFactory_DeleteDialog_Title(), Messages.DeleteRunFactory_DeleteDialog_Description(),  "doDelete");
            }

            @Override
            public Semantic getSemantic() {
                return Semantic.DESTRUCTIVE;
            }
        });
    }
}
