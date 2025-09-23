package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.Actionable;
import hudson.model.FreeStyleProject;

/**
 * Todo
 */
public class DownstreamProjectsDetail extends Detail {

    public DownstreamProjectsDetail(Actionable object) {
        super(object);
    }

    public @Nullable String getIconClassName() {
        if (getDownstreamProjects() == 0) {
            return null;
        }

        return "symbol-arrow-down-circle-outline plugin-ionicons-api";
    }

    @Override
    public @Nullable String getDisplayName() {
        if (getDownstreamProjects() == 1) {
            return "1 downstream project";
        }

        return getDownstreamProjects() + " downstream projects";
    }

    public @Nullable String getLink() {
        return "";
    }

    private int getDownstreamProjects() {
        return ((FreeStyleProject) getObject()).getDownstreamProjects().size();
    }
}
