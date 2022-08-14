/*
 * The MIT License
 *
 * Copyright (c) 2016, CloudBees, Inc.
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

package jenkins.security.UpdateSiteWarningsMonitor

def f = namespace(lib.FormTagLib)
def l = namespace(lib.LayoutTagLib)

def listWarnings(warnings) {
    warnings.each { warning ->
        dd {
            a(warning.message, href: warning.url, rel: 'noopener noreferrer', target: "_blank")
        }
    }
}

def coreWarnings = my.activeCoreWarnings
def pluginWarnings = my.activePluginWarningsByPlugin

div(class: "alert alert-danger", role: "alert") {
    text(_("blurb"))

    if (!coreWarnings.isEmpty()) {
        dl {
            dt {
                text(_("coreTitle", jenkins.model.Jenkins.version))
            }
            listWarnings(coreWarnings)
        }
    }
    if (!pluginWarnings.isEmpty()) {
        dl {
            pluginWarnings.each { plugin, warnings ->
                dt {
                    a(_("pluginTitle", plugin.displayName, plugin.version), href: plugin.url, rel: 'noopener noreferrer', target: "_blank")
                }
                listWarnings(warnings)
            }
        }
    }

    if (my.hasApplicableHiddenWarnings()) {
        text(_("more"))
    }

    l.isAdmin() {
        form(method: "post", class: "jenkins-buttons-row", action: "${rootURL}/${my.url}/forward") {
            if (!pluginWarnings.isEmpty()) {
                button(name: 'fix', class: 'jenkins-button jenkins-button--primary jenkins-!-inherit-color') {
                    l.icon(src: 'symbol-plugins')
                    span(_("pluginManager.link"))
                }
            }
            a(href: "${rootURL}/manage/configureSecurity#hidden-security-warnings", class: 'jenkins-button jenkins-!-inherit-color') {
                l.icon(src: 'symbol-settings')
                span(_("configureSecurity.link"))
            }
        }
    }
}
