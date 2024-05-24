package hudson.search;

import org.kohsuke.stapler.export.Exported;
import org.kohsuke.stapler.export.ExportedBean;

@ExportedBean(defaultVisibility = 999)
public class SearchGroup {

    private final String displayName;

    public SearchGroup(String displayName) {
        this.displayName = displayName;
    }

    @Exported
    public String getDisplayName() {
        return displayName;
    }

    public static final SearchGroup VIEW = new SearchGroup("Views");

    public static final SearchGroup BUILD = new SearchGroup("Builds");

    public static final SearchGroup COMPUTER = new SearchGroup("Nodes");

    public static final SearchGroup PROJECT = new SearchGroup("Projects");

    public static final SearchGroup PEOPLE = new SearchGroup("People");

    public static final SearchGroup OTHER = new SearchGroup("Other");
}
