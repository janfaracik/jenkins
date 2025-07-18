package jenkins.model.sections.details;

import hudson.Extension;
import hudson.ExtensionList;

@Extension
public class ParameterizedSectionGroup extends SectionGroup {

    @Override
    public String getIconClassName() {
        return "symbol-parameters";
    }

    @Override
    public String getDisplayName() {
        return "Parameters";
    }

    @Override
    public String getDescription() {
        return "Parameters allow you to prompt users for one or more inputs that will be passed into a build.";
    }

    public static ParameterizedSectionGroup get() {
        return ExtensionList.lookupSingleton(ParameterizedSectionGroup.class);
    }
}
