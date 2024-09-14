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
}
