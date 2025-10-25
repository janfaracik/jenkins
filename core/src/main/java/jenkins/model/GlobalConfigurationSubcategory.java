package jenkins.model;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.ExtensionList;
import hudson.ExtensionPoint;
import hudson.model.ModelObject;
import org.jenkinsci.Symbol;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

public abstract class GlobalConfigurationSubcategory implements ExtensionPoint, ModelObject {
    /**
     * One-line plain text message that explains what this category is about.
     * This can be used in the UI to help the user pick the right category.
     *
     * The text should be longer than {@link #getDisplayName()}
     */
    public String getShortDescription() {
        return null;
    }

    /**
     * Returns all the registered {@link GlobalConfigurationSubcategory} descriptors.
     */
    public static ExtensionList<GlobalConfigurationSubcategory> all() {
        return ExtensionList.lookup(GlobalConfigurationSubcategory.class);
    }

    public static @NonNull <T extends GlobalConfigurationSubcategory> T get(Class<T> type) {
        T category = all().get(type);
        if (category == null) {
            throw new AssertionError("Subcategory not found. It seems the " + type + " is not annotated with @Extension and so not registered");
        }
        return category;
    }

    /**
     * This category represents the catch-all I-dont-know-what-category-it-is instance,
     * used for those {@link GlobalConfiguration}s that don't really deserve/need a separate
     * category.
     *
     * Also used for backward compatibility. All {@link GlobalConfiguration}s without
     * explicit category gets this as the category.
     *
     * In the current UI, this corresponds to the /configure link.
     */
    @Extension(ordinal = Integer.MAX_VALUE) @Symbol("general")
    public static class General extends GlobalConfigurationSubcategory {

        @Override
        public String getDisplayName() {
            return "General";
        }
    }

    /**
     * This category represents the catch-all I-dont-know-what-category-it-is instance,
     * used for those {@link GlobalConfiguration}s that don't really deserve/need a separate
     * category.
     *
     * Also used for backward compatibility. All {@link GlobalConfiguration}s without
     * explicit category gets this as the category.
     *
     * In the current UI, this corresponds to the /configure link.
     */
    @Extension(ordinal = -1) @Symbol("unclassified")
    public static class Unclassified extends GlobalConfigurationSubcategory {

        @Override
        public String getDisplayName() {
            return "Unclassified";
        }

        /**
         * Bogus property to remove the section title
         */
        @Restricted(NoExternalUse.class)
        public boolean getHideSectionTitle() {
            return true;
        }
    }
}
