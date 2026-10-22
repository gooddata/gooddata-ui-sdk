// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../localization/IntlWrapper.js";

import { type useEditModeLayoutNoteMessages as UseEditModeLayoutNoteMessages } from "./useEditModeLayoutNoteMessages.js";

const mockUseDashboardSelector = vi.fn<(selector: (state: unknown) => unknown) => unknown>();

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: (state: unknown) => unknown) => mockUseDashboardSelector(selector),
}));

type HappyDomWindow = Window & {
    happyDOM?: { setViewport(viewport: { width: number; height: number }): void };
};

const setViewportWidth = (width: number) => {
    (window as HappyDomWindow).happyDOM?.setViewport({ width, height: 900 });
};

const setRenderMode = (renderMode: "edit" | "view") => {
    mockUseDashboardSelector.mockImplementation((selector) => selector({ renderMode: { renderMode } }));
};

const wrapper = ({ children }: { children: ReactNode }) => <IntlWrapper>{children}</IntlWrapper>;

describe("useEditModeLayoutNoteMessages", () => {
    const initialWidth = window.innerWidth;
    let useHook: typeof UseEditModeLayoutNoteMessages;

    beforeEach(async () => {
        // a fresh module per test, the dismissal is kept in module scope for the whole session
        vi.resetModules();
        ({ useEditModeLayoutNoteMessages: useHook } = await import("./useEditModeLayoutNoteMessages.js"));
        setRenderMode("edit");
    });

    afterEach(() => {
        setViewportWidth(initialWidth);
    });

    it("shows a persistent note with a bold lead-in in edit mode in a window up to 1170px wide", () => {
        setViewportWidth(1170);

        const { result } = renderHook(() => useHook(), { wrapper });

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0]).toMatchObject({ type: "progress", duration: Infinity });
        const { container } = render(<>{result.current.messages[0].node}</>);
        expect(container.querySelector("b")).toHaveTextContent("Note:");
        expect(container).toHaveTextContent(
            "Note: Your screen is narrower than edit mode. To see all of the dashboard, scroll horizontally. View mode fits any screen.",
        );
    });

    it("shows no note in a wider window", () => {
        setViewportWidth(1171);

        const { result } = renderHook(() => useHook(), { wrapper });

        expect(result.current.messages).toEqual([]);
    });

    it("shows no note in view mode", () => {
        setViewportWidth(1000);
        setRenderMode("view");

        const { result } = renderHook(() => useHook(), { wrapper });

        expect(result.current.messages).toEqual([]);
    });

    it("keeps the note dismissed for the rest of the session", () => {
        setViewportWidth(1000);
        const { result } = renderHook(() => useHook(), { wrapper });

        act(() => result.current.removeMessage(result.current.messages[0].id));

        expect(result.current.messages).toEqual([]);
        const { result: remounted } = renderHook(() => useHook(), { wrapper });
        expect(remounted.current.messages).toEqual([]);
    });

    it("does not treat the removal of a note that no longer applies as a dismissal", () => {
        setViewportWidth(1000);
        const { result, rerender } = renderHook(() => useHook(), { wrapper });
        const id = result.current.messages[0].id;

        setRenderMode("view");
        rerender();
        act(() => result.current.removeMessage(id));
        setRenderMode("edit");
        rerender();

        expect(result.current.messages).toHaveLength(1);
    });
});
