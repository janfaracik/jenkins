package jenkins.model.view;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.View;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.experimentalflags.NewDashboardPageUserExperimentalFlag;
import jenkins.model.menu.Group;
import jenkins.model.menu.event.DropdownEvent;
import jenkins.model.menu.event.Event;

@Extension
public class RssAction extends TransientActionFactory<View> {

    @Override
    public Class<View> type() {
        return View.class;
    }

    @Override
    public Collection<? extends Action> createFor(View target) {
        Boolean newDashboardPageEnabled = new NewDashboardPageUserExperimentalFlag().getFlagValue();

        // This condition can be removed when the flag has been removed
        if (!newDashboardPageEnabled) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Atom Feed";
            }

            @Override
            public String getIconFileName() {
                return "symbol-rss";
            }

            @Override
            public Group getGroup() {
                return Group.of(Integer.MAX_VALUE - 1);
            }

            @Override
            public String getUrlName() {
                return "";
            }

            @Override
            public Event getEvent() {
                return DropdownEvent.of(List.of(new Action() {
                    @Override
                    public String getIconFileName() {
                        return "symbol-list";
                    }

                    @Override
                    public String getDisplayName() {
                        return "All";
                    }

                    @Override
                    public String getUrlName() {
                        return "rssAll";
                    }
                }, new Action() {
                    @Override
                    public String getIconFileName() {
                        return "symbol-clock";
                    }

                    @Override
                    public String getDisplayName() {
                        return "Latest builds";
                    }

                    @Override
                    public String getUrlName() {
                        return "rssLatest";
                    }
                }, new Action() {
                    @Override
                    public String getIconFileName() {
                        return "symbol-close-circle";
                    }

                    @Override
                    public String getDisplayName() {
                        return "Failures";
                    }

                    @Override
                    public String getUrlName() {
                        return "rssFailed";
                    }
                }));
            }
        });
    }
}
