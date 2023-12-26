package jenkins.model.experimentalflags;

import hudson.Extension;

@Extension
public final class NewNavigationExperimentalFlag extends BooleanUserExperimentalFlag {

    public NewNavigationExperimentalFlag() {
        super("new-navigation.flag");
    }

    @Override
    public String getDisplayName() {
        return "New navigation";
    }

    @Override
    public String getShortDescription() {
        return "Enables a new, experimental navigation bar for Jenkins";
    }
}
