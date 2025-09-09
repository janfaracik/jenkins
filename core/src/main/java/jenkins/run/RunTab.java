package jenkins.run;

import hudson.model.Action;
import hudson.model.Actionable;

public abstract class RunTab extends Badgeable implements Action {

    protected Actionable object;

    public RunTab(Actionable object) {
        this.object = object;
    }

    public Actionable getObject() {
        return object;
    }
}
