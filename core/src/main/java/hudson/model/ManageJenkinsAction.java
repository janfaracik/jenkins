/*
 * The MIT License
 *
 * Copyright (c) 2011, CloudBees, Inc.
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

package hudson.model;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.ExtensionList;
import hudson.search.FixedSet;
import hudson.search.Search;
import hudson.search.SearchIndex;
import hudson.search.SearchItem;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import jenkins.management.Badge;
import jenkins.management.ConfigureLink;
import jenkins.management.LinkSearchItem;
import jenkins.model.Badgeable;
import jenkins.model.Jenkins;
import jenkins.model.experimentalflags.NewManageJenkinsUserExperimentalFlag;
import jenkins.search.SearchGroup;
import jenkins.search.SearchScope;
import org.jenkinsci.Symbol;
import org.kohsuke.stapler.HttpRedirect;
import org.kohsuke.stapler.StaplerFallback;
import org.kohsuke.stapler.StaplerRequest2;
import org.kohsuke.stapler.StaplerResponse2;

/**
 * Adds the "Manage Jenkins" link to the navigation bar.
 *
 * @author Kohsuke Kawaguchi
 */
@Extension(ordinal = 998) @Symbol("manageJenkins")
public class ManageJenkinsAction implements RootAction, StaplerFallback, SearchScope {

    @Override
    public String getIconFileName() {
        if (Jenkins.get().hasAnyPermission(Jenkins.MANAGE, Jenkins.SYSTEM_READ))
            return "symbol-settings";
        else
            return null;
    }

    @Override
    public String getDisplayName() {
        return Messages.ManageJenkinsAction_DisplayName();
    }

    @Override
    public String getUrlName() {
        return "/manage";
    }

    @Override
    public boolean isPrimaryAction() {
        return true;
    }

    @Override
    public String getSearchName() {
        return getDisplayName();
    }

    @Override
    public String getSearchUrl() {
        return getUrlName();
    }

    @Override
    public String getSearchIcon() {
        return "symbol-settings";
    }

    @Override
    public Search getSearch() {
        return new Search();
    }

    @Override
    public SearchIndex getSearchIndex() {
        return SearchIndex.EMPTY;
    }

    @NonNull
    @Override
    public SearchIndex getScopedSearchIndex() {
        List<SearchItem> items = new ArrayList<>();
        Jenkins.get().getCategorizedManagementLinks().forEach((category, links) -> {
            SearchGroup group = category::getLabel;
            for (ManagementLink link : links) {
                if (link.getRequiresPOST() || link.getRequiresConfirmation() || link.getUrlName() == null) {
                    continue;
                }
                items.add(new ManagementLinkSearchItem(link, group));
            }
        });
        return new FixedSet(items);
    }

    private record ManagementLinkSearchItem(ManagementLink link, SearchGroup group) implements LinkSearchItem, Badgeable {
        @Override
        public Badge getBadge() {
            return link.getBadge();
        }

        @Override
        public String getSearchName() {
            return link.getDisplayName();
        }

        @Override
        public String getSearchUrl() {
            return link.getUrlName();
        }

        @Override
        public String getSearchIcon() {
            return link.getIconFileName();
        }

        @Override
        public String getSearchDescription() {
            return link.getSearchDescription();
        }

        @Override
        public SearchGroup getSearchGroup() {
            return group;
        }

        @Override
        public SearchIndex getSearchIndex() {
            return SearchIndex.EMPTY;
        }
    }

    public HttpRedirect doIndex(StaplerRequest2 req, StaplerResponse2 rsp) throws IOException {
        try {
            var newUiEnabled = new NewManageJenkinsUserExperimentalFlag().getFlagValue();

            if (newUiEnabled) {
                return new HttpRedirect("configure");
            }

            req.getView(this, "index.jelly").forward(req, rsp);
        } catch (ServletException e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    @Override
    public Object getStaplerFallback() {
        return Jenkins.get();
    }

    @Override
    public Badge getBadge() {
        return ExtensionList.lookupSingleton(ConfigureLink.class).getBadge();
    }

}
