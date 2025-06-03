package hudson.model;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.model.userproperty.UserPropertyCategory;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;

@Restricted(NoExternalUse.class)
public class UserGeneralProperty extends UserProperty {

    @Extension(ordinal = Integer.MAX_VALUE)
    public static class DescriptorImpl extends UserPropertyDescriptor {

        @NonNull
        @Override
        public String getDisplayName() {
            return "General";
        }

        @Override
        public UserProperty newInstance(User user) {
            return new UserGeneralProperty();
        }

        @Override
        public @NonNull UserPropertyCategory getUserPropertyCategory() {
            return UserPropertyCategory.get(UserPropertyCategory.Account.class);
        }
    }
}
