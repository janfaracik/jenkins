package jenkins.model.menu.event;

import java.util.Map;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.Beta;
import org.kohsuke.stapler.export.ExportedBean;

/**
 * TODO
 */
@ExportedBean
@Restricted(Beta.class)
public final class DialogEvent implements Event {

    /**
     * TODO - finalise this API
     */
    public static JavaScriptEvent of(String url) {
        return JavaScriptEvent.of(Map.of("type", "dialog-opener", "dialog-url", url), "");
    }
}
