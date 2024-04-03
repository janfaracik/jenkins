package hudson.model.testtest;

import hudson.model.TopLevelItem;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;
import org.kohsuke.stapler.interceptor.RequirePOST;

public class GithubProjectThing extends BaseViewThing {

    @Override
    public String getDisplayName() {
        return "GitHub";
    }

    @Override
    public String getIcon() {
        return "symbol-github";
    }

    @Override
    @RequirePOST
    public TopLevelItem doCreateItem(StaplerRequest req, StaplerResponse rsp) {
        return null;
    }
}
