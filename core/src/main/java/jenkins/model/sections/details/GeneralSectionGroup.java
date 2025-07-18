package jenkins.model.sections.details;

import hudson.Extension;
import hudson.ExtensionList;

@Extension
public class GeneralSectionGroup extends SectionGroup {

    @Override
    public String getDisplayName() {
        return "General";
    }

    @Override
    public String getIconClassName() {
        return "symbol-general";
    }

    public static GeneralSectionGroup get() {
        return ExtensionList.lookupSingleton(GeneralSectionGroup.class);
    }
}
