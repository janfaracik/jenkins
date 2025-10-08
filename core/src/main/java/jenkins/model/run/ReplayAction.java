package jenkins.model.run;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.Run;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;
import jenkins.model.menu.Semantic;

@Extension
public class ReplayAction extends TransientActionFactory<Run> {

    @Override
    public Class<Run> type() {
        return Run.class;
    }

    @Override
    public Collection<? extends Action> createFor(Run target) {
        if (!target.hasPermission(Run.DELETE)) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Rebuild";
            }

            @Override
            public String getIconFileName() {
//<!--              Rerun-->
//                        <!--              | Replay-->
//                        <!--              | Restart from stage-->
//                        <!--              | Rebuild-->
                return "symbol-play";
            }

            @Override
            public Group getGroup() {
                return Group.FIRST_IN_APP_BAR;
            }

            @Override
            public Semantic getSemantic() {
                return Semantic.BUILD;
            }
        });
    }
}
