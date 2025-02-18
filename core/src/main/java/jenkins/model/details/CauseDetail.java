package jenkins.model.details;

import hudson.model.Cause;
import hudson.model.CauseAction;
import hudson.model.Run;
import java.util.Map;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

/**
 * TODO
 */
public class CauseDetail extends Detail {

    public CauseDetail(Run<?, ?> run) {
        super(run);
    }

    @Restricted(NoExternalUse.class)
    public Map<Cause, Integer> getCauseCounts() {
        CauseAction causeAction = getObject().getAction(CauseAction.class);
        return causeAction.getCauseCounts();
    }
}
