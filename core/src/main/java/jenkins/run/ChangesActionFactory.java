package jenkins.run;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.model.Run;
import java.util.Collection;
import java.util.Collections;
import jenkins.model.TransientActionFactory;
import jenkins.scm.RunWithSCM;

@Extension(ordinal = Integer.MAX_VALUE - 2)
public class ChangesActionFactory extends TransientActionFactory<Run> {

    @Override
    public Class<Run> type() {
        return Run.class;
    }

    @NonNull
    @Override
    public Collection<? extends RunTab> createFor(@NonNull Run target) {
        if (!(target instanceof RunWithSCM)) {
            return Collections.emptySet();
        }

        var noChangeSet = ((RunWithSCM)target).getChangeSets().isEmpty();

        if (noChangeSet) {
            return Collections.emptySet();
        }

        return Collections.singleton(new ChangesAction(target));
    }
}
