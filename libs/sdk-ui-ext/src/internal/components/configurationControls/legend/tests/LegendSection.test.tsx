// (C) 2019-2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { cloneDeep, set } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { GeoLegendSection, type IGeoLegendSectionProps } from "../GeoLegendSection.js";
import { type ILegendSection, LegendSection } from "../LegendSection.js";

const defaultProps: ILegendSection = {
    controlsDisabled: true,
    properties: {},
    propertiesMeta: {},
    pushData: () => {},
};

function createComponent(customProps: Partial<ILegendSection> = {}) {
    const props: ILegendSection = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <LegendSection {...props} />
        </InternalIntlWrapper>,
    );
}

function createGeoComponent(customProps: Partial<IGeoLegendSectionProps> = {}) {
    const props: IGeoLegendSectionProps = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <GeoLegendSection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LegendSection render", () => {
    it("should render legend section", () => {
        createComponent();
        expect(screen.getByText("Legend")).toBeInTheDocument();
    });

    it("when controlsDisabled true than LegendPositionControl should render disabled", () => {
        const notCollapsed = set({}, "legend_section.collapsed", false);
        const legendToggledOn = set({}, "controls.legend.enabled", true);

        createComponent({
            controlsDisabled: true,
            properties: legendToggledOn,
            propertiesMeta: notCollapsed,
        });

        expect(screen.getByText("Position")).toBeInTheDocument();
        expect(screen.getByRole("checkbox")).toBeDisabled();
        expect(screen.getByRole("combobox")).toHaveClass("disabled");
    });

    it(
        "When controlsDisabled is false and properties.controls.legend.enabled is false " +
            "than LegendPositionControl should be disabled",
        () => {
            const legendToggledOn = set({}, "controls.legend.enabled", false);
            const notCollapsed = set({}, "legend_section.collapsed", false);

            createComponent({
                controlsDisabled: false,
                properties: legendToggledOn,
                propertiesMeta: notCollapsed,
            });

            expect(screen.getByText("Position")).toBeInTheDocument();
            expect(screen.getByRole("checkbox")).toBeEnabled();
            expect(screen.getByRole("combobox")).toHaveClass("disabled");
        },
    );

    it(
        "When controlsDisabled is false and properties.controls.legend.enabled is true " +
            "than LegendPositionControl should be enabled",
        () => {
            const legendToggledOn = set({}, "controls.legend.enabled", true);
            const notCollapsed = set({}, "legend_section.collapsed", false);

            createComponent({
                controlsDisabled: false,
                properties: legendToggledOn,
                propertiesMeta: notCollapsed,
            });

            expect(screen.getByText("Position")).toBeInTheDocument();
            expect(screen.getByRole("checkbox")).toBeEnabled();
            expect(screen.getByRole("combobox")).not.toHaveClass("disabled");
        },
    );

    it("When legend is not visible in meta and is enabled in properties, legend should be disabled", () => {
        const legendToggledOn = set({}, "controls.legend.enabled", true);
        const propertiesMeta = {
            legend_enabled: false,
            legend_section: { collapsed: false },
        };

        createComponent({
            controlsDisabled: false,
            properties: legendToggledOn,
            propertiesMeta,
        });

        expect(screen.getByText("Position")).toBeInTheDocument();
        expect(screen.getByRole("checkbox")).toBeDisabled();
        expect(screen.getByRole("combobox")).toHaveClass("disabled");
    });
});

describe("GeoLegendSection render", () => {
    it("renders corner-based geo legend positions and normalizes legacy selection", async () => {
        createGeoComponent({
            controlsDisabled: false,
            properties: set(set({}, "controls.legend.enabled", true), "controls.legend.position", "top"),
            propertiesMeta: set({}, "legend_section.collapsed", false),
        });

        expect(screen.getByText("top right")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("combobox"));

        await waitFor(() => {
            expect(screen.getByText("top left")).toBeInTheDocument();
            expect(screen.getByText("bottom left")).toBeInTheDocument();
            expect(screen.getByText("bottom right")).toBeInTheDocument();
        });
    });

    it("persists the new geo corner value from the dropdown", async () => {
        const pushData = (data: { properties?: { controls?: { legend?: { position?: string } } } }) => data;
        const pushDataSpy = vi.fn(pushData);

        createGeoComponent({
            controlsDisabled: false,
            properties: set(set({}, "controls.legend.enabled", true), "controls.legend.position", "auto"),
            propertiesMeta: set({}, "legend_section.collapsed", false),
            pushData: pushDataSpy,
        });

        await userEvent.click(screen.getByRole("combobox"));
        await userEvent.click(screen.getByText("bottom left"));

        expect(pushDataSpy).toHaveBeenCalledWith({
            properties: {
                controls: {
                    legend: {
                        enabled: true,
                        position: "bottom-left",
                    },
                },
            },
        });
    });
});
