/*
 * The MIT License
 *
 * Copyright (c) 2011, CloudBees, Inc.
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

package hudson.model;


import hudson.Extension;
import hudson.Util;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import jenkins.management.Badge;
import jenkins.model.Jenkins;
import jenkins.model.ModelObjectWithContextMenu;
import org.apache.commons.jelly.JellyContext;
import org.apache.commons.jelly.JellyException;
import org.apache.commons.jelly.JellyTagException;
import org.apache.commons.jelly.Script;
import org.jenkinsci.Symbol;
import org.kohsuke.accmod.Restricted;
import org.kohsuke.accmod.restrictions.NoExternalUse;
import org.kohsuke.stapler.HttpResponse;
import org.kohsuke.stapler.Stapler;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;
import org.kohsuke.stapler.WebApp;
import org.kohsuke.stapler.bind.JavaScriptMethod;
import org.kohsuke.stapler.jelly.DefaultScriptInvoker;
import org.kohsuke.stapler.jelly.JellyClassTearOff;

/**
 * Adds the "Manage Jenkins" link to the top page.
 *
 * @author Kohsuke Kawaguchi
 */
@Extension(ordinal = 100) @Symbol("manageJenkins")
public class ManageJenkinsAction implements RootAction, ModelObjectWithContextMenu {
    @Override
    public String getIconFileName() {
        if (Jenkins.get().hasAnyPermission(Jenkins.MANAGE, Jenkins.SYSTEM_READ))
            return "symbol-settings";
        else
            return null;
    }

    @Override
    public String getDisplayName() {
        return Messages.ManageJenkinsAction_DisplayName();
    }

    @Override
    public String getUrlName() {
        return "/manage";
    }

    public void doDynamic(StaplerRequest req, StaplerResponse rsp) throws IOException, ServletException {
        req.getView(this, "index.jelly").forward(req, rsp);
    }

    @Override
    public ContextMenu doContextMenu(StaplerRequest request, StaplerResponse response) throws JellyException, IOException {
        return new ContextMenu().from(this, request, response, "index");
    }

    /**
     * Workaround to ensuring that links in context menus resolve correctly in the submenu of the top-level 'Dashboard'
     * menu.
     */
    @Restricted(NoExternalUse.class)
    public void addContextMenuItem(ContextMenu menu, String url, String icon, String iconXml, String text, boolean post, boolean requiresConfirmation, Badge badge, String message) {
        if (Stapler.getCurrentRequest().findAncestorObject(this.getClass()) != null || !Util.isSafeToRedirectTo(url)) {
            // Default behavior if the URL is absolute or scheme-relative, or the current object is an ancestor (i.e. would resolve correctly)
            menu.add(url, icon, iconXml, text, post, requiresConfirmation, badge, message);
            return;
        }
        // If neither is the case, rewrite the relative URL to point to inside the /manage/ URL space
        menu.add("manage/" + url, icon, iconXml, text, post, requiresConfirmation, badge, message);
    }

    private static final Logger LOGGER = Logger.getLogger(ManageJenkinsAction.class.getName());

    @JavaScriptMethod
    public HttpResponse render(String clazz) throws JellyException, InvocationTargetException, InstantiationException, IllegalAccessException {
        WebApp webApp = WebApp.getCurrent();
        Object obj = Jenkins.get().getDynamic(clazz);
        Script script =  webApp.getMetaClass(obj.getClass()).loadTearOff(JellyClassTearOff.class).findScript("index");

        if (script == null) {
            script = webApp.getMetaClass(Jenkins.class).loadTearOff(JellyClassTearOff.class).findScript(((ManagementLink)obj).getUrlName());
            obj = Jenkins.get();
        }

        if (script == null) {
            script = webApp.getMetaClass(Hudson.class).loadTearOff(JellyClassTearOff.class).findScript(((ManagementLink)obj).getUrlName());
            obj = Hudson.get();
        }

        Map<String, Object> variables = Map.of("mindnotfriend", true);

        Script finalScript = script;
        Object finalObj = obj;
        return new HttpResponse() {
            @Override
            public void generateResponse(StaplerRequest req, StaplerResponse rsp, Object node) throws IOException {
                req.getWebApp().getDispatchValidator().allowDispatch(req, rsp);
                try {
                    new DefaultScriptInvoker() {
                        @Override
                        protected JellyContext createContext(StaplerRequest req, StaplerResponse rsp, Script script, Object it) {
                            return super.createContext(req, rsp, script, it);
                        }

                        @Override
                        protected void exportVariables(StaplerRequest req, StaplerResponse rsp, Script script, Object it, JellyContext context) {
                            super.exportVariables(req, rsp, script, it, context);
                            context.setVariables(variables);
                            req.setAttribute("currentDescriptorByNameUrl", "configureDescriptor");
                        }
                    }.invokeScript(req, rsp, finalScript, finalObj);
                } catch (JellyTagException e) {
                    LOGGER.log(Level.WARNING, "Failed to evaluate the template closure", e);
                    throw new IOException("Failed to evaluate the template closure", e);
                }
            }
        };
    }
}
