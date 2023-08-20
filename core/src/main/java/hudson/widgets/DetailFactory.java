package src.main.java.hudson.widgets;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.ExtensionList;
import hudson.ExtensionPoint;

public class DetailFactory implements ExtensionPoint {

    public static @NonNull ExtensionList<DetailFactory> all() {
        return ExtensionList.lookup(DetailFactory.class);
    }
}
