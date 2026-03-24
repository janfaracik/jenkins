package jenkins.model.view;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.View;
import java.util.Collection;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.Group;

@Extension
public class LegendAction extends TransientActionFactory<View> {

    @Override
    public Class<View> type() {
        return View.class;
    }

    @Override
    public Collection<? extends Action> createFor(View target) {
        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Icon Legend";
            }

            @Override
            public String getIconFileName() {
                return "symbol-information-circle";
            }

            @Override
            public Group getGroup() {
                return Group.of(Integer.MAX_VALUE - 1);
            }

            @Override
            public String getUrlName() {
                return "newJob";
            }
        });
    }
}
