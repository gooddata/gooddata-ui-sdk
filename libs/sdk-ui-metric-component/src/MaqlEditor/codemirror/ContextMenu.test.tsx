// (C) 2026 GoodData Corporation

import { type RefObject, createRef } from "react";

import { type EditorView } from "@codemirror/view";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { shimMaqlEditor } from "../mock/editor-shim.js";

import { CodeEditor } from "./CodeEditor.js";
import { CONTEXT_MENU_TEST_CLASS, type IContextMenuItem, useCommonMenuItems } from "./ContextMenu.js";

shimMaqlEditor();

const MENU = `.${CONTEXT_MENU_TEST_CLASS}`;

const messages = {
    "metricComponent.editMetric.contextMenu.changeAllOccurrences": "Change All Occurrences",
    "metricComponent.editMetric.contextMenu.cut": "Cut",
    "metricComponent.editMetric.contextMenu.copy": "Copy",
    "metricComponent.editMetric.contextMenu.paste": "Paste",
};

function Editor({
    readonly = false,
    editor,
    extra = [],
}: {
    readonly?: boolean;
    editor: RefObject<EditorView | null>;
    extra?: IContextMenuItem[];
}) {
    const items = useCommonMenuItems();
    return (
        <CodeEditor
            defaultValue="SELECT 1"
            readonly={readonly}
            contextMenu={[items.changeAllOccurrences, ...extra, ...items.clipboard]}
            ref={editor}
        />
    );
}

function renderEditor(props: { readonly?: boolean; extra?: IContextMenuItem[] } = {}) {
    const editor = createRef<EditorView | null>();
    const result = render(
        <IntlProvider locale="en-US" messages={messages}>
            <Editor editor={editor} {...props} />
        </IntlProvider>,
    );
    return { ...result, editor };
}

function openMenu(editor: EditorView): void {
    act(() => {
        editor.contentDOM.dispatchEvent(
            new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 10, clientY: 20 }),
        );
    });
}

function menuLabels(): string[] {
    return Array.from(document.querySelectorAll(`${MENU} .gd-menu-item > span:first-child`)).map(
        (label) => label.textContent ?? "",
    );
}

afterEach(() => {
    // Unmounts the editors, and with them the menus they portalled into the body.
    cleanup();
});

describe("ContextMenu", () => {
    it("opens on right click with the actions in their groups", () => {
        const { editor } = renderEditor();

        openMenu(editor.current!);

        expect(menuLabels()).toEqual(["Change All Occurrences", "Cut", "Copy", "Paste"]);
        expect(document.querySelectorAll(`${MENU} .gd-list-item-separator`).length).toBe(1);
        expect(
            document.querySelector(`${MENU} .s-change-all-occurrences span:last-child`)?.textContent,
        ).toMatch(/F2$/);
    });

    it("offers only the read-only actions in a read-only editor", () => {
        const { editor } = renderEditor({ readonly: true });

        openMenu(editor.current!);

        expect(menuLabels()).toEqual(["Copy"]);
        expect(document.querySelectorAll(`${MENU} .gd-list-item-separator`).length).toBe(0);
    });

    it("runs the action with the editor and closes", () => {
        const run = vi.fn();
        const { editor } = renderEditor({
            extra: [{ id: "custom", group: "edit", label: "Custom", run }],
        });

        openMenu(editor.current!);
        act(() => {
            document.querySelector<HTMLElement>(`${MENU} .s-custom`)?.click();
        });

        expect(run).toHaveBeenCalledWith(editor.current);
        expect(document.querySelector(MENU)).toBeNull();
    });

    it("closes on Escape and on a click outside", () => {
        const { editor } = renderEditor();

        openMenu(editor.current!);
        act(() => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        });
        expect(document.querySelector(MENU)).toBeNull();

        openMenu(editor.current!);
        act(() => {
            document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        });
        expect(document.querySelector(MENU)).toBeNull();
    });

    it("stops the browser's menu anywhere in the editor and while it is open", () => {
        const { editor } = renderEditor();
        const onGutter = new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: 5,
            clientY: 5,
        });

        act(() => {
            editor.current?.dom.querySelector(".cm-gutters")?.dispatchEvent(onGutter);
        });
        expect(onGutter.defaultPrevented).toBe(true);
        expect(document.querySelector(MENU)).not.toBeNull();

        const onMenu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
        act(() => {
            document.querySelector(`${MENU} .s-copy`)?.dispatchEvent(onMenu);
        });
        expect(onMenu.defaultPrevented).toBe(true);
        expect(document.querySelector(MENU)).not.toBeNull();

        // The right button press that precedes a contextmenu event does not close the menu.
        act(() => {
            document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 2 }));
        });
        expect(document.querySelector(MENU)).not.toBeNull();

        // A right click on another control closes the menu and keeps its own menu.
        const elsewhere = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
        act(() => {
            document.body.dispatchEvent(elsewhere);
        });
        expect(elsewhere.defaultPrevented).toBe(false);
        expect(document.querySelector(MENU)).toBeNull();
    });

    it("takes the focus and runs an action from the keyboard", () => {
        const run = vi.fn();
        const { editor } = renderEditor({ extra: [{ id: "custom", group: "edit", label: "Custom", run }] });

        openMenu(editor.current!);
        const menu = document.querySelector<HTMLElement>(MENU)!;
        const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
        expect(menu.getAttribute("role")).toBe("menu");
        expect(document.activeElement).toBe(items[0]);

        act(() => {
            fireEvent.keyDown(menu, { key: "ArrowDown" });
        });
        expect(document.activeElement).toBe(items[1]);
        expect(items[1].className).toContain("s-custom");

        act(() => {
            fireEvent.keyDown(items[1], { key: "Enter" });
        });
        expect(run).toHaveBeenCalledWith(editor.current);
        expect(document.querySelector(MENU)).toBeNull();
    });

    it("opens at the cursor when the keyboard asks for it", () => {
        const { editor } = renderEditor();

        act(() => {
            editor.current?.contentDOM.dispatchEvent(
                new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }),
            );
        });

        expect(document.querySelector(MENU)).not.toBeNull();
    });

    it("leaves the browser's menu alone without actions", () => {
        const editor = createRef<EditorView | null>();
        render(<CodeEditor defaultValue="SELECT 1" ref={editor} />);
        const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });

        act(() => {
            editor.current?.contentDOM.dispatchEvent(event);
        });

        expect(event.defaultPrevented).toBe(false);
        expect(document.querySelector(MENU)).toBeNull();
    });
});
