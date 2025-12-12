package jenkins.model.details;

import hudson.model.Actionable;
import hudson.model.ModelObject;
import hudson.model.Run;

/**
 * {@link BuildColumn} represents a piece of information about a {@link Run}.
 * Such information could include:
 * <ul>
 *  <li>the date and time the run started</li>
 *  <li>the amount of time the run took to complete</li>
 *  <li>SCM information for the build</li>
 *  <li>who kicked the build off</li>
 * </ul>
 * @since 2.498
 */
public abstract class BuildColumn implements ModelObject {

    private final Actionable object;

    public BuildColumn(Actionable object) {
        this.object = object;
    }

    public Actionable getObject() {
        return object;
    }
}
