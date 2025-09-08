package jenkins.run;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.model.Run;
import java.util.Collection;
import java.util.List;
import jenkins.model.TransientActionFactory;

@Extension
public class RunActionFactory extends TransientActionFactory<Run> {

    @Override
    public Class<Run> type() {
        return Run.class;
    }

    @NonNull
    @Override
    public Collection<? extends RunTab> createFor(@NonNull Run target) {
        return List.of(new OverviewAction(), new ConsoleAction(), new TestsAction(), new ArtifactsAction());
    }
}
