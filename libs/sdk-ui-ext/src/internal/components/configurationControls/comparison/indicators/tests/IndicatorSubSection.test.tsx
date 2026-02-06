// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_COMPARISON_PALETTE } from "@gooddata/sdk-ui-charts";

import { type IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { createTestProperties } from "../../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import { ArrowControl } from "../ArrowControl.js";
import { ColorsControl } from "../colorsControl/ColorsControl.js";
import { IndicatorSubSection } from "../IndicatorSubSection.js";

vi.mock("../ArrowControl.js", async (importOriginal) => {
    // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("../ArrowControl.js")>();
    return { ...actual, ArrowControl: vi.fn(actual.ArrowControl) };
});

vi.mock("../colorsControl/ColorsControl.js", async (importOriginal) => {
    // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("../colorsControl/ColorsControl.js")>();
    return {
        ...actual,
        ColorsControl: vi.fn(actual.ColorsControl),
    };
});

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
        const MockArrowControl = vi.mocked(ArrowControl);
        renderIndicatorSubSection();

        expect(MockArrowControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: DEFAULT_PROPS.sectionDisabled,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            undefined,
        );
    });

    it("Should render color control", () => {
        const MockColorControl = vi.mocked(ColorsControl);
        renderIndicatorSubSection();

        const { sectionDisabled, ...expected } = DEFAULT_PROPS;
        expect(MockColorControl).toHaveBeenCalledWith(
            expect.objectContaining({
                ...expected,
                disabled: sectionDisabled,
            }),
            undefined,
        );
    });
});
