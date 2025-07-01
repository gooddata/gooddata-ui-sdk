// (C) 2023-2025 GoodData Corporation
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OrientationDropdownControl, {
    IOrientationDropdownControl,
    getAxesByChartOrientation,
} from "../OrientationDropdownControl.js";
import { IVisualizationProperties, InternalIntlWrapper } from "../../../../internal/index.js";

describe("Test OrientationDropdownControl", () => {
    const defaultProperties: Partial<IVisualizationProperties> = {
        controls: {
            orientation: {
                position: "horizontal",
            },
            yaxis: {
                min: 0,
                max: 3000,
            },
        },
    };

    describe("Test getAxesByChartOrientation", () => {
        it("should return the correct X, Y axes when X axis is null", () => {
            const { xaxis, yaxis } = getAxesByChartOrientation({
                ...defaultProperties,
                controls: {
                    ...defaultProperties.controls,
                    orientation: {
                        position: "vertical",
                    },
                },
            });

            expect(yaxis.min).toBeUndefined();
            expect(yaxis.max).toBeUndefined();

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(3000);
        });

        it("should return the correct X, Y axes when Y axis is null", () => {
            const { xaxis, yaxis } = getAxesByChartOrientation({
                ...defaultProperties,
                controls: {
                    ...defaultProperties.controls,
                    orientation: {
                        position: "horizontal",
                    },
                    xaxis: {
                        min: 0,
                        max: 3000,
                    },
                    yaxis: undefined,
                },
            });

            expect(xaxis.min).toBeUndefined();
            expect(xaxis.max).toBeUndefined();

            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(3000);
        });

        it("should return the correct X, Y axes when both X, Y axes are null", () => {
            const { xaxis, yaxis } = getAxesByChartOrientation({
                ...defaultProperties,
                controls: {
                    ...defaultProperties.controls,
                    orientation: {
                        position: "horizontal",
                    },
                    xaxis: undefined,
                    yaxis: undefined,
                },
            });

            expect(xaxis).toBeUndefined();
            expect(yaxis).toBeUndefined();
        });

        it("should return the correct X, Y axes when the chart is horizontal and both X, Y axes are not null", () => {
            const { xaxis, yaxis } = getAxesByChartOrientation({
                ...defaultProperties,
                controls: {
                    ...defaultProperties.controls,
                    orientation: {
                        position: "horizontal",
                    },
                    xaxis: {
                        name: { position: "left" },
                        min: 0,
                        max: 3000,
                    },
                    yaxis: {
                        rotation: "90",
                    },
                },
            });

            expect(xaxis.rotation).toBe("90");
            expect(xaxis.name).toBeUndefined();
            expect(xaxis.min).toBeUndefined();
            expect(xaxis.max).toBeUndefined();

            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(3000);
            expect(yaxis.rotation).toBeUndefined();
            expect(yaxis.name).toEqual({ position: "top" });
        });

        it("should return the correct X, Y axes when the chart is vertical both X, Y axes are not null", () => {
            const { xaxis, yaxis } = getAxesByChartOrientation({
                ...defaultProperties,
                controls: {
                    ...defaultProperties.controls,
                    orientation: {
                        position: "vertical",
                    },
                    xaxis: {
                        rotation: "90",
                    },
                    yaxis: {
                        name: { position: "top" },
                        min: 0,
                        max: 3000,
                    },
                },
            });

            expect(xaxis.rotation).toBeUndefined();
            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(3000);
            expect(xaxis.name).toEqual({ position: "left" });

            expect(yaxis.min).toBeUndefined();
            expect(yaxis.max).toBeUndefined();
            expect(yaxis.rotation).toBe("90");
            expect(yaxis.name).toBeUndefined();
        });
    });

    describe("Test OrientationDropdownControl component", () => {
        const defaultProps: IOrientationDropdownControl = {
            disabled: false,
            properties: defaultProperties,
            pushData: () => {},
            value: "horizontal",
            showDisabledMessage: false,
        };

        function createComponent(customProps: Partial<IOrientationDropdownControl> = {}) {
            const props = { ...defaultProps, ...customProps };
            return render(
                <InternalIntlWrapper>
                    <OrientationDropdownControl {...props} />
                </InternalIntlWrapper>,
            );
        }

        it("should render the component with default props", () => {
            createComponent();

            expect(screen.getByRole("combobox")).toHaveClass("dropdown-button");
            expect(screen.getByText("Orientation")).toBeInTheDocument();
        });

        it("should disable the component when the disabled prop is true", () => {
            createComponent({
                ...defaultProps,
                disabled: true,
            });

            expect(screen.getByRole("combobox")).toHaveClass("disabled");
        });

        it("should trigger update the data when the value is changed", async () => {
            const pushData = vi.fn();
            createComponent({
                ...defaultProps,
                pushData,
            });
            await act(() => userEvent.click(screen.getByRole("combobox")));

            expect(screen.getByText("Vertical")).toBeInTheDocument();

            await act(() => userEvent.click(screen.getByText("Vertical")));

            expect(pushData).toHaveBeenCalledOnce();
        });
    });
});
