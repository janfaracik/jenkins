package hudson.model.testtest;

import hudson.Extension;
import hudson.Util;
import hudson.model.Failure;
import hudson.model.Item;
import hudson.model.TopLevelItem;
import java.io.IOException;
import java.util.Map;
import javax.servlet.ServletException;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
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
    public TopLevelItem doCreateItem(StaplerRequest req, StaplerResponse rsp) throws ServletException {
        JSONObject something = req.getSubmittedForm();
        String name = something.getString("name");
        String from = req.getParameter("from");

        if (name == null)
            throw new Failure("Query parameter 'name' is required");

        { // check if the name looks good
            Jenkins.checkGoodName(name);
            name = name.trim();
//            if (parent.getItem(name) != null)
//                throw new Failure(Messages.Hudson_JobAlreadyExists(name));
        }

        System.out.println("Somethings happening!");

        // TODO - this is missing 'parent'
        // resolve a name to Item
        Item src = Jenkins.get().getItem(from);
        if (src == null) {
            if (Util.fixEmpty(from) == null)
                throw new Failure("Specify which job to copy");
            else
                throw new Failure("No such job: " + from);
        }
        if (!(src instanceof TopLevelItem))
            throw new Failure(from + " cannot be copied");

        TopLevelItem result = null;
        try {
            result = Jenkins.getInstanceOrNull().copy((TopLevelItem) src, name);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        try {
            return Jenkins.getInstanceOrNull().doCreateItemNew(req, result, rsp);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Restricted(NoExternalUse.class)
    public Map<String, TopLevelItem> getItemMap() {
        return Jenkins.get().getItemMap();
    }
}
