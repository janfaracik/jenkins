package jenkins.model.sections.details;

import hudson.Extension;
import hudson.ExtensionList;

@Extension
public class ParameterizedSectionGroup extends SectionGroup {

    @Override
    public String getDisplayName() {
        return "Parameterized group";
    }

    @Override
    public String getIconClassName() {
        return "symbol-parameter";
    }

    public static ParameterizedSectionGroup get() {
        return ExtensionList.lookupSingleton(ParameterizedSectionGroup.class);
    }
}
