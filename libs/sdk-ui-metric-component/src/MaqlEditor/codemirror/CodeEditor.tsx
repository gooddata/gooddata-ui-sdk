// (C) 2021-2026 GoodData Corporation

import { type Ref, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import classNames from "classnames";

import { type IMaqlCodeTheme } from "../hooks/useCodeTheme.js";
import { makeStyles } from "../theme/styles.js";

import { baseExtensions, lineNumbersExtension, readOnlyExtension } from "./baseExtensions.js";
import { CodeEditorStyles, type IMaqlEditorIcons } from "./CodeEditor.styles.js";
import { ContextMenu, type IContextMenuItem, type IMenuPosition } from "./ContextMenu.js";
import { useAutofocus } from "./hooks/useAutofocus.js";

export interface ICodeEditorProps {
    inline?: boolean;
    readonly?: boolean;
    autofocus?: boolean;
    lineNumbers?: boolean;
    className?: string;
    defaultValue?: string;
    icons?: IMaqlEditorIcons;
    codeTheme?: IMaqlCodeTheme;
    /**
     * The accessible name of the editor, read to screen-reader users in place of the code.
     */
    ariaLabel?: string;
    /**
     * Language and behaviour of the editor. A new array reconfigures the running editor.
     */
    extensions?: Extension;
    /**
     * The actions of the context menu. Without them, the browser's own menu opens.
     */
    contextMenu?: IContextMenuItem[];
    /**
     * Called once, when the editor is created.
     */
    onEditorMount?: (editor: EditorView) => void;
    /**
     * Called when the editor is created and whenever the callback itself changes.
     */
    onEditorUpdate?: (editor: EditorView) => void;
    ref?: Ref<EditorView | null>;
}

const useStyles = makeStyles()(() => ({
    editor: {
        display: "flex",
        position: "relative",
        textAlign: "initial",
        width: "100%",
        height: "100%",
    },
    inline: {
        height: "auto",
    },
    content: {
        width: "100%",
        minWidth: 0,
        height: "100%",
    },
}));

export const MainClass = "maql-editor";
export const MainClassContent = "maql-editor-content";

/**
 * The property of the content element (`.cm-content`) that holds the editor view, for tests and
 * tooling that run in the page without the library: `EditorView.findFromDOM` is not available there.
 *
 * @internal
 */
export const EDITOR_VIEW_PROPERTY = "maqlEditorView";

function attachView(content: HTMLElement, view: EditorView | null): void {
    (content as unknown as Record<string, EditorView | null>)[EDITOR_VIEW_PROPERTY] = view;
}

function ariaLabelExtension(label: string | undefined): Extension {
    return label ? EditorView.contentAttributes.of({ "aria-label": label }) : [];
}

function stopHandledKeys(event: KeyboardEvent): void {
    if (event.defaultPrevented) {
        event.stopPropagation();
    }
}

/**
 * Where the menu opens: under the pointer, or under the cursor when the keyboard asked for it
 * (the Menu key and Shift+F10 come without a pointer position).
 */
function menuPosition(view: EditorView, event: MouseEvent): IMenuPosition {
    if (event.clientX > 0 || event.clientY > 0) {
        return { x: event.clientX, y: event.clientY };
    }
    const cursor = view.coordsAtPos(view.state.selection.main.head);
    return cursor ? { x: cursor.left, y: cursor.bottom } : { x: 0, y: 0 };
}

/**
 * A CodeMirror editor in the frame, theme and lifecycle every editor of this package shares. The
 * language and the behaviour come in through `extensions`.
 */
export const CodeEditor = forwardRef<EditorView | null, ICodeEditorProps>(function CodeEditor(
    {
        inline = false,
        readonly = false,
        autofocus = false,
        lineNumbers = !inline,
        className = "",
        defaultValue = "",
        icons,
        codeTheme,
        ariaLabel,
        extensions,
        contextMenu,
        onEditorMount,
        onEditorUpdate,
    },
    ref,
) {
    const [element, setElement] = useState<HTMLDivElement | null>(null);
    const [uniqueId] = useState(() => `${MainClassContent}-${Math.random().toString(36).slice(2)}`);
    const [editor, setEditor] = useState<EditorView | null>(null);
    const [menu, setMenu] = useState<IMenuPosition | null>(null);
    const closeMenu = useCallback(() => setMenu(null), []);
    const menuItems = useRef(contextMenu);
    menuItems.current = contextMenu;
    const compartments = useRef({
        extensions: new Compartment(),
        lineNumbers: new Compartment(),
        readOnly: new Compartment(),
        ariaLabel: new Compartment(),
    }).current;
    const { classes } = useStyles();

    // The props the one-time creation reads, without making it depend on them.
    const initial = useRef({ defaultValue, extensions, lineNumbers, readonly, ariaLabel });
    initial.current = { defaultValue, extensions, lineNumbers, readonly, ariaLabel };

    useEffect(() => {
        if (!element) {
            return undefined;
        }

        const view = new EditorView({
            state: EditorState.create({
                doc: initial.current.defaultValue,
                extensions: [
                    baseExtensions(),
                    compartments.lineNumbers.of(lineNumbersExtension(initial.current.lineNumbers)),
                    compartments.readOnly.of(readOnlyExtension(initial.current.readonly)),
                    compartments.ariaLabel.of(ariaLabelExtension(initial.current.ariaLabel)),
                    compartments.extensions.of(initial.current.extensions ?? []),
                ],
            }),
            parent: element,
        });
        // CodeMirror prevents the default of the keys it handles but lets them bubble, and the
        // dialog around the editor moves the focus on Tab and closes on Escape, which closes the
        // find panel here. Monaco stopped the keys it handled. The panel sits beside the content,
        // so the whole editor is listened to.
        view.dom.addEventListener("keydown", stopHandledKeys);
        // The browser's menu is stopped before anything else sees the event, anywhere in the
        // editor (the gutter and the panels included), the way Monaco's menu covered it.
        const openMenu = (event: MouseEvent) => {
            if (menuItems.current?.length) {
                event.preventDefault();
                event.stopPropagation();
                setMenu(menuPosition(view, event));
            }
        };
        view.dom.addEventListener("contextmenu", openMenu, true);
        attachView(view.contentDOM, view);
        setEditor(view);

        return () => {
            view.dom.removeEventListener("keydown", stopHandledKeys);
            view.dom.removeEventListener("contextmenu", openMenu, true);
            attachView(view.contentDOM, null);
            view.destroy();
            setEditor(null);
            setMenu(null);
        };
    }, [element, compartments]);

    useEffect(() => {
        editor?.dispatch({ effects: compartments.extensions.reconfigure(extensions ?? []) });
    }, [editor, extensions, compartments]);

    useEffect(() => {
        editor?.dispatch({ effects: compartments.ariaLabel.reconfigure(ariaLabelExtension(ariaLabel)) });
    }, [editor, ariaLabel, compartments]);

    useEffect(() => {
        editor?.dispatch({
            effects: compartments.lineNumbers.reconfigure(lineNumbersExtension(lineNumbers)),
        });
    }, [editor, lineNumbers, compartments]);

    useEffect(() => {
        editor?.dispatch({ effects: compartments.readOnly.reconfigure(readOnlyExtension(readonly)) });
    }, [editor, readonly, compartments]);

    useDefaultValue(editor, defaultValue);

    const mountCallback = useRef(onEditorMount);
    mountCallback.current = onEditorMount;
    useEffect(() => {
        if (editor) {
            mountCallback.current?.(editor);
        }
    }, [editor]);

    useEffect(() => {
        if (editor) {
            onEditorUpdate?.(editor);
        }
    }, [editor, onEditorUpdate]);

    useImperativeHandle<EditorView | null, EditorView | null>(ref, () => editor, [editor]);

    useAutofocus(element, editor, autofocus);

    return (
        <section
            id={uniqueId}
            className={classNames(classes.editor, MainClassContent, inline && classes.inline)}
        >
            <CodeEditorStyles id={uniqueId} icons={icons} codeTheme={codeTheme} inline={inline} />
            <div ref={setElement} className={classNames(classes.content, MainClass, className)} />
            {menu && editor && contextMenu ? (
                <ContextMenu editor={editor} items={contextMenu} position={menu} onClose={closeMenu} />
            ) : null}
        </section>
    );
});

/**
 * Replaces the content when the parent hands in a different value. The parent's own edits come
 * back as the same value, so they do not replace anything.
 */
function useDefaultValue(editor: EditorView | null, defaultValue: string): void {
    useEffect(() => {
        if (!editor) {
            return;
        }

        const current = editor.state.doc.toString();
        if (defaultValue !== current) {
            editor.dispatch({ changes: { from: 0, to: current.length, insert: defaultValue } });
        }
    }, [defaultValue, editor]);
}
