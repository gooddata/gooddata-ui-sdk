// (C) 2023 GoodData Corporation
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NumberFormatControl from "../NumberFormatControl.js";
import {
    TEST_DEFAULT_SEPARATOR,
    createTestProperties,
    TEST_PERCENT_ROUNDED_FORMAT_PRESET,
    TEST_DECIMAL_FORMAT_PRESET,
} from "../../../../../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../../../../../interfaces/ControlProperties.js";
import { InternalIntlWrapper } from "../../../../../../utils/internalIntlProvider.js";
import { IVisualizationProperties } from "../../../../../../interfaces/Visualization.js";

const DROPDOWN_BUTTON_SELECTOR = ".s-number-format-toggle-button button";
const TITLE_TEXT_QUERY = "Format";

describe("NumberFormatControl", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        disabled: false,
        defaultFormat: "",
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
            defaultFormat?: string;
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

        expect(mockPushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: {
                        enabled: true,
                        format: TEST_DECIMAL_FORMAT_PRESET.format,
                    },
                }),
            }),
        );
    });

    it("Should select provided format ", () => {
        const { container } = renderNumberFormatControl({
            defaultFormat: TEST_DECIMAL_FORMAT_PRESET.format,
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    format: TEST_PERCENT_ROUNDED_FORMAT_PRESET.format,
                },
            }),
        });

        expect(container.querySelector(DROPDOWN_BUTTON_SELECTOR).textContent).toEqual(
            TEST_PERCENT_ROUNDED_FORMAT_PRESET.name,
        );
    });

    it("Should select default format while format is empty ", () => {
        const { container } = renderNumberFormatControl({
            defaultFormat: TEST_DECIMAL_FORMAT_PRESET.format,
        });

        expect(container.querySelector(DROPDOWN_BUTTON_SELECTOR).textContent).toEqual(
            TEST_DECIMAL_FORMAT_PRESET.name,
        );
    });
});
