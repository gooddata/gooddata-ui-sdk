// (C) 2023-2025 GoodData Corporation
import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import set from "lodash/set.js";
import { describe, expect, it, vi } from "vitest";

import { comparisonMessages } from "../../../../../../../locales.js";
import { IComparisonControlProperties } from "../../../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../../../interfaces/Visualization.js";
import {
    TEST_DECIMAL_FORMAT_PRESET,
    TEST_DEFAULT_SEPARATOR,
    TEST_PERCENT_ROUNDED_FORMAT_PRESET,
    createTestProperties,
} from "../../../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../../../utils/internalIntlProvider.js";
import { COMPARISON_FORMAT_VALUE_PATH } from "../../../ComparisonValuePath.js";
import NumberFormatControl from "../NumberFormatControl.js";

const DROPDOWN_BUTTON_SELECTOR = ".s-number-format-toggle-button button";
const TITLE_TEXT_QUERY = "Format";

describe("NumberFormatControl", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        disabled: false,
        valuePath: COMPARISON_FORMAT_VALUE_PATH,
        labelText: comparisonMessages["formatTitle"].id,
        format: TEST_PERCENT_ROUNDED_FORMAT_PRESET.format,
        separators: TEST_DEFAULT_SEPARATOR,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
            },
        }),
        pushData: mockPushData,
    };

    const renderNumberFormatControl = (
        params: {
            disabled?: boolean;
            format?: string;
            properties?: IVisualizationProperties<IComparisonControlProperties>;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <NumberFormatControl {...props} />
            </InternalIntlWrapper>,
        );
    };

    it("Should render title correctly", () => {
        const { getByText } = renderNumberFormatControl();
        expect(getByText(TITLE_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should call push-data while select an format item", () => {
        const { container } = renderNumberFormatControl();

        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR));
        fireEvent.click(screen.getByText(TEST_DECIMAL_FORMAT_PRESET.name));

        const expectedProperties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
            },
        });
        set(expectedProperties.controls, DEFAULT_PROPS.valuePath, TEST_DECIMAL_FORMAT_PRESET.format);

        expect(mockPushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: expectedProperties,
            }),
        );
    });

    it("Should select provided format ", () => {
        const { container } = renderNumberFormatControl({
            format: TEST_PERCENT_ROUNDED_FORMAT_PRESET.format,
        });

        expect(container.querySelector(DROPDOWN_BUTTON_SELECTOR).textContent).toEqual(
            TEST_PERCENT_ROUNDED_FORMAT_PRESET.name,
        );
    });
});
