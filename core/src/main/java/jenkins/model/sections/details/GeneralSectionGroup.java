package jenkins.model.sections.details;

import hudson.Extension;
import hudson.ExtensionList;

@Extension(ordinal = Integer.MAX_VALUE)
public class GeneralSectionGroup extends SectionGroup {

    @Override
    public String getIconClassName() {
        return "symbol-settings";
    }

    @Override
    public String getDisplayName() {
        return "General";
    }

    public static GeneralSectionGroup get() {
        return ExtensionList.lookupSingleton(GeneralSectionGroup.class);
    }
}
