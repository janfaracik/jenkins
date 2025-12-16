package jenkins.model.details;

import edu.umd.cs.findbugs.annotations.Nullable;
import hudson.model.Job;

/**
 * TODO
 */
public class WeatherDetail extends Detail {

    public WeatherDetail(Job<?, ?> job) {
        super(job);
    }

    public @Nullable String getIconClassName() {
        var healthReports = ((Job<?, ?>) getObject()).getBuildHealthReports();
        var buildHealth = healthReports.isEmpty() ? null : healthReports.get(0);

        assert buildHealth != null;

        return "symbol-weather-" + buildHealth.getIconClassName();
    }

    @Override
    public @Nullable String getDisplayName() {
        return "Health";
    }
}
