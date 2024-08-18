package hudson.model.testtest;

import hudson.Extension;
import hudson.model.*;
import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;

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

    @Override
    public TopLevelItem doCreateItem(StaplerRequest req, StaplerResponse rsp) throws ServletException {
        JSONObject something = req.getSubmittedForm();
        String name = something.getString("name");
        String type = something.getString("type");
        var view = Jenkins.getInstanceOrNull().getPrimaryView();

        TopLevelItemDescriptor descriptor = Items.all().findByName(type);
        if (descriptor == null) {
            throw new Failure("No item type ‘" + type + "’ is known");
        }
        descriptor.checkApplicableIn(view.getOwner().getItemGroup());
        Jenkins.getInstanceOrNull().getACL().checkCreatePermission(view.getOwner().getItemGroup(), descriptor);

        // create empty job and redirect to the project config screen
        TopLevelItem result = null;
        try {
            result = Jenkins.getInstanceOrNull().createProject(descriptor, name, true);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        System.out.println("✨ Creating a project '" + type + "' in view '" + view + "'");

        try {
            return Jenkins.getInstanceOrNull().doCreateItemNew(req, result, rsp);
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
