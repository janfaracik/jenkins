/*
 * The MIT License
 *
 * Copyright 2013 Jesse Glick.
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

import hudson.Util;
import hudson.model.*;
import hudson.scm.ChangeLogSet;
import java.util.List;
import jenkins.console.ConsoleUrlProvider;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.DoNotUse;

@Restricted(DoNotUse.class) // only for buildTimeTrend.jelly
public class BuildTimeTrend extends RunListProgressiveRendering {

    @Override protected void calculate(Run<?, ?> build, JSONObject element) {
        BallColor iconColor = build.getIconColor();
        element.put("iconName", iconColor.getIconName());
        element.put("iconColorOrdinal", iconColor.ordinal());
        element.put("iconColorDescription", iconColor.getDescription());
        element.put("number", build.getNumber());
        element.put("displayName", build.getDisplayName());
        element.put("duration", build.getDuration());
        element.put("durationString", build.getDurationString());
        element.put("completed", build.getTimeInMillis() + build.getDuration());
        element.put("completedString", Util.getTimeSpanString(build.getTimeInMillis() + build.getDuration()));
        element.put("consoleUrl", ConsoleUrlProvider.getRedirectUrl(build));

        // TODO
        element.put("message", new JSONArray());

        if (build instanceof AbstractBuild) {
            AbstractBuild<?, ?> b = (AbstractBuild<?, ?>) build;
            ChangeLogSet<? extends ChangeLogSet.Entry> changeSets = b.getChangeSet();

//            String message = "";

//            changeSets.iterator().forEachRemaining(e -> {
//                message += e.getMsgAnnotated();
//            });

            List<? extends ChangeLogSet.Entry> thing = changeSets.getItems2();

            var array = new JSONArray();
            for (ChangeLogSet.Entry e : thing) {
                array.add(e.getMsgAnnotated());
            }

            element.put("message", array);

            Node n = b.getBuiltOn();
            if (n == null) {
                String ns = b.getBuiltOnStr();
                if (ns != null && !ns.isEmpty()) {
                    element.put("builtOnStr", ns);
                }
            } else if (n != Jenkins.get()) {
                element.put("builtOn", n.getNodeName());
                element.put("builtOnStr", n.getDisplayName());
            } else {
                element.put("builtOnStr", hudson.model.Messages.Hudson_Computer_DisplayName());
            }
        }
    }

    public static class SwagCard {
        private final String symbol;

        private final String label;

        private final String value;

        private String url;

        public SwagCard(String symbol, String label, String value) {
            this.symbol = symbol;
            this.label = label;
            this.value = value;
        }

        public SwagCard(String symbol, String label, String value, String url) {
            this.symbol = symbol;
            this.label = label;
            this.value = value;
            this.url = url;
        }

        public String getSymbol() {
            return symbol;
        }

        public String getLabel() {
            return label;
        }

        public String getValue() {
            return value;
        }

        public String getUrl() {
            return url;
        }
    }

    public List<SwagCard> getSwagCards() {
        return List.of(
                new SwagCard("symbol-timer", "Average time", "8418ms"),
                new SwagCard("symbol-play", "Last completed", "10 mins ago", "/"),
                new SwagCard("symbol-status-blue", "Last successful", "#118", "/"),
                new SwagCard("symbol-status-red", "Last failed", "#74", "/")
        );
    }
}
