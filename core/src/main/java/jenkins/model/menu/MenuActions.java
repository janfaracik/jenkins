package jenkins.model.menu;

import hudson.Functions;
import hudson.model.Action;
import org.jenkins.ui.icon.IconSpec;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

@Restricted(NoExternalUse.class)
public final class MenuActions {

    private MenuActions() {}

    public static boolean hasIcon(Action action) {
        return action.getIconFileName() != null
                || (action instanceof IconSpec iconSpec && iconSpec.getIconClassName() != null);
    }

    public static boolean isShownInMenu(Action action) {
        return hasIcon(action) && action.isVisibleInContextMenu() && Functions.isContextMenuVisible(action);
    }
}
