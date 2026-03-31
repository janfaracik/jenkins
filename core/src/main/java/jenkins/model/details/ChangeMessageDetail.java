package jenkins.model.details;

import hudson.model.Run;
import hudson.scm.ChangeLogSet;
import java.util.ArrayList;
import java.util.List;
import jenkins.scm.RunWithSCM;
import org.jspecify.annotations.Nullable;

public class ChangeMessageDetail extends Detail {

    private final List<ChangeLogSet<? extends ChangeLogSet.Entry>> changeSets;

    public ChangeMessageDetail(Run<?, ?> run) {
        super(run);

        if (run instanceof RunWithSCM<?, ?> targetWithSCM) {
            changeSets = targetWithSCM.getChangeSets();
        } else {
            changeSets = new ArrayList<>();
        }
    }

    @Override
    public @Nullable String getIconClassName() {
        if (changeSets.isEmpty()) {
            return null;
        }

        return "symbol-changes";
    }

    @Override
    public @Nullable String getDisplayName() {
        ChangeLogSet.Entry firstChange = (ChangeLogSet.Entry) changeSets.getFirst().getItems()[0];
        return firstChange.getMsgAnnotated();
    }

    @Override
    public @Nullable String getLink() {
        return this.getObject().getSearchUrl() + "changes";
    }

    @Override
    public DetailVisibility getShorthand() {
        return DetailVisibility.SNIPPET;
    }
}
