package jenkins.model.job;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.Job;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import jenkins.model.ParameterizedJobMixIn;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;
import jenkins.model.menu.Semantic;
import jenkins.model.menu.event.Event;
import jenkins.model.menu.event.JavaScriptEvent;

@Extension
public class BuildJobAction extends TransientActionFactory<Job> {

    @Override
    public Class<Job> type() {
        return Job.class;
    }

    @Override
    public Collection<? extends Action> createFor(Job target) {
        if (!target.hasPermission(Job.BUILD)) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                if (isParameterized()) {
                    return "Build with Parameters";
                }

                return "Build";
            }

            @Override
            public String getIconFileName() {
                return "symbol-play";
            }

            @Override
            public Group getGroup() {
                return Group.FIRST_IN_APP_BAR;
            }

            @Override
            public String getUrlName() {
                return "configure";
            }

            @Override
            public Event getEvent() {
                if (isParameterized()) {
                    return JavaScriptEvent.of(Map.of("data-type", "dialog-opener"), "");
                }

                return JavaScriptEvent.of(Map.of("data-type", "build-now"), "");
            }

            @Override
            public Semantic getSemantic() {
                return Semantic.BUILD;
            }

            private boolean isParameterized() {
                if (target instanceof ParameterizedJobMixIn.ParameterizedJob<?,?> paramJob) {
                    return paramJob.isParameterized();
                }

                return false;
            }
        });
    }
}
