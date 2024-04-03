package hudson.model.testtest;

import hudson.model.TopLevelItem;
import java.util.Map;
import jenkins.model.Jenkins;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;
import org.kohsuke.stapler.interceptor.RequirePOST;

public class DuplicateProjectThing extends BaseViewThing {

    @Override
    public String getDisplayName() {
        return "Duplicate an existing project";
    }

    @Override
    public String getIcon() {
        return "symbol-duplicate";
    }

    public Map<String, TopLevelItem> getItemMap() {
        return Jenkins.get().getItemMap();
    }

    @Override
    @RequirePOST
    public TopLevelItem doCreateItem(StaplerRequest req, StaplerResponse rsp) {
        return null;
    }
}
