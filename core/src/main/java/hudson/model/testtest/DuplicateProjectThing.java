package hudson.model.testtest;

import hudson.Extension;
import hudson.model.Failure;
import hudson.model.Item;
import hudson.model.Messages;
import hudson.model.TopLevelItem;
import hudson.model.View;
import java.io.IOException;
import java.util.Map;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;
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

    @Override
    public TopLevelItem createItem(JSONObject data, View view, StaplerRequest req, StaplerResponse rsp) {
        String name = validateName(data.getString("name"), view);
        Item from = validateFrom(data.getString("from"));

        TopLevelItem result;
        try {
            result = Jenkins.getInstanceOrNull().copy((TopLevelItem) from, name);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        try {
            rsp.sendRedirect2(req.getContextPath() + '/' + result.getUrl() + "configure");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return result;
    }

    private String validateName(String name, View view) {
        Jenkins.checkGoodName(name);
        name = name.trim();

        if (view.getItem(name) != null) {
            throw new Failure(Messages.Hudson_JobAlreadyExists(name));
        }

        return name;
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
