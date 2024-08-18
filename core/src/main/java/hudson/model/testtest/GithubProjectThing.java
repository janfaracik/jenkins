package hudson.model.testtest;

import hudson.Extension;
import hudson.model.TopLevelItem;
import hudson.model.View;
import net.sf.json.JSONObject;

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
    public TopLevelItem create(JSONObject data, View view) {
        return null;
    }
}
