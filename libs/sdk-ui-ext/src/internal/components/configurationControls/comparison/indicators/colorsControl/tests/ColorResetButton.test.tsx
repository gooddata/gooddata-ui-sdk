// (C) 2023 GoodData Corporation
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { createTestProperties } from "../../../../../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../../../../../interfaces/ControlProperties.js";
import { InternalIntlWrapper } from "../../../../../../utils/internalIntlProvider.js";
import { IVisualizationProperties } from "../../../../../../interfaces/Visualization.js";
import ColorResetButton from "../ColorResetButton.js";

const LABEL_BUTTON_TEXT_QUERY = "Reset Colors";
const BUTTON_WRAPPER_SELECTOR = ".s-gd-color-reset-colors-section";
const BUTTON_SELECTOR = "button";

describe("ColorResetButton", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        disabled: false,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
            },
        }),
        pushData: mockPushData,
    };

    const renderColorResetButton = (
        params: {
            disabled?: boolean;
            properties?: IVisualizationProperties<IComparisonControlProperties>;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <ColorResetButton {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render lable correctly", () => {
        const { getByText } = renderColorResetButton();
        expect(getByText(LABEL_BUTTON_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should hidden when color config is empty", () => {
        const { container } = renderColorResetButton();
        expect(container.querySelector(BUTTON_WRAPPER_SELECTOR)).toHaveClass("disabled");
    });

    it("Should hidden when control is disabled", () => {
        const { container } = renderColorResetButton({
            disabled: true,
        });
        expect(container.querySelector(BUTTON_WRAPPER_SELECTOR)).toHaveClass("disabled");
    });

    it("Should visible when control color config is not empty", () => {
        const { container } = renderColorResetButton({
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    colorConfig: {
                        disabled: false,
                        equals: {
                            type: "guid",
                            value: "equals",
                        },
                    },
                },
            }),
        });
        expect(container.querySelector(BUTTON_WRAPPER_SELECTOR)).not.toHaveClass("disabled");
    });

    it("Should push data while click reset button", () => {
        const { container } = renderColorResetButton({
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    colorConfig: {
                        disabled: false,
                        equals: {
                            type: "guid",
                            value: "equals",
                        },
                    },
                },
            }),
        });
        fireEvent.click(container.querySelector(BUTTON_SELECTOR));
        expect(mockPushData).toHaveBeenCalled();
    });
});
