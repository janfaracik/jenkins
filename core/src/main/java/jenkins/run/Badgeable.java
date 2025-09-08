package jenkins.run;

import edu.umd.cs.findbugs.annotations.CheckForNull;
import jenkins.management.Badge;

public abstract class Badgeable {

    /**
     * A {@link Badge} shown on the action.
     *
     * @return badge or {@code null} if no badge should be shown.
     * @since TODO
     */
    public @CheckForNull Badge getBadge() {
        return null;
    }
}
