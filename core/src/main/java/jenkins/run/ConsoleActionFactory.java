package jenkins.run;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.Functions;
import hudson.model.Run;
import java.util.Collection;
import java.util.Collections;
import jenkins.console.DefaultConsoleUrlProvider;
import jenkins.model.TransientActionFactory;

@Extension(ordinal = Integer.MAX_VALUE - 1)
public class ConsoleActionFactory extends TransientActionFactory<Run> {

    @Override
    public Class<Run> type() {
        return Run.class;
    }

    @NonNull
    @Override
    public Collection<? extends RunTab> createFor(@NonNull Run target) {
        var consoleProvider = Functions.getConsoleProviderFor(target);

        if (!consoleProvider.getClass().equals(DefaultConsoleUrlProvider.class)) {
            return Collections.emptySet();
        }

        return Collections.singleton(new ConsoleAction(target));
    }
}
