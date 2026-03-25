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
import hudson.model.userproperty.UserPropertyCategory;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import jenkins.model.Jenkins;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

/**
 * Stores a user's recently viewed jobs.
 */
@Restricted(NoExternalUse.class)
public class RecentJobsUserProperty extends UserProperty {

    private static final Logger LOGGER = Logger.getLogger(RecentJobsUserProperty.class.getName());
    private static final int MAX_RECENT_JOBS = 10;

    private List<String> recentJobFullNames = new ArrayList<>();

    public synchronized @NonNull List<String> getRecentJobFullNames() {
        return Collections.unmodifiableList(new ArrayList<>(recentJobFullNames));
    }

    public synchronized void record(@NonNull Job<?, ?> job) throws IOException {
        recentJobFullNames.remove(job.getFullName());
        recentJobFullNames.addFirst(job.getFullName());
        if (recentJobFullNames.size() > MAX_RECENT_JOBS) {
            recentJobFullNames = new ArrayList<>(recentJobFullNames.subList(0, MAX_RECENT_JOBS));
        }
        if (user != null) {
            user.save();
        }
    }

    public synchronized @NonNull List<Job<?, ?>> getRecentJobs() {
        List<Job<?, ?>> jobs = new ArrayList<>(recentJobFullNames.size());
        for (String fullName : recentJobFullNames) {
            Job<?, ?> job = Jenkins.get().getItemByFullName(fullName, Job.class);
            if (job != null && job.hasPermission(Item.READ)) {
                jobs.add(job);
            }
        }
        return Collections.unmodifiableList(jobs);
    }

    public static void recordCurrentUser(@NonNull Job<?, ?> job) {
        User user = User.current();
        if (user == null) {
            return;
        }

        RecentJobsUserProperty property = user.getProperty(RecentJobsUserProperty.class);
        if (property == null) {
            property = new RecentJobsUserProperty();
            try {
                user.addProperty(property);
            } catch (IOException e) {
                LOGGER.log(Level.WARNING, "Failed to initialize recent jobs for " + user.getId(), e);
                return;
            }
        }

        try {
            property.record(job);
        } catch (IOException e) {
            LOGGER.log(Level.WARNING, "Failed to record recent job " + job.getFullName() + " for " + user.getId(), e);
        }
    }

    @Extension
    public static final class DescriptorImpl extends UserPropertyDescriptor {
        @NonNull
        @Override
        public String getDisplayName() {
            return Messages.RecentJobsUserProperty_DisplayName();
        }

        @Override
        public UserProperty newInstance(User user) {
            return new RecentJobsUserProperty();
        }

        @Override
        public @NonNull UserPropertyCategory getUserPropertyCategory() {
            return UserPropertyCategory.get(UserPropertyCategory.Invisible.class);
        }
    }
}
