// (C) 2023 GoodData Corporation
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import ValueSubSection from "../ValueSubSection.js";
import {
    createTestProperties,
    TEST_DECIMAL_FORMAT_PRESET,
    TEST_DEFAULT_SEPARATOR,
    TEST_PERCENT_ROUNDED_FORMAT_PRESET,
} from "../../../../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import * as NumberFormatControl from "../numberFormat/NumberFormatControl.js";
import * as ComparisonPositionControl from "../ComparisonPositionControl.js";

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

    const renderValueSubSection = () => {
        const props = {
            ...DEFAULT_PROPS,
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
        const MockNumberFormatControl = vi.spyOn(NumberFormatControl, "default");
        renderValueSubSection();

        const { sectionDisabled, ...expected } = DEFAULT_PROPS;
        expect(MockNumberFormatControl).toHaveBeenCalledWith(
            expect.objectContaining({
                ...expected,
                disabled: sectionDisabled,
            }),
            expect.anything(),
        );
    });

    it("Should render comparison position control", () => {
        const MockComparisonPositionControl = vi.spyOn(ComparisonPositionControl, "default");
        renderValueSubSection();

        expect(MockComparisonPositionControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: DEFAULT_PROPS.sectionDisabled,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            expect.anything(),
        );
    });
});
