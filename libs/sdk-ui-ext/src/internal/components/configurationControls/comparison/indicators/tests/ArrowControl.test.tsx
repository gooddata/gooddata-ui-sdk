// (C) 2023-2025 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { createTestProperties } from "../../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import * as CheckboxControl from "../../../CheckboxControl.js";
import { COMPARISON_IS_ARROW_ENABLED_PATH } from "../../ComparisonValuePath.js";
import ArrowControl from "../ArrowControl.js";

const TITLE_TEXT_QUERY = "Arrow";
const CHECKBOX_SELECTOR = "input";

describe("ArrowControl", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        disabled: false,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                isArrowEnabled: false,
            },
        }),
        pushData: mockPushData,
    };

    const renderArrowControl = (
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
                <ArrowControl {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render title correctly", () => {
        const { getByText } = renderArrowControl();
        expect(getByText(TITLE_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should render arrow control unchecked status", () => {
        const MockCheckboxControl = vi.spyOn(CheckboxControl, "default");
        renderArrowControl();

        expect(MockCheckboxControl).toHaveBeenCalledWith(
            expect.objectContaining({
                ...DEFAULT_PROPS,
                valuePath: COMPARISON_IS_ARROW_ENABLED_PATH,
                checked: false,
            }),
            undefined,
        );
    });

    it("Should render arrow control checked status", () => {
        const MockCheckboxControl = vi.spyOn(CheckboxControl, "default");
        renderArrowControl({
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    isArrowEnabled: true,
                },
            }),
        });

        expect(MockCheckboxControl).toHaveBeenCalledWith(
            expect.objectContaining({
                valuePath: COMPARISON_IS_ARROW_ENABLED_PATH,
                checked: true,
            }),
            undefined,
        );
    });

    it("Should push data while click checkbox value", () => {
        const { container } = renderArrowControl();
        fireEvent.click(container.querySelector(CHECKBOX_SELECTOR));
        expect(mockPushData).toHaveBeenCalled();
    });

    it("Should disabled arrow checkbox", () => {
        const { container } = renderArrowControl({
            disabled: true,
        });
        expect(container.querySelector(CHECKBOX_SELECTOR)).toHaveAttribute("disabled");
    });
});
