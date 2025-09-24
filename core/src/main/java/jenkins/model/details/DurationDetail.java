package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.Run;

/**
 * Displays the duration of the given run, or, if the run has completed, shows the total time it took to execute
 */
public class DurationDetail extends Detail {

    public DurationDetail(Run<?, ?> run) {
        super(run);
    }

    @Nullable
    @Override
    public String getIconClassName() {
        return "";
    }
}
