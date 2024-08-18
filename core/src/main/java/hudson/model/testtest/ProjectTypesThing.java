package hudson.model.testtest;

import hudson.Extension;
import hudson.model.*;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;

import javax.servlet.ServletException;

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

    @Override
    public TopLevelItem doCreateItem(StaplerRequest req, StaplerResponse rsp) throws ServletException {
        JSONObject something = req.getSubmittedForm();
        String name = something.getString("name");
        String type = something.getString("type");

        TopLevelItemDescriptor descriptor = Items.all().findByName(type);
        if (descriptor == null) {
            throw new Failure("No item type ‘" + type + "’ is known");
        }

        ItemGroupMixIn itemGroupMixIn = Jenkins.get().doCreateItem(req, rsp);

//        descriptor.checkApplicableIn(parent);
//        acl.getACL().checkCreatePermission(parent, descriptor);

        // create empty job and redirect to the project config screen
//        result = createProject(descriptor, name, true);

        return null;
    }
}
