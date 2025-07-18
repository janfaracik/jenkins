package jenkins.model.sections.details;

import hudson.Extension;
import hudson.ExtensionList;

@Extension
public class AdvancedSectionGroup extends SectionGroup {

    @Override
    public String getIconClassName() {
        return "symbol-unknown";
    }

    @Override
    public String getDisplayName() {
        return "Advanced";
    }

    public static AdvancedSectionGroup get() {
        return ExtensionList.lookupSingleton(AdvancedSectionGroup.class);
    }
}
