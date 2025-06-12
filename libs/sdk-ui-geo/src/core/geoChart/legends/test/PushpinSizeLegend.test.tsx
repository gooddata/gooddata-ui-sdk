// (C) 2020-2023 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import PushpinSizeLegend, { IPushpinSizeLegendProps } from "../PushpinSizeLegend.js";
import { describe, it, expect } from "vitest";

function createComponent(customProps: IPushpinSizeLegendProps) {
    const legendProps = {
        ...customProps,
    };
    return render(<PushpinSizeLegend {...legendProps} />);
}

const componentSelector = ".s-pushpin-size-legend";

describe("PushpinSizeLegend", () => {
    it("should render component with max, average and min value", () => {
        const sizes: number[] = [10, 6, 4, 5, 20, 20, 4];
        const props = {
            sizes,
            format: "#,##0.00",
            numericSymbols: ["k", "M", "G", "T", "P", "E"],
            measureName: "population",
            isSmall: false,
            showMiddleCircle: true,
        };
        createComponent(props);

        expect(document.querySelector(componentSelector)).toBeInTheDocument();
        expect(screen.queryByText("population:")).toBeInTheDocument();
        expect(screen.queryByText("4")).toBeInTheDocument();
        expect(screen.queryByText("10")).toBeInTheDocument();
        expect(screen.queryByText("20")).toBeInTheDocument();
    });

    it("should not render component when Size contains all null values", () => {
        const sizes: Array<number | null> = [null, null, null];
        const props = {
            sizes,
            format: "#,##0.00",
            numericSymbols: ["k", "M", "G", "T", "P", "E"],
            measureName: "population",
            isSmall: false,
            showMiddleCircle: true,
        };
        createComponent(props);
        expect(document.querySelector(componentSelector)).not.toBeInTheDocument();
    });

    it("should not render component when min value is equal to max value", () => {
        const sizes: number[] = [1000, 1000, 1000];
        const props = {
            sizes,
            format: "#,##0.00",
            numericSymbols: ["k", "M", "G", "T", "P", "E"],
            measureName: "population",
            isSmall: false,
            showMiddleCircle: true,
        };
        createComponent(props);
        expect(document.querySelector(componentSelector)).not.toBeInTheDocument();
    });

    it("should not render middle circle if showMiddleCircle is false regardless of isSmall", () => {
        const sizes: number[] = [10, 6, 4, 5, 20, 20, 4];
        const props = {
            sizes,
            format: "#,##0.00",
            numericSymbols: ["k", "M", "G", "T", "P", "E"],
            measureName: "population",
            isSmall: true,
            showMiddleCircle: false,
        };
        createComponent(props);
        expect(screen.queryByText("4")).toBeInTheDocument();
        expect(screen.queryByText("10")).not.toBeInTheDocument();
        expect(screen.queryByText("20")).toBeInTheDocument();
    });

    it("should render middle circle if showMiddleCircle is true regardless of isSmall", () => {
        const sizes: number[] = [10, 6, 4, 5, 20, 20, 4];
        const props = {
            sizes,
            format: "#,##0.00",
            numericSymbols: ["k", "M", "G", "T", "P", "E"],
            measureName: "population",
            isSmall: true,
            showMiddleCircle: true,
        };
        createComponent(props);
        expect(screen.queryByText("4")).toBeInTheDocument();
        expect(screen.queryByText("10")).toBeInTheDocument();
        expect(screen.queryByText("20")).toBeInTheDocument();
    });
});
