// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { ToastsCenterContext, useToastsCenterValue } from "../toasts/context.js";
import { ToastsCenter } from "../toasts/ToastsCenter.js";

const intlMessages = {
    "messages.accessibility.noMessages": "No messages",
    "messages.accessibility.partial.error": "{count} errors",
    "messages.accessibility.partial.warning": "{count} warnings",
    "messages.accessibility.partial.success": "{count} success",
    "messages.accessibility.partial.progress": "{count} in progress",
    "messages.accessibility.label": "There are {count} messages: {partial}",
    "message.accessibility.dismiss.notification": "Dismiss notification",
};

function ProviderHarness(props: { children?: ReactNode }) {
    const value = useToastsCenterValue();
    return <ToastsCenterContext value={value}>{props.children}</ToastsCenterContext>;
}

describe("ToastsCenter", () => {
    it("renders messages sorted by createdAt descending", async () => {
        let api!: ReturnType<typeof useToastsCenterValue>;
        function Capture() {
            api = ToastsCenterContext.useContextStore((c) => c);
            return null;
        }

        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <ProviderHarness>
                    <ToastsCenter />
                    <Capture />
                </ProviderHarness>
            </IntlProvider>,
        );

        api.addExistingMessages([
            { id: "a", text: "First", type: "success", createdAt: 1, duration: 0 },
            { id: "b", text: "Second", type: "success", createdAt: 2, duration: 0 },
        ]);

        const region = await screen.findByRole("region", { name: /There are 2 messages/ });
        // Inside region, the first header value should be "Second" (newest)
        const textNodes = Array.from(region.getElementsByClassName("s-message-text-header-value"));
        expect(textNodes[0]).toHaveTextContent("Second");
        expect(textNodes[1]).toHaveTextContent("First");
    });

    it("dismiss button removes message and updates aria label", async () => {
        let api!: ReturnType<typeof useToastsCenterValue>;
        function Capture() {
            api = ToastsCenterContext.useContextStore((c) => c);
            return null;
        }

        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <ProviderHarness>
                    <ToastsCenter />
                    <Capture />
                </ProviderHarness>
            </IntlProvider>,
        );

        api.addExistingMessage({ id: "x", text: "Close me", type: "success", createdAt: 1, duration: 0 });

        const region = await screen.findByRole("region", { name: /There are 1 messages/ });
        const closeBtn = within(region).getByLabelText("Dismiss notification");
        await userEvent.click(closeBtn);

        await waitFor(() => expect(region).toHaveAttribute("aria-label", "No messages"));
    });

    it("sr-only status announces the latest message", async () => {
        let api!: ReturnType<typeof useToastsCenterValue>;
        function Capture() {
            api = ToastsCenterContext.useContextStore((c) => c);
            return null;
        }

        const { container } = render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <ProviderHarness>
                    <ToastsCenter />
                    <Capture />
                </ProviderHarness>
            </IntlProvider>,
        );

        // Add first message
        api.addExistingMessage({ id: "a", text: "Alpha", type: "success", createdAt: 1, duration: 0 });

        // Wait a tick to ensure the first message effect has run
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Add second message - this should trigger the screen reader update
        api.addExistingMessage({ id: "b", text: "Beta", type: "success", createdAt: 2, duration: 0 });

        // Wait for the sr-only status to be updated with the latest message
        await waitFor(() => {
            const srOnly = container.querySelector(".sr-only[role='status']");
            expect(srOnly).not.toBeNull();
            expect(srOnly?.textContent).toContain("Beta");
        });
    });
});
