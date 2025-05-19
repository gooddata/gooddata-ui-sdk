// (C) 2007-2025 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import LegendItem from "../LegendItem.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LegendSeriesContextStore } from "../context.js";
import { ISeriesItem } from "../types.js";

describe("LegendItem", () => {
    const item: ISeriesItem = {
        name: "Foo",
        color: "red",
        isVisible: true,
    };

    const mockContextValue = {
        focusedItem: undefined,
        makeItemId: (item: ISeriesItem) => `test-id-${item?.name}`,
        descriptionId: "test-description-id",
    };

    let onItemClick: jest.Mock;

    beforeEach(() => {
        onItemClick = vi.fn();
    });

    function createComponent(props: any = {}, contextValue = mockContextValue) {
        return render(
            <LegendSeriesContextStore value={contextValue}>
                <LegendItem onItemClick={onItemClick} {...props} />
            </LegendSeriesContextStore>,
        );
    }

    it("should render item", () => {
        const props = {
            item,
            chartType: "bar",
        };
        createComponent(props);
        const legendItem = screen.getByText("Foo");

        expect(legendItem).toBeInTheDocument();
        fireEvent.click(legendItem);
        expect(onItemClick).toHaveBeenCalledWith(item);
    });

    it.each([
        ["enable", true, "50%"],
        ["enable", false, "0px"],
    ])(
        "should %s border radius for %s chart with itemType=%s",
        (_des: string, enableBorderRadius: boolean, expected: string) => {
            const props = {
                item: {
                    ...item,
                },
                enableBorderRadius,
            };
            createComponent(props);

            expect(screen.getByTestId("legend-item").firstChild).toHaveStyle({
                backgroundColor: "red",
                borderRadius: expected,
            });
        },
    );

    it("should apply width style when width prop is provided", () => {
        const props = {
            item,
            width: 200,
        };
        createComponent(props);

        expect(screen.getByTestId("legend-item")).toHaveStyle({
            width: "200px",
        });
    });

    it("should render item with correct accessibility attributes", () => {
        const props = {
            item,
        };
        createComponent(props);

        const legendItem = screen.getByTestId("legend-item");
        expect(legendItem).toHaveAttribute("role", "switch");
        expect(legendItem).toHaveAttribute("aria-describedby", "test-description-id");
        expect(legendItem).toHaveAttribute("aria-checked", "true");
        expect(legendItem).toHaveAttribute("id", "test-id-Foo");
    });

    it("should apply focused style when item is focused", () => {
        const focusedContextValue = {
            ...mockContextValue,
            focusedItem: item,
        };
        const props = {
            item,
        };
        createComponent(props, focusedContextValue);

        expect(screen.getByTestId("legend-item")).toHaveClass("series-item--isFocused");
    });
});
