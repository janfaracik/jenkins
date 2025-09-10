package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.ParametersAction;
import hudson.model.Run;

/**
 * Displays if a run has parameters
 */
public class ParameterizedDetail extends Detail {

    private final ParametersAction action;

    public ParameterizedDetail(Run<?, ?> run) {
        super(run);
        this.action = getObject().getAction(ParametersAction.class);
    }

    public @Nullable String getIconClassName() {
        return "symbol-parameters";
    }

    @Override
    public @Nullable String getDisplayName() {
        return action.getDisplayName();
    }

    public @Nullable String getLink() {
        return action.getUrlName();
    }
}
