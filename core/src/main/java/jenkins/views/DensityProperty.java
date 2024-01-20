package jenkins.views;

import edu.umd.cs.findbugs.annotations.NonNull;
import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.Extension;
import hudson.model.*;
import hudson.util.ListBoxModel;
import java.util.List;
import net.sf.json.JSONObject;
import org.jenkinsci.Symbol;
import org.kohsuke.stapler.AncestorInPath;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.StaplerRequest;

public class DensityProperty extends UserProperty {
    private DensityType density = DensityType.DEFAULT;

    @DataBoundConstructor
    public DensityProperty() {}

    public DensityProperty(DensityType density) {
        this.density = density;
    }

    public DensityType getDensity() {
        return density;
    }

    public static DensityType getDensityValueForUser(User user) {
        if (user == null) {
            return DensityType.DEFAULT;
        }

        DensityType density = user.getProperty(DensityProperty.class).getDensity();

        if (density == null) {
            return DensityType.DEFAULT;
        }

        return density;
    }

    public static DensityType getDensityValueForCurrentUser() {
        return getDensityValueForUser(User.current());
    }

    public static List<DensityType> getDensities() {
        return List.of(DensityType.values());
    }

    public enum DensityType {
        TIGHT,
        DEFAULT,
        SPACIOUS
    }

    @Extension
    @Symbol("density")
    public static final class DescriptorImpl extends UserPropertyDescriptor {
        @NonNull
        @Override
        public String getDisplayName() {
            return "Density";
        }

        @Override
        public UserProperty newInstance(User user) {
            return new DensityProperty();
        }

        @Override
        public UserProperty newInstance(@Nullable StaplerRequest req, @NonNull JSONObject formData) throws Descriptor.FormException {
            return new DensityProperty(DensityType.valueOf(formData.getString("density")));
        }

        public ListBoxModel doFillDensityItems(@AncestorInPath User user) {
            DensityType currentDensity = user != null ? getDensityValueForUser(user) : getDensityValueForCurrentUser();
            ListBoxModel items = new ListBoxModel();
            for (DensityType id : getDensities()) {
                items.add(new ListBoxModel.Option(id.name().toLowerCase(), id.toString(), currentDensity == id));
            }
            return items;
        }
    }
}
