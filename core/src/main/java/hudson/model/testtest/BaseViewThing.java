package hudson.model.testtest;

import hudson.model.TopLevelItem;
import hudson.model.View;
import net.sf.json.JSONObject;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;

public abstract class BaseViewThing {

    /**
     * @return
     */
    public abstract String getDisplayName();

    /**
     * @return
     */
    public abstract String getIcon();

    /**
     * @param data
     * @param view
     * @param req
     * @param rsp
     * @return
     */
    public abstract TopLevelItem createItem(JSONObject data, View view, StaplerRequest req, StaplerResponse rsp);
}
