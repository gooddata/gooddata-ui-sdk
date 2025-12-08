// (C) 2023-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalculateAs } from "@gooddata/sdk-ui-charts";

import { comparisonMessages } from "../../../../../../locales.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import {
    TEST_DECIMAL_FORMAT_PRESET,
    TEST_DEFAULT_SEPARATOR,
    TEST_PERCENT_ROUNDED_FORMAT_PRESET,
    createTestProperties,
} from "../../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import { COMPARISON_FORMAT_VALUE_PATH, COMPARISON_SUB_FORMAT_VALUE_PATH } from "../../ComparisonValuePath.js";
import * as ComparisonPositionControl from "../ComparisonPositionControl.js";
import * as NumberFormatControl from "../numberFormat/NumberFormatControl.js";
import { ValueSubSection } from "../ValueSubSection.js";

const TITLE_TEXT_QUERY = "Value";

describe("ValueSubSection", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        sectionDisabled: false,
        defaultFormat: TEST_PERCENT_ROUNDED_FORMAT_PRESET.format,
        separators: TEST_DEFAULT_SEPARATOR,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                format: TEST_DECIMAL_FORMAT_PRESET.format,
            },
        }),
        pushData: mockPushData,
    };

    const renderValueSubSection = (
        params: {
            properties?: IVisualizationProperties<IComparisonControlProperties>;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <ValueSubSection {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render title correctly", () => {
        const { getByText } = renderValueSubSection();
        expect(getByText(TITLE_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should render number format control", () => {
        const MockNumberFormatControl = vi.spyOn(NumberFormatControl, "NumberFormatControl");
        renderValueSubSection();

        expect(MockNumberFormatControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: DEFAULT_PROPS.sectionDisabled,
                separators: DEFAULT_PROPS.separators,
                properties: DEFAULT_PROPS.properties,
                valuePath: COMPARISON_FORMAT_VALUE_PATH,
                labelText: comparisonMessages["formatTitle"].id,
                format: TEST_DECIMAL_FORMAT_PRESET.format,
                pushData: mockPushData,
            }),
            undefined,
        );
    });

    it("Should render comparison position control", () => {
        const MockComparisonPositionControl = vi.spyOn(
            ComparisonPositionControl,
            "ComparisonPositionControl",
        );
        renderValueSubSection();

        expect(MockComparisonPositionControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: DEFAULT_PROPS.sectionDisabled,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            undefined,
        );
    });

    it("Should select default format while format is empty", () => {
        const MockNumberFormatControl = vi.spyOn(NumberFormatControl, "NumberFormatControl");
        renderValueSubSection({
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                },
            }),
        });

        expect(MockNumberFormatControl).toHaveBeenCalledWith(
            expect.objectContaining({
                format: TEST_PERCENT_ROUNDED_FORMAT_PRESET.format,
            }),
            undefined,
        );
    });

    it("Should render sub-format when calculation type is change (difference)", () => {
        const MockNumberFormatControl = vi.spyOn(NumberFormatControl, "NumberFormatControl");
        renderValueSubSection({
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    calculationType: CalculateAs.CHANGE_DIFFERENCE,
                    format: TEST_PERCENT_ROUNDED_FORMAT_PRESET.format,
                    subFormat: TEST_DECIMAL_FORMAT_PRESET.format,
                },
            }),
        });

        expect(MockNumberFormatControl).toHaveBeenCalledTimes(2);

        expect(MockNumberFormatControl).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                valuePath: COMPARISON_FORMAT_VALUE_PATH,
                labelText: comparisonMessages["formatTitle"].id,
                format: TEST_PERCENT_ROUNDED_FORMAT_PRESET.format,
            }),
            undefined,
        );

        expect(MockNumberFormatControl).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                valuePath: COMPARISON_SUB_FORMAT_VALUE_PATH,
                labelText: comparisonMessages["subFormatTitle"].id,
                format: TEST_DECIMAL_FORMAT_PRESET.format,
            }),
            undefined,
        );
    });
});
