// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { WidgetNotice } from "../WidgetNotice.js";

const messages = {
    close: "Close",
};

const renderWithIntl = (ui: ReactNode) =>
    render(
        <IntlProvider locale="en-US" messages={messages}>
            {ui}
        </IntlProvider>,
    );

describe("WidgetNotice", () => {
    it("renders message, inline action and close button", async () => {
        const onClose = vi.fn();
        renderWithIntl(
            <WidgetNotice
                type="warning"
                message="Partial results only."
                action={<button type="button">Action</button>}
                onClose={onClose}
            />,
        );

        expect(screen.getByText("Partial results only.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("toggles expandable details", async () => {
        renderWithIntl(
            <WidgetNotice
                message="Partial results only."
                detail="The result exceeds the 60K row limit."
                expandLabel="Show details"
                collapseLabel="Hide details"
            />,
        );

        expect(screen.queryByText("The result exceeds the 60K row limit.")).not.toBeInTheDocument();

        const toggle = screen.getByRole("button", { name: "Show details" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");

        await userEvent.click(toggle);

        expect(screen.getByText("The result exceeds the 60K row limit.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Hide details" })).toHaveAttribute("aria-expanded", "true");
    });

    it("renders details expanded by default with detail action", () => {
        renderWithIntl(
            <WidgetNotice
                message="Partial results only."
                detail="The result exceeds the 60K row limit."
                detailAction={<a href="#export">Export full result as Raw (.csv)</a>}
                expandLabel="Show details"
                collapseLabel="Hide details"
                defaultExpanded
            />,
        );

        expect(screen.getByText("The result exceeds the 60K row limit.")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Export full result as Raw (.csv)" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Hide details" })).toHaveAttribute("aria-expanded", "true");
    });

    it("forwards data test id", () => {
        renderWithIntl(<WidgetNotice message="Partial results only." dataTestId="widget-notice" />);

        expect(screen.getByTestId("widget-notice")).toBeInTheDocument();
    });
});
