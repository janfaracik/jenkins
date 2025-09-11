package jenkins.run;

import hudson.model.Action;
import hudson.model.Actionable;

public abstract class Tab extends Badgeable implements Action {

    protected Actionable object;

    public Tab(Actionable object) {
        this.object = object;
    }

    public Actionable getObject() {
        return object;
    }
}
