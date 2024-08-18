package hudson.model.testtest;

import hudson.Extension;
import hudson.model.Failure;
import hudson.model.Item;
import hudson.model.TopLevelItem;
import hudson.model.View;
import java.io.IOException;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

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

    @Override
    public TopLevelItem create(JSONObject data, View view) {
        Item from = validateFrom(data.getString("from"));

        try {
            return Jenkins.getInstanceOrNull().copy((TopLevelItem) from, data.getString("name"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Item validateFrom(String existingProject) {
        if (StringUtils.isBlank(existingProject)) {
            throw new Failure("Specify which job to copy");
        }

        Item src = Jenkins.get().getItem(existingProject);

        if (src == null) {
            throw new Failure("No such job: " + existingProject);
        }

        return src;
    }

    @Restricted(NoExternalUse.class)
    public Map<String, TopLevelItem> getItemMap() {
        return Jenkins.get().getItemMap();
    }
}
