// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// UiTag transitively pulls the legacy Bubble stack via UiTooltip — mock it to
// keep this unit test focused on row composition. The tag is exercised
// visually in Storybook.
vi.mock("../../UiTooltip/UiTooltip.js", () => ({
    UiTooltip: ({ anchor }: { anchor: React.ReactNode }) => <>{anchor}</>,
}));

import { UiGranteeRow } from "../UiGranteeRow.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiGranteeRow", () => {
    it("renders the name", () => {
        renderWithIntl(<UiGranteeRow kind="user" name="Marek Stránský" />);
        expect(screen.getByText("Marek Stránský")).toBeInTheDocument();
    });

    it("renders the email subline when provided", () => {
        renderWithIntl(<UiGranteeRow kind="user" name="Marek" email="marek@example.com" />);
        expect(screen.getByText("marek@example.com")).toBeInTheDocument();
    });

    it("omits the email subline when not provided", () => {
        renderWithIntl(<UiGranteeRow kind="group" name="Admin" />);
        expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    });

    it("renders the Owner tag when isOwner is true", () => {
        renderWithIntl(<UiGranteeRow kind="user" name="Marek" isOwner />);
        expect(screen.getByText("Owner")).toBeInTheDocument();
    });

    it("renders the avatar as decorative (hidden from assistive tech)", () => {
        const { container } = renderWithIntl(<UiGranteeRow kind="group" name="Admin" />);
        // Inside a row the visible name is the accessible name; the avatar must not
        // duplicate that for SR users.
        expect(screen.queryByRole("img", { name: "User group" })).not.toBeInTheDocument();
        const avatar = container.querySelector(".gd-ui-kit-avatar");
        expect(avatar).toBeInTheDocument();
        expect(avatar!.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    it("renders the controls slot", () => {
        renderWithIntl(<UiGranteeRow kind="user" name="Marek" controls={<button>action</button>} />);
        expect(screen.getByRole("button", { name: "action" })).toBeInTheDocument();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiGranteeRow kind="user" name="X" dataTestId="row-1" />);
        expect(screen.getByTestId("row-1")).toBeInTheDocument();
    });
});
