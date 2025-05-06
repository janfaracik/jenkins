/*
 * The MIT License
 *
 * Copyright (c) 2012, CloudBees, Intl., Nicolas De loof
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

package jenkins.management;

import edu.umd.cs.findbugs.annotations.NonNull;
import hudson.Extension;
import hudson.model.AdministrativeMonitor;
import hudson.model.ManagementLink;
import hudson.model.PageDecorator;
import hudson.security.Permission;
import jenkins.model.Jenkins;
import org.jenkinsci.Symbol;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

/**
 * @author <a href="mailto:nicolas.deloof@gmail.com">Nicolas De Loof</a>
 */
@Extension(ordinal = Integer.MAX_VALUE - 200) @Symbol("configure")
public class ConfigureLink extends ManagementLink {

    @Override
    public String getIconFileName() {
        return "symbol-settings";
    }

    @Override
    public String getDisplayName() {
        return Messages.ConfigureLink_DisplayName();
    }

    @Override
    public String getDescription() {
        return Messages.ConfigureLink_Description();
    }

    @NonNull
    @Override
    public Permission getRequiredPermission() {
        return Jenkins.READ;
    }

    @Override
    public String getUrlName() {
        return "configure";
    }

    @NonNull
    @Override
    public Category getCategory() {
        return Category.CONFIGURATION;
    }

    @Override
    public Badge getBadge() {
        Jenkins jenkins = Jenkins.get();
        AdministrativeMonitorsDecorator decorator = jenkins.getExtensionList(PageDecorator.class)
                .get(AdministrativeMonitorsDecorator.class);

        if (decorator == null) {
            return null;
        }

        Collection<AdministrativeMonitor> activeAdministrativeMonitors = Optional.ofNullable(decorator.getMonitorsToDisplay()).orElse(Collections.emptyList());
        boolean anySecurity = activeAdministrativeMonitors.stream().anyMatch(AdministrativeMonitor::isSecurity);

        if (activeAdministrativeMonitors.isEmpty()) {
            return null;
        }

        int size = activeAdministrativeMonitors.size();
        String tooltip = size > 1 ? hudson.model.Messages.ManageJenkinsAction_notifications(size) : hudson.model.Messages.ManageJenkinsAction_notification(size);

        return new Badge(String.valueOf(size),
                tooltip,
                anySecurity ? Badge.Severity.DANGER : Badge.Severity.WARNING);
    }
}
