package jenkins.model.log;

import hudson.Extension;
import hudson.logging.LogRecorder;
import hudson.model.Action;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import jenkins.model.TransientActionFactory;
import jenkins.model.menu.event.DropdownEvent;
import jenkins.model.menu.event.Event;

@Extension
public class AtomFeedAction extends TransientActionFactory<LogRecorder> {

    @Override
    public Class<LogRecorder> type() {
        return LogRecorder.class;
    }

    @Override
    public Collection<? extends Action> createFor(LogRecorder target) {
        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return "Atom feed";
            }

            @Override
            public String getIconFileName() {
                return "symbol-rss";
            }

            @Override
            public String getUrlName() {
                return null;
            }

            @Override
            public Event getEvent() {
                return DropdownEvent.of(List.of(
                        new Action() {
                            @Override
                            public String getIconFileName() {
                                return "symbol-rss";
                            }

                            @Override
                            public String getDisplayName() {
                                return "All";
                            }

                            @Override
                            public String getUrlName() {
                                return "rss";
                            }
                        },
                        new Action() {
                            @Override
                            public String getIconFileName() {
                                return "symbol-rss";
                            }

                            @Override
                            public String getDisplayName() {
                                return "Warning";
                            }

                            @Override
                            public String getUrlName() {
                                return "rss?level=WARNING";
                            }
                        },
                        new Action() {
                            @Override
                            public String getIconFileName() {
                                return "symbol-rss";
                            }

                            @Override
                            public String getDisplayName() {
                                return "Severe";
                            }

                            @Override
                            public String getUrlName() {
                                return "rss?level=SEVERE";
                            }
                        }
                ));
            }

            @Override
            public boolean isVisibleInContextMenu() {
                return false;
            }
        });
    }
}
