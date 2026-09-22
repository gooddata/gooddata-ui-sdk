// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { RestrictedPlaceholder, RestrictedPlaceholderContent } from "./RestrictedPlaceholder.js";

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

describe("RestrictedPlaceholderContent", () => {
    it("gives the reason and the way out of it, under a lock", () => {
        const { container } = renderWithIntl(<RestrictedPlaceholderContent width={600} height={400} />);

        expect(screen.getByText("No access to this visualization")).toBeInTheDocument();
        expect(screen.getByText("Ask your administrator for access")).toBeInTheDocument();
        expect(container.querySelector(".gd-ui-kit-restricted-placeholder")).toBeInTheDocument();
        expect(screen.getByTestId("restricted-placeholder")).toBeInTheDocument();
    });

    it("keeps the reason alone on a tile too narrow for the rest", () => {
        const { container } = renderWithIntl(<RestrictedPlaceholderContent width={240} height={400} />);

        expect(
            container.querySelector(".gd-ui-kit-restricted-placeholder--size-compact"),
        ).toBeInTheDocument();
        expect(screen.getByText("No access to this visualization")).toBeInTheDocument();
        expect(screen.getByText("Ask your administrator for access")).toHaveClass("sr-only");
    });

    it.each([
        ["view mode, which gives the tile its full height", 453, 220],
        ["edit mode, where the same tile is ten pixels shorter", 453, 210],
    ])("reads the same in %s, because only the width decides", (_, width, height) => {
        const { container } = renderWithIntl(<RestrictedPlaceholderContent width={width} height={height} />);

        expect(
            container.querySelector(".gd-ui-kit-restricted-placeholder--size-default"),
        ).toBeInTheDocument();
    });

    it("keeps the recovery guidance in the accessible content at the smallest size", () => {
        const { container } = renderWithIntl(<RestrictedPlaceholderContent width={160} height={160} />);

        expect(screen.getByRole("status")).toHaveTextContent("Ask your administrator for access");
        expect(container.querySelector("[tabindex='0']")).toBeInTheDocument();
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
        expect(container.querySelector(".gd-ui-kit-restricted-placeholder")).toBeInTheDocument();
    });
});
