// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import LegendSection, { ILegendSection } from "../LegendSection";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

const defaultProps: ILegendSection = {
    controlsDisabled: true,
    properties: {},
    propertiesMeta: {},
    pushData: noop,
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
        expect(screen.getByRole("button")).toHaveClass("disabled");
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
            expect(screen.getByRole("button")).toHaveClass("disabled");
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
            expect(screen.getByRole("button")).not.toHaveClass("disabled");
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
        expect(screen.getByRole("button")).toHaveClass("disabled");
    });
});
