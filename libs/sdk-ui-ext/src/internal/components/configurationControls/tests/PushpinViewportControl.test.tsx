// (C) 2020-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { type IPushpinViewportControl, PushpinViewportControl } from "../PushpinViewportControl.js";

describe("PushpinViewportControl", () => {
    const defaultProps = {
        disabled: false,
        properties: {},
        pushData: () => {},
    };

    function createComponent(customProps: Partial<IPushpinViewportControl> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <PushpinViewportControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render PushpinViewportControl", () => {
            createComponent();
            expect(screen.getByText("Default viewport")).toBeInTheDocument();
        });

        it("should render disabled PushpinViewportControl", () => {
            createComponent({
                disabled: true,
            });
            expect(screen.getByRole("combobox")).toHaveClass("disabled");
        });

        it("should have `Include all data` by default", () => {
            createComponent();
            expect(screen.getByText("Include all data")).toBeInTheDocument();
        });

        it.each([
            ["Include all data", "auto"],
            ["Africa", "continent_af"],
            ["Asia", "continent_as"],
            ["Australia", "continent_au"],
            ["Europe", "continent_eu"],
            ["America (North)", "continent_na"],
            ["America (South)", "continent_sa"],
            ["World", "world"],
        ])("should render %s as selected viewport item", (expectedText: string, area: string) => {
            createComponent({
                properties: {
                    controls: {
                        viewport: {
                            area,
                        },
                    },
                },
            });
            expect(screen.getByText(expectedText)).toBeInTheDocument();
        });

        it("should render custom viewport item when current map view is provided", () => {
            createComponent({
                getCurrentMapView: () => ({
                    center: { lat: 50.1, lng: 14.4 },
                    zoom: 3,
                }),
                properties: {
                    controls: {
                        viewport: {
                            area: "custom",
                        },
                    },
                },
            });

            expect(screen.getByRole("combobox")).toHaveTextContent("Custom");
        });

        it("should keep auto viewport selected when navigation is set without area", () => {
            createComponent({
                properties: {
                    controls: {
                        viewport: {
                            navigation: {
                                pan: false,
                            },
                        },
                    },
                },
            });

            expect(screen.getByText("Include all data")).toBeInTheDocument();
        });

        it("should not render navigation toggles without current map view", () => {
            createComponent();

            expect(screen.queryByText("Navigation")).not.toBeInTheDocument();
            expect(
                screen.queryByRole("checkbox", { name: "viewport.navigation.pan" }),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole("checkbox", { name: "viewport.navigation.zoom" }),
            ).not.toBeInTheDocument();
        });

        it("should render navigation toggles with default enabled values", () => {
            createComponent({
                getCurrentMapView: () => ({
                    center: { lat: 50.1, lng: 14.4 },
                    zoom: 3,
                }),
            });

            expect(screen.getByRole("checkbox", { name: "viewport.navigation.pan" })).toBeChecked();
            expect(screen.getByRole("checkbox", { name: "viewport.navigation.zoom" })).toBeChecked();
        });

        it("should render navigation toggles from viewport.navigation properties", () => {
            createComponent({
                getCurrentMapView: () => ({
                    center: { lat: 50.1, lng: 14.4 },
                    zoom: 3,
                }),
                properties: {
                    controls: {
                        viewport: {
                            area: "auto",
                            navigation: {
                                pan: false,
                                zoom: false,
                            },
                        },
                    },
                },
            });

            expect(screen.getByRole("checkbox", { name: "viewport.navigation.pan" })).not.toBeChecked();
            expect(screen.getByRole("checkbox", { name: "viewport.navigation.zoom" })).not.toBeChecked();
        });
    });
});
