// (C) 2025 GoodData Corporation
import React from "react";

import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { NonContextToastsInterop } from "../toasts/NonContextToastsInterop.js";

const intlMessages = {
    "messages.accessibility.noMessages": "No messages",
    "messages.accessibility.partial.error": "{count} errors",
    "messages.accessibility.partial.warning": "{count} warnings",
    "messages.accessibility.partial.success": "{count} success",
    "messages.accessibility.partial.progress": "{count} in progress",
    "messages.accessibility.label": "There are {count} messages: {partial}",
    "message.accessibility.dismiss.notification": "Dismiss notification",
};

describe("NonContextToastsInterop", () => {
    it("creates provider when missing and syncs add/remove/replace with onDismiss forwarding", async () => {
        const onDismiss = vi.fn();

        const { rerender } = render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <NonContextToastsInterop messages={[]} onDismissMessage={onDismiss} />
            </IntlProvider>,
        );

        // Add two messages via prop change (new references)
        rerender(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <NonContextToastsInterop
                    messages={[
                        { id: "a", text: "A", type: "success", createdAt: 1, duration: 0 },
                        { id: "b", text: "B", type: "error", createdAt: 2, duration: 0 },
                    ]}
                    onDismissMessage={onDismiss}
                />
            </IntlProvider>,
        );

        const region = await screen.findByRole("region", { name: /There are 2 messages/ });
        const headers = Array.from(region.getElementsByClassName("s-message-text-header-value"));
        // Sorted newest first
        expect(headers[0]).toHaveTextContent("B");
        expect(headers[1]).toHaveTextContent("A");

        // Replace one message (same id, new object) and remove the other
        rerender(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <NonContextToastsInterop
                    messages={[{ id: "b", text: "Bee2", type: "error", createdAt: 3, duration: 0 }]}
                    onDismissMessage={onDismiss}
                />
            </IntlProvider>,
        );

        await waitFor(
            () => expect(screen.getByRole("region", { name: /There are 1 messages/ })).toBeInTheDocument(),
            { timeout: 3000 },
        );
        expect(within(screen.getByRole("region")).getByText("Bee2")).toBeInTheDocument();

        // Dismiss via UI and expect onDismiss called with id
        const closeBtn = within(screen.getByRole("region")).getByLabelText("Dismiss notification");
        await userEvent.click(closeBtn);
        await waitFor(() => expect(onDismiss).toHaveBeenCalledWith("b"), { timeout: 3000 });
    });
});
