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
package hudson.tasks.Shell
f=namespace(lib.FormTagLib)

f.entry(title:_("Command"),description:_("description",rootURL)) {
    f.textarea(name: "command", value: instance?.command, class: "fixed-width", 'codemirror-mode': 'shell', 'codemirror-config': '"mode": "text/x-sh"')
}

f.advanced() {
    f.entry(title:_("Exit code to set build unstable"), field: "unstableReturn") {
        f.number(clazz:"positive-number", value: instance?.unstableReturn, min:1, max:255, step:1)
    }

    if (instance?.configuredLocalRules || descriptor.applicableLocalRules) {
        f.entry(title: _("filterRules")) {
            f.hetero_list(
                    name: "configuredLocalRules",
                    hasHeader: true,
                    oneEach: true,
                    disableDragAndDrop: true,
                    descriptors: descriptor.applicableLocalRules,
                    items: instance?.configuredLocalRules,
                    addCaption: _("addFilterRule")
            )
        }
    }
}
