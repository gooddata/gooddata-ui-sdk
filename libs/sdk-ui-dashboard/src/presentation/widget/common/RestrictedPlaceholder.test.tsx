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
    it("reads as the error tile a missing visualization shows, with a lock", () => {
        const { container } = renderWithIntl(<RestrictedPlaceholderContent width={600} height={400} />);

        expect(screen.getByText("No access to this visualization")).toBeInTheDocument();
        expect(screen.getByText("Ask your administrator for access")).toBeInTheDocument();
        expect(container.querySelector(".info-label-icon.gd-icon-lock")).toBeInTheDocument();
        expect(container.querySelector(".gd-icon-warning")).not.toBeInTheDocument();
        expect(screen.getByTestId("restricted-placeholder")).toBeInTheDocument();
    });

    it.each([
        ["a tile with room", 600, 400],
        ["a short tile", 338, 100],
        ["a narrow tile, where the text wraps", 160, 160],
        ["a tile that has not been measured", undefined, undefined],
    ])("renders the same on %s, and keeps the text reachable", (_, width, height) => {
        const { container } = renderWithIntl(<RestrictedPlaceholderContent width={width} height={height} />);

        // one rendering at every size: the tile clips what does not fit, and the hover bubble carries
        // the whole message, so the same widget cannot read differently between two render modes
        expect(screen.getAllByText("No access to this visualization").length).toBeGreaterThan(0);
        expect(container.querySelector(".gd-bubble-trigger")).toBeInTheDocument();
        expect(container.querySelector<HTMLElement>(".info-label")!.style.height).toBe("");
        // it does not shrink on its own, so a narrow tile would carry its centred lock off-screen
        expect(container.querySelector<HTMLElement>(".gd-restricted-placeholder")!.style.width).toBe("100%");
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
