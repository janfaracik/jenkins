package hudson.widgets;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.model.Run;
import java.util.Collection;
import java.util.List;
import jenkins.widgets.WidgetFactory;
import org.jenkinsci.Symbol;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.DoNotUse;

public class RunDetailsWidget extends DetailsWidget<Run> {

    @Extension
    @Restricted(DoNotUse.class)
    @Symbol("runDetails")
    public static final class FactoryImpl extends WidgetFactory<Run, RunDetailsWidget> {
        @Override
        public Class<Run> type() {
            return Run.class;
        }

        @Override
        public Class<RunDetailsWidget> widgetType() {
            return RunDetailsWidget.class;
        }

        @NonNull
        @Override
        public Collection<RunDetailsWidget> createFor(@NonNull Run target) {
            return List.of(new RunDetailsWidget());
        }
    }
}
