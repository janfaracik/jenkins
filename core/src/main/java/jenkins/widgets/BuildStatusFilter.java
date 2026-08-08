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
import java.util.List;

/**
 * A status a build (or queue item) can be filtered by in the builds list's status filter
 * panel. Each entry's {@link #name()} is the value sent as the {@code status} query
 * parameter and understood by {@link HistoryPageFilter#setStatuses(java.util.Set)}.
 */
public enum BuildStatusFilter {
    BUILDING("Running", "symbol-status-blue-anime"),
    QUEUED("Queued", "symbol-hourglass"),
    SUCCESS("Successful", "symbol-status-blue"),
    FAILURE("Failed", "symbol-status-red"),
    UNSTABLE("Unstable", "symbol-status-yellow"),
    ABORTED("Aborted", "symbol-status-aborted"),
    NOT_BUILT("Not built", "symbol-status-nobuilt");

    private final String displayName;
    private final String iconClassName;

    BuildStatusFilter(String displayName, String iconClassName) {
        this.displayName = displayName;
        this.iconClassName = iconClassName;
    }

    public String getValue() {
        return name();
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIconClassName() {
        return iconClassName;
    }

    @NonNull
    public static List<BuildStatusFilter> all() {
        return List.of(values());
    }
}
