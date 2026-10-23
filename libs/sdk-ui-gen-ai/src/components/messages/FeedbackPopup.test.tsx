// (C) 2026 GoodData Corporation

import { useRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { GOODSTRAP_SCROLLED_EVENT } from "@gooddata/sdk-ui-kit";

import { FeedbackPopup } from "./FeedbackPopup.js";

function Chat() {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <>
            <div data-testid="chat">
                <div ref={containerRef}>
                    <FeedbackPopup containerRef={containerRef} anchor={() => <button>Dislike</button>} />
                </div>
            </div>
            <div data-testid="elsewhere" />
        </>
    );
}

function renderAndOpen() {
    render(
        <IntlProvider locale="en" onError={() => {}}>
            <Chat />
        </IntlProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Dislike" }));
}

const scroll = (testId: string) =>
    fireEvent(screen.getByTestId(testId), new CustomEvent(GOODSTRAP_SCROLLED_EVENT, { bubbles: true }));

describe("FeedbackPopup", () => {
    it("closes when the chat scrolls", () => {
        renderAndOpen();

        scroll("chat");

        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("stays open when something outside the chat scrolls", () => {
        renderAndOpen();

        scroll("elsewhere");

        expect(screen.queryByRole("dialog")).not.toBeNull();
    });
});
