package hudson.model.testtest;

import hudson.model.TopLevelItem;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;

import javax.servlet.ServletException;

public abstract class BaseViewThing {

    public abstract String getDisplayName();

    public abstract String getIcon();

    public abstract TopLevelItem doCreateItem(StaplerRequest req, StaplerResponse rsp) throws ServletException;
}
