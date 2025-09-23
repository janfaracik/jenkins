package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.Actionable;
import hudson.model.FreeStyleProject;

/**
 * Todo
 */
public class UpstreamProjectsDetail extends Detail {

    public UpstreamProjectsDetail(Actionable object) {
        super(object);
    }

    public @Nullable String getIconClassName() {
        if (getUpstreamProjects() == 0) {
            return null;
        }

        return "symbol-arrow-up-circle-outline plugin-ionicons-api";
    }

    @Override
    public @Nullable String getDisplayName() {
        if (getUpstreamProjects() == 1) {
            return "1 upstream project";
        }

        return getUpstreamProjects() + " upstream projects";
    }

    public @Nullable String getLink() {
        return "";
    }

    private int getUpstreamProjects() {
        return ((FreeStyleProject) getObject()).getUpstreamProjects().size();
    }
}
