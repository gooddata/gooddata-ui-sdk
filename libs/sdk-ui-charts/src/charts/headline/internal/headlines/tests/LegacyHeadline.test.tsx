// (C) 2007-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IHeadlineVisualizationProps, LegacyHeadline } from "../LegacyHeadline.js";

describe("LegacyHeadline", () => {
    function createComponent(props: Omit<IHeadlineVisualizationProps, "data"> & { data: any }) {
        return render(<LegacyHeadline {...(props as IHeadlineVisualizationProps)} />);
    }

    it("should call after render callback on componentDidMount", () => {
        const onAfterRender = vi.fn();
        vi.useFakeTimers();
        createComponent({
            onAfterRender,
            data: {
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Some metric",
                    value: "42",
                },
            },
        });
        vi.runAllTimers();
        vi.useRealTimers();
        expect(onAfterRender).toHaveBeenCalledTimes(1);
    });

    describe("with primary value", () => {
        it("should not produce any event upon click when fire handler but primary value is not drillable", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "42",
                    },
                },
            });

            fireEvent.click(screen.getByText("42"));

            expect(onDrill).toHaveBeenCalledTimes(0);
        });

        it("should produce correct event upon click when fire handler is set and primary value is drillable", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "42",
                        isDrillable: true,
                    },
                },
            });

            const element = screen.getByText("42");
            fireEvent.click(element, { target: "test" });

            expect(onDrill).toHaveBeenCalledWith(
                {
                    localIdentifier: "m1",
                    value: "42",
                    element: "primaryValue",
                },
                expect.anything(),
            );
        });

        it("should render headline item link with underline style when is drillable", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "42",
                        isDrillable: true,
                    },
                },
            });

            expect(document.querySelector(".headline-link-style-underline")).toBeInTheDocument();
        });

        it("should not render headline item link with underline style when is drillable and disableDrillUnderline is true", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "42",
                        isDrillable: true,
                    },
                },
                disableDrillUnderline: true,
            });

            expect(document.querySelector(".headline-link-style-underline")).not.toBeInTheDocument();
        });

        it("should have primary value written out as link even when the drillable value is invalid", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: null,
                        isDrillable: true,
                    },
                },
            });

            const item = screen.getByText("–");
            expect(item).toBeInTheDocument();

            fireEvent.click(item);

            expect(onDrill).toHaveBeenCalledTimes(1);
            expect(onDrill).toBeCalledWith(
                {
                    localIdentifier: "m1",
                    value: null,
                    element: "primaryValue",
                },
                expect.anything(),
            );
        });

        it("should have primary value written out as dash when empty string is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "",
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });

        it("should have primary value written out as dash when null is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: null,
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });

        it("should have primary value written out as specified in format when null value and format is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: null,
                        format: "[=null]EMPTY",
                    },
                },
            });

            expect(screen.getByText("EMPTY")).toBeInTheDocument();
        });

        it("should have primary value written out as dash when undefined is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: undefined,
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });

        it("should have primary value written out as dash when non number string is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "xyz",
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });

        it("should have primary value written out as it is when positive number string is provided without format", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234567890",
                    },
                },
            });

            expect(screen.getByText("1234567890")).toBeInTheDocument();
        });

        it("should have primary value written out as it is when negative number string is provided without format", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "-12345678",
                    },
                },
            });

            expect(screen.getByText("-12345678")).toBeInTheDocument();
        });

        it("should have style applied on primary value when format is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1666.105",
                        format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                    },
                },
            });

            const item = document.querySelector(".s-headline-primary-item");
            expect(screen.getByText("$1,666.11")).toBeInTheDocument();
            expect(item).toHaveStyle("color: #9c46b5");
            expect(item).toHaveStyle("background-color: #d2ccde");
        });
    });

    describe("with secondary value", () => {
        it("should not produce any event upon click when fire handler but secondary value is not drillable", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            fireEvent.click(screen.getByText("$4,321.00"));

            expect(onDrill).toHaveBeenCalledTimes(0);
        });

        it("should produce correct event upon click when fire handler is set and secondary value is drillable", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            fireEvent.click(screen.getByText("$4,321.00"));

            expect(onDrill).toBeCalledWith(
                {
                    localIdentifier: "m2",
                    value: "4321",
                    element: "secondaryValue",
                },
                expect.anything(),
            );
        });

        it("should render headline item link with underline style when is drillable", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(document.querySelector(".headline-link-style-underline")).toBeInTheDocument();
        });

        it("should not render headline item link with underline style when is drillable and disableDrillUnderline is true", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
                disableDrillUnderline: true,
            });

            expect(document.querySelector(".headline-link-style-underline")).not.toBeInTheDocument();
        });

        it("should have secondary value written out as link even when the drillable value is invalid", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: null,
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            fireEvent.click(screen.getByText("–"));

            expect(onDrill).toHaveBeenCalledTimes(1);
            expect(onDrill).toBeCalledWith(
                {
                    localIdentifier: "m2",
                    value: null,
                    element: "secondaryValue",
                },
                expect.anything(),
            );
        });

        it("should have secondary value written out as dash when empty string is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });

        it("should have secondary value written out as dash when null is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });

        it("should have secondary value written out as specified in format when null value and format is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234",
                        format: "[=null]EMPTY",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: null,
                        format: "[=null]EMPTY",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "4321",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("EMPTY")).toBeInTheDocument();
        });

        it("should have secondary value written out as dash when undefined is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: undefined,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "4321",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });

        it("should have secondary value written out as dash when non number string is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "xyz",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "4321",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });

        it("should have secondary value written out as it is when positive number string is provided without format", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "1234567890",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "110",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("1234567890")).toBeInTheDocument();
        });

        it("should have secondary value written out as it is when negative number string is provided without format", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "-12345678",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "110",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("-12345678")).toBeInTheDocument();
        });

        it("should have style applied on secondary value when format is provided", () => {
            createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "1666.105",
                        format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "110",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const item = document.querySelector(".s-headline-secondary-item .s-headline-value-wrapper");
            expect(screen.getByText("$1,666.11")).toBeInTheDocument();
            expect(item).toHaveStyle("color: #9c46b5");
            expect(item).toHaveStyle("background-color: #d2ccde");
        });
    });

    describe("with tertiary value", () => {
        it("should have written out as formatted value when correct value is provided", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "110",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("110%")).toBeInTheDocument();
        });

        it("should have written out as dash when undefined value is provided", () => {
            const onDrill = vi.fn();
            createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: null,
                        format: null,
                        title: "Versus",
                    },
                },
            });

            expect(screen.getByText("–")).toBeInTheDocument();
        });
    });
});
