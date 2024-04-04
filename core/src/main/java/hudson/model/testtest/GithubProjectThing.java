package hudson.model.testtest;

import hudson.Extension;
import hudson.model.TopLevelItem;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;

@Extension
public class GithubProjectThing extends BaseViewThing {

    @Override
    public String getDisplayName() {
        return "Add a GitHub repository";
    }

    @Override
    public String getIcon() {
        return "symbol-github";
    }

    @Override
    public TopLevelItem doCreateItem(StaplerRequest req, StaplerResponse rsp) {
        return null;
    }
}
