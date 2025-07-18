// (C) 2023-2025 GoodData Corporation
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { DEFAULT_COMPARISON_PALETTE } from "@gooddata/sdk-ui-charts";

import { createTestProperties } from "../../../../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import * as ArrowControl from "../ArrowControl.js";
import * as ColorsControl from "../colorsControl/ColorsControl.js";

import IndicatorSubSection from "../IndicatorSubSection.js";

const TITLE_TEXT_QUERY = "Indicator";

describe("IndicatorSubSection", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        sectionDisabled: false,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
            },
        }),
        colorPalette: DEFAULT_COMPARISON_PALETTE,
        pushData: mockPushData,
    };

    const renderIndicatorSubSection = () => {
        const props = {
            ...DEFAULT_PROPS,
        };

        return render(
            <InternalIntlWrapper>
                <IndicatorSubSection {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render title correctly", () => {
        const { getByText } = renderIndicatorSubSection();
        expect(getByText(TITLE_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should render arrow control", () => {
        const MockArrowControl = vi.spyOn(ArrowControl, "default");
        renderIndicatorSubSection();

        expect(MockArrowControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: DEFAULT_PROPS.sectionDisabled,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            expect.anything(),
        );
    });

    it("Should render color control", () => {
        const MockColorControl = vi.spyOn(ColorsControl, "default");
        renderIndicatorSubSection();

        const { sectionDisabled, ...expected } = DEFAULT_PROPS;
        expect(MockColorControl).toHaveBeenCalledWith(
            expect.objectContaining({
                ...expected,
                disabled: sectionDisabled,
            }),
            expect.anything(),
        );
    });
});
