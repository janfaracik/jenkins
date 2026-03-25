package jenkins.model.details;

import hudson.Extension;
import hudson.ExtensionList;

@Extension(ordinal = Integer.MIN_VALUE)
public class WeatherDetailGroup extends DetailGroup {

    public static WeatherDetailGroup get() {
        return ExtensionList.lookupSingleton(WeatherDetailGroup.class);
    }
}
