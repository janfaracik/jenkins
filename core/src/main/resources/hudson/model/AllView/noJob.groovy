package hudson.model.AllView

import hudson.model.Computer
import hudson.model.Item
import hudson.model.Job
import jenkins.model.Jenkins

def l = namespace(lib.LayoutTagLib)
def f = namespace(lib.FormTagLib)

def isTopLevelAllView = my.owner == Jenkins.get();
def canSetUpDistributedBuilds = Jenkins.get().hasPermission(Computer.CREATE) &&
        Jenkins.get().clouds.isEmpty() &&
        Jenkins.get().getNodes().isEmpty();
def hasAdministerJenkinsPermission = Jenkins.get().hasPermission(Jenkins.ADMINISTER);
def hasItemCreatePermission = my.owner.itemGroup.hasPermission(Item.CREATE);

div(class:"ownerthing") {
    div(class: "empty-state-block") {
        if (isTopLevelAllView) {
            if (canSetUpDistributedBuilds || hasItemCreatePermission) {
                h1(class:"jenkinsintro", _("Welcome to Jenkins"))

                p(class:"jenkinsdesc", _("noJobDescription"))

                section(class: "empty-state-section") {
                    h2(_("startBuilding"), class: "h4")

                    ul(class: "empty-state-section-list") {
                        li(class: "content-block") {
                            a(href: "newJob", class: "content-block__link") {
                                span(_("createJob"))
                                span(class: "trailing-icon") {
                                    l.icon(src: "symbol-add")
                                }
                            }
                        }
                    }
                }

                if (canSetUpDistributedBuilds) {
                    section(class: "empty-state-section") {
                        h2(_("setUpDistributedBuilds"), class: "h4")
                        ul(class: "empty-state-section-list") {
                            li(class: "content-block") {
                                a(href: "computer/new", class: "content-block__link") {
                                    span(_("setUpAgent"))
                                    span(class: "trailing-icon") {
                                        l.icon(src: "symbol-computer")
                                    }
                                }
                            }

                            if (hasAdministerJenkinsPermission) {
                                li(class: "content-block") {
                                    a(href: "cloud/", class: "content-block__link") {
                                        span(_("setUpCloud"))
                                        span(class: "trailing-icon") {
                                            l.icon(src: "symbol-cloud")
                                        }
                                    }
                                }
                            }

                            li(class: "content-block") {
                                a(href: "https://www.jenkins.io/redirect/distributed-builds",
                                        target: "_blank",
                                        class: "content-block__link") {
                                    span(_("learnMoreDistributedBuilds"))
                                    span(class: "trailing-icon") {
                                        l.icon(src: "symbol-help-circle")
                                    }
                                }
                            }
                        }
                    }
                }

            }
        } else if (hasItemCreatePermission) {
            // we're in a folder

            section(class: "empty-state-section") {
                h2(_("thisFolderIsEmpty"), class: "h4")

                ul(class: "empty-state-section-list") {
                    li(class: "content-block") {
                        a(href: "newJob", class: "content-block__link") {
                            span(_("createJob"))
                            span(class: "trailing-icon") {
                                l.icon(src: "symbol-add")
                            }
                        }
                    }
                }
            }
        }

        // If the user is logged out
        if (h.isAnonymous() && !hasItemCreatePermission) {
            def canSignUp = app.securityRealm.allowsSignup()

            h1(class:"jenkinsintro", _("Welcome to Jenkins"))

            if (canSignUp) {
                p(class:"jenkinsdesc", _("anonymousDescriptionSignUpEnabled"))
            } else {
                p(class:"jenkinsdesc", _("anonymousDescription"))
            }

            ul(class: "signinthing") {
                li {
                    a(href: "${rootURL}/${app.securityRealm.loginUrl}?from=${request2.requestURI}",
                            class: "jenkins-button") {
                        span(_("Sign in"))
                    }
                }

                if (canSignUp) {
                    li {
                        a(href: "signup", class: "jenkins-button") {
                            span(_("Register"))
                        }
                    }
                }
            }
        }
    }
}
