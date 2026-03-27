package jenkins.model.job;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.Job;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.experimentalflags.NewJobPageUserExperimentalFlag;
import jenkins.model.menu.Group;
import jenkins.model.menu.Semantic;
import jenkins.model.menu.event.ConfirmationEvent;
import jenkins.model.menu.event.Event;

@Extension
public class DeleteJobAction extends TransientActionFactory<Job> {

    @Override
    public Class<Job> type() {
        return Job.class;
    }

    @Override
    public Collection<? extends Action> createFor(Job target) {
        Boolean newJobPageEnabled = new NewJobPageUserExperimentalFlag().getFlagValue();

        // This condition can be removed when the flag has been removed
        if (!newJobPageEnabled) {
            return Set.of();
        }

        if (!target.hasPermission(Job.DELETE)) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return Messages.DeleteJobAction_Delete();
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
                return ConfirmationEvent.of(Messages.DeleteJobAction_DeleteDialog_Title(), "doDelete");
            }

            @Override
            public Semantic getSemantic() {
                return Semantic.DESTRUCTIVE;
            }
        });
    }
}
