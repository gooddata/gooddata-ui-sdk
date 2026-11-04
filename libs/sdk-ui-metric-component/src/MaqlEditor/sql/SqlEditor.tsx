// (C) 2021-2026 GoodData Corporation

import { type Ref, forwardRef, useImperativeHandle, useMemo, useRef } from "react";

import { type Extension } from "@codemirror/state";
import { type Command, EditorView, keymap } from "@codemirror/view";
import classNames from "classnames";
import { useIntl } from "react-intl";

import { CodeEditor } from "../codemirror/CodeEditor.js";
import { type IContextMenuItem, platformShortcut, useCommonMenuItems } from "../codemirror/ContextMenu.js";
import { type MaqlEditorView } from "../codemirror/types.js";
import { useCodeTheme } from "../hooks/useCodeTheme.js";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard.js";
import { type MaqlEditorDefaultTheme } from "../theme/default.js";
import { ThemeProvider } from "../theme/theme.js";

import { formatValue } from "./formatter.js";
import { SqlEditorClass, SqlEditorTestClass } from "./SqlEditor.styles.js";
import { sqlLanguageSupport } from "./sqlLanguage.js";

/**
 * @internal
 */
export interface ISqlEditorApi {
    /**
     * Copies the SQL to the clipboard.
     *
     * @returns whether the text reached the clipboard
     */
    copy: () => Promise<boolean>;
}

/**
 * @internal
 */
export interface ISqlEditorProps {
    cssTheme?: MaqlEditorDefaultTheme;
    autofocus?: boolean;
    defaultValue?: string;
    readonly?: boolean;
    inline?: boolean;
    /**
     * The accessible name of the editor.
     */
    ariaLabel?: string;
    onFocus?: (editor: MaqlEditorView) => void;
    onBlur?: (editor: MaqlEditorView) => void;
    onEditorMount?: (editor: MaqlEditorView) => void;
    onChange?: (editor: MaqlEditorView, value: string) => void;
    ref?: Ref<ISqlEditorApi | null>;
}

/**
 * Replaces the SQL with its formatted version.
 */
const formatDocument: Command = (view) => {
    // The read-only facet stops the user's edits, not a dispatched change.
    if (view.state.readOnly) {
        return false;
    }
    const text = view.state.doc.toString();
    view.dispatch({ changes: { from: 0, to: text.length, insert: formatValue(text) } });
    return true;
};

/**
 * @internal
 */
export const SqlEditor = forwardRef<ISqlEditorApi, ISqlEditorProps>(function SqlEditor(
    {
        readonly = false,
        inline = false,
        autofocus = false,
        defaultValue = "",
        cssTheme,
        ariaLabel,
        onFocus,
        onBlur,
        onEditorMount,
        onChange,
    },
    ref,
) {
    const intl = useIntl();
    const codeTheme = useCodeTheme();
    const formattedValue = useMemo(() => formatValue(defaultValue), [defaultValue]);
    const copyToClipboard = useCopyToClipboard();
    const editor = useRef<EditorView | null>(null);
    const commonMenuItems = useCommonMenuItems();

    const handlers = useRef({ onFocus, onBlur, onChange });
    handlers.current = { onFocus, onBlur, onChange };

    const contextMenu = useMemo<IContextMenuItem[]>(
        () => [
            commonMenuItems.changeAllOccurrences,
            {
                id: "format-document",
                group: "edit",
                label: intl.formatMessage({ id: "metricComponent.editMetric.contextMenu.formatDocument" }),
                shortcut: platformShortcut("⇧⌥F", "Shift+Alt+F"),
                run: formatDocument,
            },
            ...commonMenuItems.clipboard,
        ],
        [intl, commonMenuItems],
    );

    const extensions = useMemo<Extension>(
        () => [
            sqlLanguageSupport(),
            keymap.of([{ key: "Shift-Alt-f", run: formatDocument }]),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    handlers.current.onChange?.(update.view, update.state.doc.toString());
                }
            }),
            EditorView.domEventHandlers({
                focus: (_event, view) => {
                    handlers.current.onFocus?.(view);
                    return false;
                },
                blur: (_event, view) => {
                    handlers.current.onBlur?.(view);
                    return false;
                },
            }),
        ],
        [],
    );

    useImperativeHandle(ref, () => ({
        copy: () => copyToClipboard(editor.current),
    }));

    return (
        <ThemeProvider theme={cssTheme}>
            <CodeEditor
                inline={inline}
                lineNumbers={false}
                readonly={readonly}
                autofocus={autofocus}
                className={classNames(SqlEditorClass, SqlEditorTestClass)}
                defaultValue={formattedValue}
                codeTheme={codeTheme}
                ariaLabel={ariaLabel}
                extensions={extensions}
                contextMenu={contextMenu}
                onEditorMount={onEditorMount}
                ref={editor}
            />
        </ThemeProvider>
    );
});
