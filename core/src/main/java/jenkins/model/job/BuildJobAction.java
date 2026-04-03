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

package jenkins.model.job;

import hudson.Extension;
import hudson.model.Action;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import jenkins.model.ParameterizedJobMixIn;
import jenkins.model.TransientActionFactory;
import jenkins.model.experimentalflags.NewJobPageUserExperimentalFlag;
import jenkins.model.menu.Group;
import jenkins.model.menu.Semantic;
import jenkins.model.menu.event.DialogEvent;
import jenkins.model.menu.event.Event;
import jenkins.model.menu.event.JavaScriptEvent;

@Extension
public class BuildJobAction extends TransientActionFactory<ParameterizedJobMixIn.ParameterizedJob> {

    @Override
    public Class<ParameterizedJobMixIn.ParameterizedJob> type() {
        return ParameterizedJobMixIn.ParameterizedJob.class;
    }

    @Override
    public Collection<? extends Action> createFor(ParameterizedJobMixIn.ParameterizedJob target) {
        Boolean newJobPageEnabled = new NewJobPageUserExperimentalFlag().getFlagValue();

        // This condition can be removed when the flag has been removed
        if (!newJobPageEnabled) {
            return Set.of();
        }

        if (!target.isBuildable()) {
            return Set.of();
        }

        return Set.of(new Action() {
            @Override
            public String getDisplayName() {
                return target.getBuildNowText();
            }

            @Override
            public String getIconFileName() {
                return "symbol-play";
            }

            @Override
            public Group getGroup() {
                return Group.FIRST_IN_APP_BAR;
            }

            @Override
            public String getUrlName() {
                return "build";
            }

            @Override
            public Event getEvent() {
                if (isParameterized()) {
                    return DialogEvent.of("parametersDefinitionProperty/dialog");
                }

                return JavaScriptEvent.of(Map.of("type", "build-now", "href", "build?delay=0sec", "buildSuccess", Messages.BuildJobAction_BuildSuccess(), "buildFailure", Messages.BuildJobAction_BuildFailure()), "jsbundles/pages/project/build.js");
            }

            @Override
            public Semantic getSemantic() {
                return Semantic.BUILD;
            }

            private boolean isParameterized() {
                return target.isParameterized();
            }
        });
    }
}
