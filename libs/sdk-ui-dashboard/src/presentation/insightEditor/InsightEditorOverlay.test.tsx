// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { insightEditorOpened } from "../../model/events/insightEditor.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../model/react/useDashboardEventDispatch.js";
import { selectEnableInsightEditing } from "../../model/store/config/configSelectors.js";
import { uiActions } from "../../model/store/ui/index.js";
import { selectInsightEditorTarget } from "../../model/store/ui/uiSelectors.js";
import { type InsightEditorTarget } from "../../model/types/insightEditorTypes.js";

import { InsightEditorOverlay } from "./InsightEditorOverlay.js";

vi.mock("../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardDispatch: vi.fn<() => unknown>(),
    useDashboardSelector: vi.fn<() => unknown>(),
}));
vi.mock("../../model/react/useDashboardEventDispatch.js", () => ({
    useDashboardEventDispatch: vi.fn<() => unknown>(),
}));
vi.mock("./useInsightEditorSession.js", () => ({
    useInsightEditorSession: () => ({ cancel: vi.fn<() => void>(), save: vi.fn<() => Promise<void>>() }),
}));
vi.mock("./InsightEditorContent.js", () => ({
    InsightEditorContent: () => <div>editor content</div>,
}));
let isMobile = false;
vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useMediaQuery: () => isMobile,
}));

const TARGET: InsightEditorTarget = { type: "new" };
const openedType = insightEditorOpened(TARGET).type;

let dispatch: Mock<(action: unknown) => unknown>;
let eventDispatch: Mock<(event: unknown) => void>;

const editor = () => document.querySelector(".s-edit-insight-overlay-content");

function renderOverlay() {
    const ui = () => (
        <IntlProvider locale="en-US" messages={{}} onError={() => {}}>
            <InsightEditorOverlay />
        </IntlProvider>
    );
    const result = render(ui());
    return { rerender: () => result.rerender(ui()), unmount: result.unmount };
}

describe("InsightEditorOverlay", () => {
    beforeEach(() => {
        isMobile = false;
        dispatch = vi.fn<(action: unknown) => unknown>();
        eventDispatch = vi.fn<(event: unknown) => void>();
        vi.mocked(useDashboardDispatch).mockReturnValue(
            dispatch as unknown as ReturnType<typeof useDashboardDispatch>,
        );
        vi.mocked(useDashboardEventDispatch).mockReturnValue(eventDispatch);
        vi.mocked(useDashboardSelector).mockImplementation((selector: unknown) => {
            if (selector === selectEnableInsightEditing) return true;
            if (selector === selectInsightEditorTarget) return TARGET;
            throw new Error("unexpected selector");
        });
    });

    it("keeps the open editor when the screen crosses the mobile breakpoint", () => {
        const { rerender } = renderOverlay();
        expect(editor()).not.toBeNull();

        isMobile = true;
        rerender();
        expect(editor()).not.toBeNull();
        isMobile = false;
        rerender();

        expect(editor()).not.toBeNull();
        const opened = eventDispatch.mock.calls.filter(([e]) => (e as { type: string }).type === openedType);
        expect(opened).toHaveLength(1);
        expect(dispatch).not.toHaveBeenCalledWith(uiActions.closeInsightEditor());
    });

    it("moves the focus into the editor and returns it when the editor closes", () => {
        const trigger = document.createElement("button");
        document.body.appendChild(trigger);
        trigger.focus();

        const { unmount } = renderOverlay();
        expect(document.activeElement).toBe(editor());

        unmount();
        expect(document.activeElement).toBe(trigger);
        trigger.remove();
    });

    it("does not open the editor on a mobile screen", () => {
        isMobile = true;
        renderOverlay();

        expect(editor()).toBeNull();
        expect(dispatch).toHaveBeenCalledWith(uiActions.closeInsightEditor());
    });
});
