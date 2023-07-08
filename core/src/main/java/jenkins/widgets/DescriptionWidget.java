package jenkins.widgets;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.model.View;
import hudson.widgets.Widget;
import java.util.Collection;
import java.util.List;
import org.jenkinsci.Symbol;

public class DescriptionWidget extends Widget {

    @Extension(ordinal = 201)
    @Symbol("description")
    public static final class ViewFactoryImpl extends WidgetFactory<View, DescriptionWidget> {
        @Override
        public Class<View> type() {
            return View.class;
        }

        @Override
        public Class<DescriptionWidget> widgetType() {
            return DescriptionWidget.class;
        }

        @NonNull
        @Override
        public Collection<DescriptionWidget> createFor(@NonNull View target) {
            return List.of(new DescriptionWidget());
        }
    }
}
