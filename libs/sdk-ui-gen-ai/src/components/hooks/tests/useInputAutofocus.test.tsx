// (C) 2026 GoodData Corporation

import { type EditorView } from "@codemirror/view";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type RootState } from "../../../store/types.js";
import { useInputAutofocus } from "../useInputAutofocus.js";

let conversationLocalId: string | undefined;

vi.mock("react-redux", () => ({
    useSelector: (selector: (state: RootState) => unknown) =>
        selector({
            messages: {
                currentConversation: conversationLocalId ? { localId: conversationLocalId } : undefined,
            },
        } as unknown as RootState),
}));

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function mountEditor() {
    const contentDOM = document.createElement("div");
    contentDOM.tabIndex = 0;
    document.body.appendChild(contentDOM);

    return { contentDOM, editorApi: { contentDOM } as unknown as EditorView };
}

function TestInput({ editorApi }: { editorApi: EditorView }) {
    const ref = useInputAutofocus(editorApi, true, { isBusy: false });

    return <div {...ref} />;
}

afterEach(() => {
    document.body.innerHTML = "";
});

describe("useInputAutofocus", () => {
    it("focuses the editor when the chat lands in another conversation", async () => {
        conversationLocalId = "conversation-1";
        const { contentDOM, editorApi } = mountEditor();
        const { rerender } = render(<TestInput editorApi={editorApi} />);
        await nextFrame();

        const elsewhere = document.createElement("button");
        document.body.appendChild(elsewhere);
        elsewhere.focus();

        conversationLocalId = "conversation-2";
        rerender(<TestInput editorApi={editorApi} />);
        await nextFrame();

        expect(contentDOM).toHaveFocus();
    });

    it("leaves focus alone while the conversation stays the same", async () => {
        conversationLocalId = "conversation-1";
        const { editorApi } = mountEditor();
        const { rerender } = render(<TestInput editorApi={editorApi} />);
        await nextFrame();

        const elsewhere = document.createElement("button");
        document.body.appendChild(elsewhere);
        elsewhere.focus();

        rerender(<TestInput editorApi={editorApi} />);
        await nextFrame();

        expect(elsewhere).toHaveFocus();
    });
});
