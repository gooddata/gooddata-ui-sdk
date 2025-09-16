// (C) 2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { ToastsCenterMessage } from "../toasts/ToastsCenterMessage.js";

const intlMessages = {
    "message.accessibility.dismiss.notification": "Dismiss notification",
};

describe("ToastsCenterMessage", () => {
    it("toggles show more/less and updates aria-expanded and content classes", async () => {
        const msg = {
            id: "id-1",
            createdAt: 1,
            type: "error" as const,
            text: "Header text",
            duration: 0,
            showMore: "Show details",
            showLess: "Hide details",
            errorDetail: "Detail content",
        };

        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <ToastsCenterMessage message={msg} onRemove={() => {}} />
            </IntlProvider>,
        );

        const toggle = screen.getByRole("button", { name: "Show details" });
        const content = document.querySelector(".s-message-text-content") as HTMLElement;
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(content.className).toMatch(/off/);
        expect(content).toHaveTextContent("Detail content");

        await userEvent.click(toggle);

        // Button text switches, aria-expanded toggles, and content class changes to on
        const toggleAfter = screen.getByRole("button", { name: "Hide details" });
        expect(toggleAfter).toHaveAttribute("aria-expanded", "true");
        const contentAfter = document.querySelector(".s-message-text-content") as HTMLElement;
        expect(contentAfter.className).toMatch(/on/);
    });

    it("renders custom component when provided and close triggers onRemove", async () => {
        const onRemove = vi.fn();
        function Custom() {
            return <div data-testid="custom-comp">Custom body</div>;
        }

        const msg = {
            id: "id-1",
            createdAt: 1,
            type: "success" as const,
            text: "Header text",
            duration: 0,
            component: Custom,
        };

        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <ToastsCenterMessage message={msg} onRemove={onRemove} />
            </IntlProvider>,
        );

        expect(screen.getByTestId("custom-comp")).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText("Dismiss notification"));
        expect(onRemove).toHaveBeenCalledTimes(1);
    });
});
