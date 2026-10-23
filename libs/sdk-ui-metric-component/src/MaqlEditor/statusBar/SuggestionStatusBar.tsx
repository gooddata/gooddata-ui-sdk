// (C) 2021-2026 GoodData Corporation

import { Children, type PropsWithChildren } from "react";

import { createPortal } from "react-dom";

import { type IStandaloneCodeEditor, type ISuggestContribution } from "../monaco/MonacoEditor.js";
import { makeStyles } from "../theme/styles.js";

type StatusBarProps = {
    where: HTMLElement | null;
};

const useStyles = makeStyles()((theme) => ({
    statusBar: {
        width: "100%",
        position: "relative",
        fontFamily: theme.globals.font,
        borderLeft: theme.statusBar.borders.default,
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

export function onSuggestionElement(
    editor: IStandaloneCodeEditor,
    setSuggestionsElement: (el: HTMLElement | null) => void,
): void {
    const suggestionWidget = editor.getContribution<ISuggestContribution>("editor.contrib.suggestController");
    const widget = suggestionWidget?.widget;

    if (widget) {
        widget.value.onDidShow(() => setSuggestionsElement(widget.value.element.domNode));
        widget.value.onDidHide(() => setSuggestionsElement(null));
    }
}
