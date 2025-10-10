package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.AbstractProject;
import hudson.model.Actionable;
import java.util.Objects;
import jenkins.model.Jenkins;

/**
 * Displays the full name of a project (if necessary)
 */
public class ProjectNameDetail extends Detail {

    public ProjectNameDetail(Actionable object) {
        super(object);
    }

    public @Nullable String getIconClassName() {
        return "symbol-arrow-up-circle-outline plugin-ionicons-api";
    }

    @Override
    public @Nullable String getDisplayName() {
        var it = (AbstractProject<?, ?>) getObject();

        System.out.println("====");
        System.out.println("====");
        System.out.println("====");
        System.out.println(it.getFullName());
        System.out.println(it.getFullDisplayName());
        System.out.println(it.getClass().getName());
        System.out.println("MatrixConfiguration");

        if (Objects.equals(it.getFullName(), it.getFullDisplayName()) || it.getClass().getName().equals("MatrixConfiguration")) {
            return null;
        }

        System.out.println(it.getParent().getClass());
        System.out.println("====");
        System.out.println("====");
        System.out.println("====");

        boolean nested = it.getParent().getClass() != Jenkins.class;
        String label = nested ? "Full project name" : "Project name";

        return label + ": " + it.getFullName();
    }
}
