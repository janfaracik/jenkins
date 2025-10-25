/*
 * The MIT License
 *
 * Copyright (c) 2025, Jan Faracik
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
     * One-line plain text message that explains what this subcategory is about.
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
     * Subcategory displayed first on its page, intended for the most important
     * configuration items. This should be used sparingly.
     */
    @Extension(ordinal = Integer.MAX_VALUE) @Symbol("general")
    public static class General extends GlobalConfigurationSubcategory {

        @Override
        public String getDisplayName() {
            return "General";
        }
    }

    /**
     * This subcategory is used for backward compatibility. All {@link GlobalConfiguration}s without
     * an explicit subcategory gets this.
     * <p>
     * This subcategory doesn't show a section title so that it doesn't disrupt global configurations
     * that feature their own sections in Jelly - these should be migrated to using a
     * custom {@link GlobalConfigurationSubcategory} to avoid suing this.
     */
    @Extension(ordinal = -1) @Symbol("unclassified") @Restricted(NoExternalUse.class)
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
