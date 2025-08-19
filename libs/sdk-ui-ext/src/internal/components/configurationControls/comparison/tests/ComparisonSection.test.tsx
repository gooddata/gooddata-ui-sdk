// (C) 2023-2025 GoodData Corporation
import React from "react";

import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalculateAs, CalculationType, DEFAULT_COMPARISON_PALETTE } from "@gooddata/sdk-ui-charts";

import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { TEST_DEFAULT_SEPARATOR, createTestProperties } from "../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import * as ConfigSection from "../../ConfigSection.js";
import ComparisonSection from "../ComparisonSection.js";
import { COMPARISON_ENABLED_VALUE_PATH } from "../ComparisonValuePath.js";

const COMPARISON_TOGGLE_SELECTOR = ".s-config-section-comparison_section input";

describe("ComparisonSection", () => {
    const DEFAULT_CONTROL_DISABLED: boolean = false;
    const DEFAULT_DISABLED_BY_VISUALIZATION: boolean = false;
    const pushData = vi.fn();

    const mockConfigSection = () => vi.spyOn(ConfigSection, "default");

    const renderComparisonSection = (params?: {
        controlDisabled?: boolean;
        disabledByVisualization?: boolean;
        defaultCalculationType?: CalculationType;
        properties?: IVisualizationProperties<IComparisonControlProperties>;
    }) => {
        const props = {
            controlDisabled: DEFAULT_CONTROL_DISABLED,
            disabledByVisualization: DEFAULT_DISABLED_BY_VISUALIZATION,
            properties: {},
            propertiesMeta: {},
            defaultCalculationType: CalculateAs.RATIO,
            separators: TEST_DEFAULT_SEPARATOR,
            pushData,
            colorPalette: DEFAULT_COMPARISON_PALETTE,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <ComparisonSection {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render comparison section based on config section", () => {
        const MockConfigSection = mockConfigSection();
        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                calculationType: CalculateAs.RATIO,
            },
        });

        renderComparisonSection({ properties });
        expect(MockConfigSection).toHaveBeenCalledWith(
            expect.objectContaining({
                valuePath: COMPARISON_ENABLED_VALUE_PATH,
                properties,
                pushData,
                toggleDisabled: DEFAULT_DISABLED_BY_VISUALIZATION,
                toggledOn: properties.controls.comparison.enabled,
            }),
            expect.anything(),
        );
    });

    it("Should disabled toggle when disabledByVisualization is true", () => {
        const MockConfigSection = mockConfigSection();
        const disabledByVisualization = true;

        renderComparisonSection({ disabledByVisualization });
        expect(MockConfigSection).toHaveBeenCalledWith(
            expect.objectContaining({
                toggleDisabled: disabledByVisualization,
            }),
            expect.anything(),
        );
    });

    it("Should show comparison section title correctly", () => {
        const { getByText } = renderComparisonSection();
        expect(getByText("Comparison")).toBeInTheDocument();
    });

    it("Should on toggle when provided property is true", () => {
        const MockConfigSection = mockConfigSection();
        const enabled: boolean = true;
        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: { enabled },
        });

        renderComparisonSection({ properties });
        expect(MockConfigSection).toHaveBeenCalledWith(
            expect.objectContaining({
                toggledOn: enabled,
            }),
            expect.anything(),
        );
    });

    it("Should off toggle when provided property is false", () => {
        const MockConfigSection = mockConfigSection();
        const enabled: boolean = false;
        const properties = createTestProperties({ comparison: { enabled } });

        renderComparisonSection({ properties });
        expect(MockConfigSection).toHaveBeenCalledWith(
            expect.objectContaining({
                toggledOn: enabled,
            }),
            expect.anything(),
        );
    });

    it("Should call push-data to update comparison-enabled to unchecked while clicking on toggle ", () => {
        const enabled: boolean = true;
        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: { enabled },
        });
        const { container } = renderComparisonSection({ properties });
        const switcher = container.querySelector(COMPARISON_TOGGLE_SELECTOR);
        fireEvent.click(switcher);
        expect(pushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: { enabled: false },
                }),
            }),
        );
    });

    it("Should call push-data to update comparison-enabled to checked while clicking on toggle ", () => {
        const enabled: boolean = false;
        const properties = createTestProperties<IComparisonControlProperties>({ comparison: { enabled } });
        const { container } = renderComparisonSection({ properties });
        const switcher = container.querySelector(COMPARISON_TOGGLE_SELECTOR);
        fireEvent.click(switcher);
        expect(pushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: { enabled: true },
                }),
            }),
        );
    });
});
