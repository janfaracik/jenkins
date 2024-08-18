package hudson.model.testtest;

import hudson.Extension;
import hudson.model.*;
import java.io.IOException;
import java.util.List;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

@Extension
public class ProjectTypesThing extends BaseViewThing {

    @Override
    public String getDisplayName() {
        return "Project types";
    }

    @Override
    public String getIcon() {
        return "symbol-types";
    }

    // https://github.com/jenkinsci/blueocean-plugin/pull/573

    // https://github.com/jenkinsci/blueocean-plugin/blob/7c2a37408e73381c6b87637b99575c267924fd28/blueocean-rest/src/main/java/io/jenkins/blueocean/rest/model/BluePipelineContainer.java#L29

    // https://github.com/jenkinsci/blueocean-plugin/blob/7c2a37408e73381c6b87637b99575c267924fd28/blueocean-pipeline-scm-api/src/main/java/io/jenkins/blueocean/scm/api/AbstractPipelineCreateRequest.java#L25

    private String validateName(String name, View view) {
        Jenkins.checkGoodName(name);
        name = name.trim();

        if (view.getItem(name) != null) {
            throw new Failure(Messages.Hudson_JobAlreadyExists(name));
        }

        return name;
    }

    private TopLevelItemDescriptor validateType(String type, View view) {
        TopLevelItemDescriptor descriptor = Items.all().findByName(type);
        if (descriptor == null) {
            throw new Failure("No item type ‘" + type + "’ is known");
        }
        descriptor.checkApplicableIn(view.getOwner().getItemGroup());
        Jenkins.getInstanceOrNull().getACL().checkCreatePermission(view.getOwner().getItemGroup(), descriptor);
        return descriptor;
    }

    @Override
    public TopLevelItem create(JSONObject data, View view) {
        TopLevelItemDescriptor type = validateType(data.getString("type"), view);

        // Create the project, knowing its name and type are both valid
        try {
            return Jenkins.getInstanceOrNull().createProject(type, data.getString("name"), true);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Restricted(NoExternalUse.class)
    public List<TopLevelItemDescriptor> getItemCategories() {
        var item = Jenkins.getInstanceOrNull().getPrimaryView();
        return DescriptorVisibilityFilter.apply(item.getOwner().getItemGroup(),
                Items.all2(Jenkins.getAuthentication2(), item.getOwner().getItemGroup()));
    }
}
