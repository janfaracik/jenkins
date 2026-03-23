package jenkins.model.job;

import hudson.Extension;
import hudson.model.Action;
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
public class BuildJobAction extends TransientActionFactory<ParameterizedJobMixIn.ParameterizedJob> {

    @Override
    public Class<ParameterizedJobMixIn.ParameterizedJob> type() {
        return ParameterizedJobMixIn.ParameterizedJob.class;
    }

    @Override
    public Collection<? extends Action> createFor(ParameterizedJobMixIn.ParameterizedJob target) {
        if (!target.isBuildable()) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return target.getBuildNowText();
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
                return "build";
            }

            @Override
            public Event getEvent() {
                if (isParameterized()) {
                    return JavaScriptEvent.of(Map.of("type", "dialog-opener", "dialog-url", "parametersDialog"));
                }

                return JavaScriptEvent.of(Map.of("type", "build-now", "href", "build", "buildSuccess", "Build scheduled", "buildFailure", "Failed to schedule build. Reload the page and try again."), "jsbundles/pages/project/build.js");
            }

            @Override
            public Semantic getSemantic() {
                return Semantic.BUILD;
            }

            private boolean isParameterized() {
                return target.isParameterized();
            }
        });
    }
}
