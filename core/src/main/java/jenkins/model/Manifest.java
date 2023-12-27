package jenkins.model;

import org.kohsuke.stapler.export.Exported;
import org.kohsuke.stapler.export.ExportedBean;

@ExportedBean
public class Manifest {

    private final String name = "Jenkins";

    private final String shortName = "Jenkins";

    private final String themeColor = "#fff";

    private final String backgroundColor = "#fff";

    private final String display = "standalone";

    private final String scope = ".";

    private final String startUrl = Jenkins.get().getRootUrl();

    @Exported
    public String getName() {
        return name;
    }

    @Exported(name = "short_name")
    public String getShortName() {
        return shortName;
    }

    @Exported(name = "theme_color")
    public String getThemeColor() {
        return themeColor;
    }

    @Exported(name = "background_color")
    public String getBackgroundColor() {
        return backgroundColor;
    }

    @Exported
    public String getDisplay() {
        return display;
    }

    @Exported
    public String getScope() {
        return scope;
    }

    @Exported(name = "start_url")
    public String getStartUrl() {
        return startUrl;
    }
}
