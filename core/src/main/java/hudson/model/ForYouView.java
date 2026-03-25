/*
 * The MIT License
 *
 * Copyright (c) 2026, contributors
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
import hudson.Util;
import hudson.model.Descriptor.FormException;
import hudson.security.ACL;
import io.jenkins.servlet.ServletExceptionWrapper;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import org.jenkinsci.Symbol;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerRequest2;
import org.kohsuke.stapler.StaplerResponse2;
import org.kohsuke.stapler.interceptor.RequirePOST;

/**
 * Placeholder view reserved for personalized content.
 */
public class ForYouView extends View {

    public static final String DEFAULT_VIEW_NAME = "for-you";

    @DataBoundConstructor
    public ForYouView(String name) {
        super(name);
    }

    public ForYouView(String name, ViewGroup owner) {
        this(name);
        this.owner = owner;
    }

    @Override
    public boolean contains(TopLevelItem item) {
        return false;
    }

    @Override
    public Collection<TopLevelItem> getItems() {
        return Collections.emptyList();
    }

    @Override
    public String getDisplayName() {
        return DEFAULT_VIEW_NAME.equals(name) ? Messages.ForYouView_DisplayName() : name;
    }

    @Override
    public String getIconFileName() {
        return "symbol-overview";
    }

    @Override
    public ACL getACL() {
        ACL base = super.getACL();
        return ACL.lambda2((authentication, permission) -> {
            if (permission == View.READ && ACL.isAnonymous2(authentication)) {
                return false;
            }
            return base.hasPermission2(authentication, permission);
        });
    }

    public List<Job<?, ?>> getRecentJobs() {
        User user = User.current();
        if (user == null) {
            return Collections.emptyList();
        }
        RecentJobsUserProperty property = user.getProperty(RecentJobsUserProperty.class);
        return property != null ? property.getRecentJobs() : Collections.emptyList();
    }

    public User getUser() {
        return User.current();
    }

    public record Breadcrumb(String name, String url) {}

    public List<Breadcrumb> getParentRecursively(Run<?, ?> run) {
        List<Breadcrumb> parents = new ArrayList<>();

        Item current = run.getParent();
        while (current != null) {
            parents.add(new Breadcrumb(
                    current.getDisplayName(),
                    current.getUrl()
            ));

            ItemGroup<?> parent = current.getParent();
            if (parent instanceof Item parentItem) {
                current = parentItem;
            } else {
                current = null;
            }
        }

        Collections.reverse(parents);
        return parents;
    }

    public List<Run<?, ?>> getBuildsThatNeedAttention() {
        long oneDayAgo = System.currentTimeMillis() - 24L * 60 * 60 * 1000;

        return getRecentJobs().stream()
                .flatMap(job -> getBuildsThatNeedAttention(job, oneDayAgo))
                .sorted(
                        Comparator
                                .comparingInt((Run<?, ?> run) -> {
                                    if (run.isBuilding()) return 0;
                                    return 2;
                                })
                                .thenComparing(Run::getTimeInMillis, Comparator.reverseOrder())
                )
                .toList();
    }

    private static <JobT extends Job<JobT, RunT>, RunT extends Run<JobT, RunT>> Stream<Run<?, ?>> getBuildsThatNeedAttention(
            Job<JobT, RunT> job, long oneDayAgo) {
        List<RunT> builds = job.getBuilds().stream()
                .filter(run -> run.getTimeInMillis() >= oneDayAgo)
                .sorted()
                .toList();

        Stream<Run<?, ?>> runningBuild = builds.stream()
                .filter(Run::isBuilding)
                .limit(1)
                .map(ForYouView::asRun);

        Stream<Run<?, ?>> regularBuild = builds.stream()
                .filter(run -> !run.isBuilding())
                .limit(1)
                .map(ForYouView::asRun);

        return Stream.concat(runningBuild, regularBuild);
    }

    private static Run<?, ?> asRun(Run<?, ?> run) {
        return run;
    }

    @RequirePOST
    @Override
    public Item doCreateItem(StaplerRequest2 req, StaplerResponse2 rsp)
            throws IOException, ServletException {
        ItemGroup<? extends TopLevelItem> itemGroup = getOwner().getItemGroup();
        if (itemGroup instanceof ModifiableItemGroup) {
            return ((ModifiableItemGroup<? extends TopLevelItem>) itemGroup).doCreateItem(req, rsp);
        }
        return null;
    }

    @Override
    public String getPostConstructLandingPage() {
        return "";
    }

    @Override
    protected void submit(StaplerRequest2 req) throws IOException, ServletException, FormException {
        if (Util.isOverridden(ForYouView.class, getClass(), "submit", StaplerRequest.class)) {
            try {
                submit(StaplerRequest.fromStaplerRequest2(req));
            } catch (javax.servlet.ServletException e) {
                throw ServletExceptionWrapper.toJakartaServletException(e);
            }
        } else {
            // noop
        }
    }

    /**
     * @deprecated use {@link #submit(StaplerRequest2)}
     */
    @Deprecated
    @Override
    protected void submit(StaplerRequest req) throws IOException, javax.servlet.ServletException, FormException {
        // noop
    }

    @Extension(ordinal = Integer.MAX_VALUE)
    @Symbol("forYou")
    public static final class DescriptorImpl extends ViewDescriptor {
        @Override
        public boolean isApplicableIn(ViewGroup owner) {
            for (View view : owner.getViews()) {
                if (view instanceof ForYouView) {
                    return false;
                }
            }
            return true;
        }

        @NonNull
        @Override
        public String getDisplayName() {
            return Messages.ForYouView_DisplayName();
        }
    }
}
