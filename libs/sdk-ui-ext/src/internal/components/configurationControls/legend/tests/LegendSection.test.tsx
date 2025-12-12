// (C) 2019-2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { cloneDeep, set } from "lodash-es";
import { describe, expect, it } from "vitest";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
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
