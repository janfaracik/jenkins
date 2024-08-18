package hudson.model.testtest;

import hudson.Extension;
import hudson.model.TopLevelItem;
import java.util.Map;
import jenkins.model.Jenkins;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;

@Extension
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
    public TopLevelItem doCreateItem(StaplerRequest req, StaplerResponse rsp) {
        return null;
    }
}
