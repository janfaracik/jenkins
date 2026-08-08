/*
 * The MIT License
 *
 * Copyright (c) 2026, Jan Faracik
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package jenkins.widgets;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.model.BallColor;
import hudson.model.Result;
import java.util.List;

/**
 * A status a build (or queue item) can be filtered by in the builds list's status filter
 * panel. Each entry's {@link #name()} is the value sent as the {@code status} query
 * parameter and understood by {@link HistoryPageFilter#setStatuses(java.util.Set)}.
 *
 * <p>Display name and icon are sourced from {@link Result}/{@link BallColor} where one
 * applies, rather than being redefined here, so the filter panel stays in sync with the
 * labels and icons already used for build status elsewhere (e.g. status icon tooltips).
 * {@link #BUILDING} and {@link #QUEUED} have no corresponding {@link Result}: a build in
 * progress hasn't produced a result yet, and a queue item isn't a build at all, just an
 * item waiting for one.
 */
public enum BuildStatusFilter {
    BUILDING(BallColor.BLUE_ANIME),
    QUEUED("Queued", "symbol-hourglass"),
    SUCCESS(Result.SUCCESS),
    UNSTABLE(Result.UNSTABLE),
    FAILURE(Result.FAILURE),
    ABORTED(Result.ABORTED),
    NOT_BUILT(Result.NOT_BUILT);

    // Only one of color/displayName is set, depending on which constructor ran.
    // color's description is resolved lazily in getDisplayName() since it depends on the
    // current request's locale - resolving it once here, at enum-init time, would freeze
    // it to whichever locale happened to be active when this class first loaded.
    private final BallColor color;
    private final String displayName;
    private final String icon;

    BuildStatusFilter(@NonNull Result result) {
        this(result.color);
    }

    BuildStatusFilter(@NonNull BallColor color) {
        this.color = color;
        this.displayName = null;
        this.icon = "symbol-status-" + color.getIconName();
    }

    BuildStatusFilter(String displayName, String icon) {
        this.color = null;
        this.displayName = displayName;
        this.icon = icon;
    }

    public String getValue() {
        return name();
    }

    public String getDisplayName() {
        return color != null ? color.getDescription() : displayName;
    }

    public String getIcon() {
        return icon;
    }

    @NonNull
    public static List<BuildStatusFilter> all() {
        return List.of(values());
    }
}
