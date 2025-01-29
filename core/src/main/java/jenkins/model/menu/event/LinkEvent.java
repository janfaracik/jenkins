package jenkins.model.menu.event;

import org.kohsuke.stapler.export.Exported;
import org.kohsuke.stapler.export.ExportedBean;

@ExportedBean
public final class LinkEvent implements Event {

    private final String url;

    // TODO enumify
    private final String type;

    private LinkEvent(String url, String type) {
        this.url = url;
        this.type = type;
    }

    public static LinkEvent of(String url) {
        return new LinkEvent(url, "get");
    }

    public static LinkEvent of(String url, String type) {
        return new LinkEvent(url, type);
    }

    @Exported
    public String getUrl() {
        return url;
    }

    @Exported
    public String getType() {
        return type;
    }
}
