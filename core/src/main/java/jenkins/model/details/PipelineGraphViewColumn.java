package jenkins.model.details;

import hudson.model.Run;

/**
 * Displays the duration of the given run, or, if the run has completed, shows the total time it took to execute
 */
public class PipelineGraphViewColumn extends BuildColumn {

    public PipelineGraphViewColumn(Run<?, ?> run) {
        super(run);
    }

    @Override
    public String getDisplayName() {
        return "PGV";
    }
}
