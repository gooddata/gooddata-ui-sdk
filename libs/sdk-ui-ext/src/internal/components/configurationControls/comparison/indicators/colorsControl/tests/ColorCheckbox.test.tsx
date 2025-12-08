// (C) 2023-2025 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IComparisonControlProperties } from "../../../../../../interfaces/ControlProperties.js";
import { createTestProperties } from "../../../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../../../utils/internalIntlProvider.js";
import { ColorCheckbox } from "../ColorCheckbox.js";

const LABEL_CHECKBOX_TEXT_QUERY = "Color";
const CHECKBOX_SELECTOR = "input";

describe("ColorCheckbox", () => {
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

    const renderColorCheckbox = (
        params: {
            disabled?: boolean;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <ColorCheckbox {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render title correctly", () => {
        const { getByText } = renderColorCheckbox();
        expect(getByText(LABEL_CHECKBOX_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should push data while click checkbox value", () => {
        const { container } = renderColorCheckbox();
        fireEvent.click(container.querySelector(CHECKBOX_SELECTOR));
        expect(mockPushData).toHaveBeenCalled();
    });

    it("Should disabled checkbox", () => {
        const { container } = renderColorCheckbox({
            disabled: true,
        });
        expect(container.querySelector(CHECKBOX_SELECTOR)).toHaveAttribute("disabled");
    });
});
