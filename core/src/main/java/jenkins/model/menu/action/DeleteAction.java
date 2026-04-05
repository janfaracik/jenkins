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

package jenkins.model.menu.action;

import hudson.model.Action;
import jenkins.model.menu.Group;
import jenkins.model.menu.Semantic;
import jenkins.model.menu.event.ConfirmationEvent;
import jenkins.model.menu.event.Event;

/**
 * A reusable delete action for items.
 */
public final class DeleteAction implements Action {

    private final String suffix;

    private final String displayName;

    /**
     *
     */
    public DeleteAction(String suffix, String displayName) {
        this.suffix = suffix;
        this.displayName = displayName;
    }

    @Override
    public String getDisplayName() {
        return Messages.DeleteAction_Delete(suffix);
    }

    @Override
    public String getIconFileName() {
        return "symbol-trash";
    }

    @Override
    public Group getGroup() {
        return Group.LAST_IN_MENU;
    }

    @Override
    public String getUrlName() {
        return null;
    }

    @Override
    public Event getEvent() {
        return ConfirmationEvent.of(Messages.DeleteAction_DeleteDialog_Title(displayName), "", "doDelete");
    }

    @Override
    public Semantic getSemantic() {
        return Semantic.DESTRUCTIVE;
    }
}
