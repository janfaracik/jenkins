package jenkins.run;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.model.Run;
import java.util.Collection;
import java.util.Collections;
import jenkins.model.TransientActionFactory;
import jenkins.model.experimentalflags.NewBuildPageUserExperimentalFlag;

@Extension(ordinal = Integer.MAX_VALUE)
public class OverviewActionFactory extends TransientActionFactory<Run> {

    @Override
    public Class<Run> type() {
        return Run.class;
    }

    @NonNull
    @Override
    public Collection<? extends RunTab> createFor(@NonNull Run target) {
        boolean isExperimentalUiEnabled = new NewBuildPageUserExperimentalFlag().getFlagValue();

        if (!isExperimentalUiEnabled) {
            return Collections.emptySet();
        }

        return Collections.singleton(new OverviewAction(target));
    }
}
