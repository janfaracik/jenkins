package src.main.java.hudson.widgets;

import hudson.Extension;
import org.jenkinsci.Symbol;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.DoNotUse;

public class GithubLink {

    @Extension
    @Restricted(DoNotUse.class)
    @Symbol("github")
    public static final class FactoryImpl extends DetailFactory {
    }
}
