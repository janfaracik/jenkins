package hudson.widgets;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.model.Job;
import java.util.Collection;
import java.util.List;
import jenkins.widgets.WidgetFactory;
import org.jenkinsci.Symbol;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.DoNotUse;

public class JobDetailsWidget extends DetailsWidget<Job> {

    @Extension
    @Restricted(DoNotUse.class)
    @Symbol("jobDetails")
    public static final class FactoryImpl extends WidgetFactory<Job, JobDetailsWidget> {
        @Override
        public Class<Job> type() {
            return Job.class;
        }

        @Override
        public Class<JobDetailsWidget> widgetType() {
            return JobDetailsWidget.class;
        }

        @NonNull
        @Override
        public Collection<JobDetailsWidget> createFor(@NonNull Job target) {
            return List.of(new JobDetailsWidget());
        }
    }
}
