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

public class DetailsWidget extends Widget {

    public List<DetailFactory> getDetailFactories() {
        return DetailFactory.all();
    }

    @Extension
    @Restricted(DoNotUse.class)
    @Symbol("details")
    public static final class FactoryImpl extends WidgetFactory<Run, DetailsWidget> {
        @Override
        public Class<Run> type() {
            return Run.class;
        }

        @Override
        public Class<DetailsWidget> widgetType() {
            return DetailsWidget.class;
        }

        @NonNull
        @Override
        public Collection<DetailsWidget> createFor(@NonNull Run target) {
            return List.of(new DetailsWidget());
        }
    }
}
