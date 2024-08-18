package hudson.model.testtest;

import hudson.model.TopLevelItem;
import hudson.model.View;
import net.sf.json.JSONObject;

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
     * @return
     */
    public abstract TopLevelItem create(JSONObject data, View view);
}
