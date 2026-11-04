// (C) 2021-2026 GoodData Corporation

import { Children, type PropsWithChildren } from "react";

import { completionStatus } from "@codemirror/autocomplete";
import { type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { createPortal } from "react-dom";

import { makeStyles } from "../theme/styles.js";

type StatusBarProps = {
    where: HTMLElement | null;
};

const useStyles = makeStyles()((theme) => ({
    statusBar: {
        width: "100%",
        position: "relative",
        fontFamily: theme.globals.font,
        borderTop: theme.statusBar.borders.default,
        background: theme.statusBar.colors.background,
    },
    content: {
        padding: "10px",
        fontSize: "12px",
        lineHeight: "16px",
        borderRadius: "5px",
        color: theme.statusBar.colors.color,
    },
}));

export function StatusBar({ where, children }: PropsWithChildren<StatusBarProps>) {
    const childrenArray = Children.toArray(children);
    const { classes } = useStyles();

    if (where && childrenArray.length > 0) {
        return createPortal(
            <div className={classes.statusBar} data-testid="status-bar">
                <div className={classes.content}>{children}</div>
            </div>,
            where,
        );
    }
    return null;
}

const SUGGESTION_TOOLTIP_SELECTOR = ".cm-tooltip-autocomplete";

/**
 * Reports the suggestion list element while it is open, so the status bar can render into it.
 */
export function suggestionElementObserver(
    setSuggestionsElement: (el: HTMLElement | null) => void,
): Extension {
    return EditorView.updateListener.of((update) => {
        const was = completionStatus(update.startState);
        const is = completionStatus(update.state);
        if (was === is) {
            return;
        }
        if (is === null) {
            setSuggestionsElement(null);
            return;
        }
        // The tooltip renders right after this update.
        queueMicrotask(() =>
            setSuggestionsElement(update.view.dom.querySelector<HTMLElement>(SUGGESTION_TOOLTIP_SELECTOR)),
        );
    });
}
