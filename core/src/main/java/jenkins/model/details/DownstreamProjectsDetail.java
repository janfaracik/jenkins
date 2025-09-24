package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.AbstractProject;
import hudson.model.Actionable;
import hudson.model.FreeStyleProject;
import java.util.List;

/**
 * Displays downstream projects of a project (if any)
 */
public class DownstreamProjectsDetail extends Detail {

    public DownstreamProjectsDetail(Actionable object) {
        super(object);
    }

    public @Nullable String getIconClassName() {
        if (getProjects().isEmpty()) {
            return null;
        }

        return "symbol-arrow-down-circle-outline plugin-ionicons-api";
    }

    @Override
    public @Nullable String getDisplayName() {
        int projectSize = getProjects().size();

        if (projectSize == 1) {
            return "1 downstream project";
        }

        return projectSize + " downstream projects";
    }

    public List<AbstractProject> getProjects() {
        return ((FreeStyleProject) getObject()).getDownstreamProjects();
    }
}
