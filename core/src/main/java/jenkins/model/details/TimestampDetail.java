package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.Run;

/**
 * Displays the start time of the given run
 */
public class TimestampDetail extends Detail {

    public TimestampDetail(Run<?, ?> run) {
        super(run);
    }

    @Override
    public int getOrder() {
        return 1;
    }

    @Nullable
    @Override
    public String getIconClassName() {
        return "";
    }
}
