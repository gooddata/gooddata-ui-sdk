// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type RootState } from "../store/types.js";

import { Input } from "./Input.js";

const { focus } = vi.hoisted(() => {
    vi.resetModules();
    return { focus: vi.fn() };
});

const state = {
    chatWindow: { inputValue: "" },
    messages: { conversationsData: {}, conversationsLoaded: true, refocus: 0 },
} as unknown as RootState;

vi.mock("react-redux", () => ({
    useDispatch: () => vi.fn(),
    useSelector: (selector: (state: RootState) => unknown) => selector(state),
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    DefaultSyntaxHighlightingInput: function DefaultSyntaxHighlightingInput({
        onApi,
    }: {
        onApi: (api: unknown) => void;
    }) {
        useEffect(() => onApi({ focus }), [onApi]);
        return null;
    },
}));

vi.mock("./GenAIChatContextIndicator.js", () => ({
    GenAIChatContextIndicator: () => createPortal(<input aria-label="Search" />, document.body),
}));

vi.mock("./GenAiChatAgentSwitching.js", () => ({ GenAiChatAgentSwitching: () => null }));

describe("Input", () => {
    it("keeps focus in a portaled context dialog on mousedown", () => {
        render(
            <IntlProvider locale="en" messages={{}} onError={() => {}}>
                <Input />
            </IntlProvider>,
        );

        const notPrevented = fireEvent.mouseDown(screen.getByRole("textbox", { name: "Search" }));

        expect(notPrevented).toBe(true);
        expect(focus).not.toHaveBeenCalled();
    });
});
