package jenkins.model.menu.event;

import java.util.Map;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.Beta;
import org.kohsuke.stapler.export.ExportedBean;

@ExportedBean
@Restricted(Beta.class)
public final class DialogEvent {

    /**
     * Create a DialogEvent.
     * @param url the url of the dialog to load.
     * @return the event
     */
    public static JavaScriptEvent of(String url) {
        return JavaScriptEvent.of(Map.of("type", "dialog-opener", "dialog-url", url), "");
    }
}
