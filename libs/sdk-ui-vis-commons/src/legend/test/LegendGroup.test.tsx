// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { LegendGroup } from "../LegendGroup.js";
import { ILegendGroup, LEGEND_GROUP } from "../types.js";

describe("LegendGroup", () => {
    const defaultLegendGroup: ILegendGroup = {
        type: LEGEND_GROUP,
        labelKey: "left",
        data: [],
        items: [],
    };

    const renderLegendGroup = (props: { item: ILegendGroup; width?: number; children?: ReactNode }) => {
        const Component = withIntl(LegendGroup);
        return render(<Component {...props} />);
    };

    it("should render legend group with basic structure", () => {
        renderLegendGroup({
            item: defaultLegendGroup,
            children: <div data-testid="child-content">Child content</div>,
        });

        expect(screen.getByRole("group")).toBeInTheDocument();
        expect(screen.getByTestId("legend-axis-indicator")).toBeInTheDocument();
        expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("should apply correct CSS classes", () => {
        renderLegendGroup({
            item: defaultLegendGroup,
            children: <div>Child</div>,
        });

        const group = screen.getByRole("group");
        expect(group).toHaveClass("legend-group");

        const indicator = screen.getByTestId("legend-axis-indicator");
        expect(indicator).toHaveClass("series-axis-indicator");
    });

    it("should set aria-labelledby attribute correctly", () => {
        renderLegendGroup({
            item: defaultLegendGroup,
            children: <div>Child</div>,
        });

        const group = screen.getByRole("group");
        const labelId = group.getAttribute("aria-labelledby");

        expect(labelId).toBeTruthy();
        expect(labelId).toMatch(/^legend-group-label-/);

        const labelElement = screen.getByTestId("legend-axis-indicator");
        expect(labelElement).toHaveAttribute("id", labelId);
    });

    it("should apply width style when width prop is provided", () => {
        const width = 300;
        renderLegendGroup({
            item: defaultLegendGroup,
            width,
            children: <div>Child</div>,
        });

        const indicator = screen.getByTestId("legend-axis-indicator");
        expect(indicator).toHaveStyle({ width: "300px" });
    });

    it("should not apply width style when width prop is not provided", () => {
        renderLegendGroup({
            item: defaultLegendGroup,
            children: <div>Child</div>,
        });

        const indicator = screen.getByTestId("legend-axis-indicator");
        expect(indicator.style.width).toBe("");
    });

    it("should render label text with colon", () => {
        const legendGroup: ILegendGroup = {
            ...defaultLegendGroup,
            labelKey: "left",
        };

        renderLegendGroup({
            item: legendGroup,
            children: <div>Child</div>,
        });

        const seriesText = screen.getByText(/Left:/);
        expect(seriesText).toBeInTheDocument();
    });

    it("should render different label keys correctly", () => {
        const testCases = [
            { labelKey: "top", expectedText: /Top:/ },
            { labelKey: "bottom", expectedText: /Bottom:/ },
            { labelKey: "right", expectedText: /Right:/ },
            { labelKey: "left", expectedText: /Left:/ },
        ];

        testCases.forEach(({ labelKey, expectedText }) => {
            const { unmount } = renderLegendGroup({
                item: { ...defaultLegendGroup, labelKey },
                children: <div>Child</div>,
            });

            expect(screen.getByText(expectedText)).toBeInTheDocument();
            unmount();
        });
    });

    it("should handle data array for message interpolation", () => {
        const legendGroup: ILegendGroup = {
            ...defaultLegendGroup,
            labelKey: "combo",
            data: ["left", "right"],
        };

        renderLegendGroup({
            item: legendGroup,
            children: <div>Child</div>,
        });

        // The component should render the combo message with interpolated values
        // Based on the test output, it shows "Left (Right):" format
        const seriesText = screen.getByText(/Left \(Right\):/);
        expect(seriesText).toBeInTheDocument();
    });

    it("should handle empty data array", () => {
        const legendGroup: ILegendGroup = {
            ...defaultLegendGroup,
            labelKey: "area",
            data: [],
        };

        renderLegendGroup({
            item: legendGroup,
            children: <div>Child</div>,
        });

        const seriesText = screen.getByText(/Area:/);
        expect(seriesText).toBeInTheDocument();
    });

    it("should handle undefined data", () => {
        const legendGroup: ILegendGroup = {
            ...defaultLegendGroup,
            labelKey: "line",
            data: undefined,
        };

        renderLegendGroup({
            item: legendGroup,
            children: <div>Child</div>,
        });

        const seriesText = screen.getByText(/Line:/);
        expect(seriesText).toBeInTheDocument();
    });

    it("should render children content", () => {
        const childContent = (
            <div>
                <span data-testid="child-1">Child 1</span>
                <span data-testid="child-2">Child 2</span>
            </div>
        );

        renderLegendGroup({
            item: defaultLegendGroup,
            children: childContent,
        });

        expect(screen.getByTestId("child-1")).toBeInTheDocument();
        expect(screen.getByTestId("child-2")).toBeInTheDocument();
    });

    it("should handle complex children with multiple elements", () => {
        const complexChildren = (
            <>
                <div data-testid="legend-item-1">Legend Item 1</div>
                <div data-testid="legend-item-2">Legend Item 2</div>
                <div data-testid="legend-item-3">Legend Item 3</div>
            </>
        );

        renderLegendGroup({
            item: defaultLegendGroup,
            children: complexChildren,
        });

        expect(screen.getByTestId("legend-item-1")).toBeInTheDocument();
        expect(screen.getByTestId("legend-item-2")).toBeInTheDocument();
        expect(screen.getByTestId("legend-item-3")).toBeInTheDocument();
    });

    it("should maintain accessibility structure", () => {
        renderLegendGroup({
            item: defaultLegendGroup,
            children: <div>Child</div>,
        });

        const group = screen.getByRole("group");
        const labelId = group.getAttribute("aria-labelledby");
        const labelElement = document.getElementById(labelId!);

        expect(group).toHaveAttribute("role", "group");
        expect(labelElement).toBeInTheDocument();
        expect(labelElement).toHaveClass("series-axis-indicator");
    });
});
