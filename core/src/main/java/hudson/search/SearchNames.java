package hudson.search;

import edu.umd.cs.findbugs.annotations.CheckForNull;
import edu.umd.cs.findbugs.annotations.NonNull;
import java.util.Locale;
import java.util.regex.Pattern;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

@Restricted(NoExternalUse.class)
public final class SearchNames {

    private static final Pattern SEPARATORS = Pattern.compile("[\\s_-]+");

    private SearchNames() {}

    @NonNull
    public static String normalize(@NonNull String value, boolean caseInsensitive) {
        String collapsed = SEPARATORS.matcher(value).replaceAll(" ").trim();
        return caseInsensitive ? collapsed.toLowerCase(Locale.ROOT) : collapsed;
    }

    public static boolean contains(@CheckForNull String value, @NonNull String normalizedToken, boolean caseInsensitive) {
        return value != null && normalize(value, caseInsensitive).contains(normalizedToken);
    }
}
