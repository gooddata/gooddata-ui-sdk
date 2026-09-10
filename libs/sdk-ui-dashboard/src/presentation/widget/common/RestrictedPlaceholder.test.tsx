// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import {
    RestrictedPlaceholder,
    RestrictedPlaceholderContent,
    RestrictedPlaceholderMessage,
    restrictedPlaceholderVariant,
} from "./RestrictedPlaceholder.js";

const messages = {
    "widget.error.restricted_insight.message": "No access to this visualization",
    "widget.error.restricted_insight.description": "Ask your administrator for access",
};

function renderWithIntl(component: ReactElement) {
    return render(
        <IntlProvider locale="en-US" messages={messages}>
            {component}
        </IntlProvider>,
    );
}

describe("restrictedPlaceholderVariant", () => {
    it("spells out the whole message on a tile with room for it", () => {
        expect(restrictedPlaceholderVariant(600, 400)).toBe("full");
    });

    it("keeps the headline on a tile too small for the description", () => {
        expect(restrictedPlaceholderVariant(338, 320)).toBe("medium");
    });

    it("falls back to the icon alone on a tile too small for any text", () => {
        expect(restrictedPlaceholderVariant(120, 90)).toBe("compact");
    });

    it("falls back to the icon alone before the tile has been measured", () => {
        expect(restrictedPlaceholderVariant(undefined, undefined)).toBe("compact");
    });
});

describe("RestrictedPlaceholderMessage", () => {
    it("shows headline and description in the full variant", () => {
        renderWithIntl(<RestrictedPlaceholderMessage variant="full" />);

        expect(screen.getByText("No access to this visualization")).toBeInTheDocument();
        expect(screen.getByText("Ask your administrator for access")).toBeInTheDocument();
    });

    it("drops the description in the medium variant", () => {
        renderWithIntl(<RestrictedPlaceholderMessage variant="medium" />);

        expect(screen.getByText("No access to this visualization")).toBeInTheDocument();
        expect(screen.queryByText("Ask your administrator for access")).not.toBeInTheDocument();
    });

    it("keeps the compact variant readable by assistive technology", () => {
        const { container } = renderWithIntl(<RestrictedPlaceholderMessage variant="compact" />);

        const srOnly = container.querySelector(".sr-only");
        expect(srOnly).toBeInTheDocument();
        expect(srOnly).toHaveTextContent("No access to this visualization");
        expect(srOnly).toHaveTextContent("Ask your administrator for access");
    });

    it("does not show the compact variant text as visible tile content", () => {
        const { container } = renderWithIntl(<RestrictedPlaceholderMessage variant="compact" />);

        const visible = container.querySelector(".info-label-icon");
        expect(visible).toBeInTheDocument();
        expect(visible).toBeEmptyDOMElement();
    });

    it("marks the tile with a lock rather than a warning", () => {
        const { container } = renderWithIntl(<RestrictedPlaceholderMessage variant="full" />);

        expect(container.querySelector(".gd-icon-lock")).toBeInTheDocument();
        expect(container.querySelector(".gd-icon-warning")).not.toBeInTheDocument();
    });
});

describe("RestrictedPlaceholder", () => {
    it("renders the content it is given inside the dashboard item", () => {
        function ConsumerContent() {
            return <div>consumer content</div>;
        }

        const { container } = renderWithIntl(
            <RestrictedPlaceholder
                screen="xl"
                dashboardItemClasses="s-dash-item-0"
                Content={ConsumerContent}
            />,
        );

        expect(container.querySelector(".dash-item")).toBeInTheDocument();
        expect(screen.getByText("consumer content")).toBeInTheDocument();
    });

    it("gives the content the positioned box its absolute container measures against", () => {
        function ConsumerContent() {
            return <div className="gd-visualization-content">consumer content</div>;
        }

        const { container } = renderWithIntl(
            <RestrictedPlaceholder
                screen="xl"
                dashboardItemClasses="s-dash-item-0"
                Content={ConsumerContent}
            />,
        );

        // .gd-visualization-content is absolutely positioned and sized to 100% of its containing
        // block; without this wrapper that block is the padded dash item, so the content ends up
        // taller than the tile and the dashboard grows a second scrollbar
        expect(container.querySelector(".visualization > .visualization-content")).toContainElement(
            container.querySelector(".gd-visualization-content"),
        );
    });

    it("renders the restriction inside a dashboard item", () => {
        const { container } = renderWithIntl(
            <RestrictedPlaceholder
                screen="xl"
                dashboardItemClasses="s-dash-item-0"
                Content={RestrictedPlaceholderContent}
            />,
        );

        expect(container.querySelector(".dash-item")).toBeInTheDocument();
        expect(container.querySelector(".info-label-icon")).toBeInTheDocument();
    });
});
