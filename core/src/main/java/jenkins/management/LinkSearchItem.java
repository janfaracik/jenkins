package jenkins.management;

import hudson.model.ManagementLink;
import hudson.search.SearchItem;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

@Restricted(NoExternalUse.class)
public interface LinkSearchItem extends SearchItem {

    ManagementLink link();
}
