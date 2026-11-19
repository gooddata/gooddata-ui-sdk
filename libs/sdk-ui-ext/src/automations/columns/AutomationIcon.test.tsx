// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { InternalIntlWrapper } from "../../internal/utils/internalIntlProvider.js";

import { AutomationIcon } from "./AutomationIcon.js";

const automation = {
    id: "a1",
    type: "automation",
    title: "Weekly export",
    created: "2026-01-01 10:00",
    schedule: { cron: "0 0 * * *" },
    lastRun: { status: "FAILED", errorMessage: "Boom", traceId: "trace-1" },
} as unknown as IAutomationMetadataObject;

const wrapper = ({ children }: { children?: ReactNode }) => (
    <InternalIntlWrapper>
        <ToastsCenterContextProvider skipAutomaticMessageRendering>{children}</ToastsCenterContextProvider>
    </InternalIntlWrapper>
);

describe("AutomationIcon tooltip trigger", () => {
    it("renders the details trigger as a named button with a decorative icon", () => {
        const { container } = render(
            <AutomationIcon type="automationDetails" automation={automation} timezone="UTC" />,
            { wrapper },
        );

        const trigger = screen.getByRole("button", { name: "Show details" });
        expect(trigger.tagName).toBe("BUTTON");
        expect(trigger.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
        expect(container.querySelectorAll("button")).toHaveLength(1);
    });

    it("renders the failed trigger as a named button", () => {
        render(<AutomationIcon type="FAILED" automation={automation} />, { wrapper });

        expect(screen.getByRole("button", { name: "Show failure details" })).toBeInTheDocument();
    });

    it("does not add a hidden focusable copy of the tooltip actions for screen readers", async () => {
        render(<AutomationIcon type="FAILED" automation={automation} />, { wrapper });

        await act(async () => {
            screen.getByRole("button", { name: "Show failure details" }).focus();
        });
        fireEvent.focus(screen.getByRole("button", { name: "Show failure details" }));
        await screen.findAllByText("Boom");

        const screenReaderCopy = document.querySelector(".sr-only");
        expect(screenReaderCopy).toHaveTextContent("Boom");
        expect(screenReaderCopy?.querySelectorAll("button, [tabindex]")).toHaveLength(0);
    });

    it("opens the tooltip content when the trigger receives keyboard focus", async () => {
        render(<AutomationIcon type="automationDetails" automation={automation} timezone="UTC" />, {
            wrapper,
        });

        expect(screen.queryByText("Weekly export")).not.toBeInTheDocument();

        await act(async () => {
            screen.getByRole("button", { name: "Show details" }).focus();
        });
        fireEvent.focus(screen.getByRole("button", { name: "Show details" }));

        expect((await screen.findAllByText("Weekly export")).length).toBeGreaterThan(0);
    });
});
