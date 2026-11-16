// (C) 2026 GoodData Corporation

import { completionStatus, startCompletion } from "@codemirror/autocomplete";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type CompletionItem, CompletionItemKind } from "vscode-languageserver-types";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";
import { UiFocusTrap } from "@gooddata/sdk-ui-kit";

import { maqlCompletion, setDocsVisible } from "../maql/extensions/completion.js";
import { shimMaqlEditor } from "../mock/editor-shim.js";

import { baseExtensions, readOnlyExtension } from "./baseExtensions.js";

shimMaqlEditor();

/**
 * The editor between two controls in the focus trap a dialog puts around it (the metric editor's).
 * The test DOM does not move the focus on Tab itself; the trap does, as it does in the dialog, for
 * every Tab the editor leaves alone.
 */
function renderEditorInTrap(doc = "SELECT {metric/of_activities} * 2", extensions: Extension = []) {
    const { container, unmount } = render(
        <UiFocusTrap>
            <input id="before" aria-label="Metric ID" />
            <div id="editor" />
            <button id="after" type="button">
                Decimal (2)
            </button>
        </UiFocusTrap>,
    );

    const view = new EditorView({
        state: EditorState.create({
            doc,
            selection: { anchor: doc.length },
            extensions: [baseExtensions(), readOnlyExtension(false), extensions],
        }),
        parent: container.querySelector<HTMLElement>("#editor")!,
    });

    const cleanup = () => {
        view.destroy();
        unmount();
    };

    return { view, container, cleanup };
}

const pressTab = (element: HTMLElement, shiftKey = false) =>
    fireEvent.keyDown(element, { key: "Tab", code: "Tab", shiftKey });

describe("Tab in the formula editor", () => {
    it("moves the focus to the next control, and leaves the formula as typed", () => {
        const { view, container, cleanup } = renderEditorInTrap();

        view.contentDOM.focus();
        pressTab(view.contentDOM);

        expect(document.activeElement).toBe(container.querySelector("#after"));
        expect(view.state.doc.toString()).toBe("SELECT {metric/of_activities} * 2");

        cleanup();
    });

    it("moves the focus to the previous control on Shift+Tab", () => {
        const { view, container, cleanup } = renderEditorInTrap();

        view.contentDOM.focus();
        pressTab(view.contentDOM, true);

        expect(document.activeElement).toBe(container.querySelector("#before"));

        cleanup();
    });

    it("is reached by Tab from the previous control, at its place in the order", () => {
        const { view, container, cleanup } = renderEditorInTrap();
        const before = container.querySelector<HTMLElement>("#before")!;

        before.focus();
        pressTab(before);

        expect(document.activeElement).toBe(view.contentDOM);

        cleanup();
    });
});

describe("Tab in the formula editor with the suggestion list open", () => {
    const sum: CompletionItem = { label: "SUM", kind: CompletionItemKind.Function, detail: "SUM function" };
    const languageService = {
        doCompletion: async () => ({ isIncomplete: false, items: [sum] }),
        // documentation with a link, which renders a focusable element in the popup
        doCompletionResolve: async (item: CompletionItem) => ({
            ...item,
            documentation: "See [MAQL](https://www.gooddata.com/docs/).",
        }),
    } as unknown as MaqlLanguageService;

    const completion = maqlCompletion({ languageService, triggerCharacters: [], onList: () => undefined });

    async function renderWithOpenList() {
        const rendered = renderEditorInTrap("SELECT SU", completion);

        rendered.view.contentDOM.focus();
        startCompletion(rendered.view);
        await waitFor(() => expect(completionStatus(rendered.view.state)).toBe("active"));
        // the popup with its "Documentation" button is rendered, inside the editor and the trap, so
        // a Tab that stopped on it would show
        await waitFor(() =>
            expect(rendered.view.dom.querySelector(".cm-tooltip-autocomplete button")).not.toBeNull(),
        );

        return rendered;
    }

    it("closes the list and moves the focus to the next control on Tab, past the popup", async () => {
        const { view, container, cleanup } = await renderWithOpenList();

        pressTab(view.contentDOM);

        expect(document.activeElement).toBe(container.querySelector("#after"));
        await waitFor(() => expect(completionStatus(view.state)).toBeNull());
        expect(view.state.doc.toString()).toBe("SELECT SU");

        cleanup();
    });

    it("closes the list and moves the focus to the previous control on Shift+Tab", async () => {
        const { view, container, cleanup } = await renderWithOpenList();

        pressTab(view.contentDOM, true);

        expect(document.activeElement).toBe(container.querySelector("#before"));
        await waitFor(() => expect(completionStatus(view.state)).toBeNull());
        expect(view.state.doc.toString()).toBe("SELECT SU");

        cleanup();
    });

    it("keeps every control of the popup out of the Tab order", async () => {
        const { view, cleanup } = await renderWithOpenList();
        // with the documentation shown: its close button and the link of the documentation
        view.dispatch({ effects: setDocsVisible.of(true) });

        const popup = () => view.dom.querySelector<HTMLElement>(".cm-tooltip-autocomplete");
        await waitFor(() => expect(popup()?.querySelector("a[href]")).not.toBeNull());

        const focusables = popup()!.querySelectorAll<HTMLElement>("a[href], button, input, [tabindex]");
        expect(focusables.length).toBeGreaterThan(0);
        focusables.forEach((element) => expect(element.tabIndex).toBeLessThan(0));

        cleanup();
    });
});
