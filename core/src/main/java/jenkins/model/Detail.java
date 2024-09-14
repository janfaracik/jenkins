package jenkins.model;

import hudson.model.ModelObject;

public abstract class Detail implements ModelObject {

    /**
     */
    public abstract String getIconFileName();

    /**
     * {@inheritDoc}
     */
    @Override
    public abstract String getDisplayName();

    /**
     * @return the group, e.g. 'GIT' for git information, null for no grouping
     */
    public Group getGroup() {
        return Group.GENERIC;
    }

    /**
     * @return order in the group, zero is first, MAX_VALUE is any order
     */
    public int getOrder() {
        return Integer.MAX_VALUE;
    }
}
