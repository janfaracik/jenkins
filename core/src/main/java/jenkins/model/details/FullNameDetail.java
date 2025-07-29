package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.Job;

/**
 * TODO
 */
public class FullNameDetail extends Detail {

    public FullNameDetail(Job<?, ?> job) {
        super(job);
    }

    private String getFullName() {
        return ((Job<?, ?>)getObject()).getFullName();
    }

    /**
     * {@inheritDoc}
     */
    public @Nullable String getIconClassName() {
        if (getFullName().equals(getObject().getDisplayName())) {
            return null;
        }

        return "symbol-information-circle";
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public @Nullable String getDisplayName() {
        return getFullName();
    }
}
