package jenkins.views;

import edu.umd.cs.findbugs.annotations.NonNull;
import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.Extension;
import hudson.model.Descriptor;
import hudson.model.User;
import hudson.model.UserProperty;
import hudson.model.UserPropertyDescriptor;
import net.sf.json.JSONObject;
import org.jenkinsci.Symbol;
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

    public static DensityType getDensityValueForCurrentUser() {
        User user = User.current();

        if (user == null) {
            return DensityType.DEFAULT;
        }

        return user.getProperty(DensityProperty.class).getDensity();
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
    }
}
