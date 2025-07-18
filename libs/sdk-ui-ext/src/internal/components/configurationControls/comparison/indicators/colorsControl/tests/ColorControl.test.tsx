// (C) 2023-2025 GoodData Corporation
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ComparisonColorType, DEFAULT_COMPARISON_PALETTE, IColorConfig } from "@gooddata/sdk-ui-charts";

import { createTestProperties } from "../../../../../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../../../interfaces/Visualization.js";
import { InternalIntlWrapper } from "../../../../../../utils/internalIntlProvider.js";
import ColorsControl from "../ColorsControl.js";
import * as ColorCheckbox from "../ColorCheckbox.js";
import * as ColorItem from "../ColorItem.js";
import * as ColorResetButton from "../ColorResetButton.js";
import {
    COMPARISON_COLOR_CONFIG_EQUALS,
    COMPARISON_COLOR_CONFIG_NEGATIVE,
    COMPARISON_COLOR_CONFIG_POSITIVE,
} from "../../../ComparisonValuePath.js";

describe("ColorsControl", () => {
    const mockPushData = vi.fn();

    const TEST_COLOR_CONFIGS: IColorConfig = {
        disabled: false,
        positive: {
            type: "rgb",
            value: { r: 5, g: 5, b: 5 },
        },
        negative: {
            type: "guid",
            value: "positive",
        },
        equals: {
            type: "guid",
            value: "01",
        },
    };

    const DEFAULT_PROPS = {
        disabled: false,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                colorConfig: TEST_COLOR_CONFIGS,
            },
        }),
        colorPalette: DEFAULT_COMPARISON_PALETTE,
        pushData: mockPushData,
    };

    const renderColorControls = (
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
                <ColorsControl {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render color checkbox is disabled when control is disabled", () => {
        const MockColorCheckbox = vi.spyOn(ColorCheckbox, "default");
        renderColorControls({
            disabled: true,
        });

        expect(MockColorCheckbox).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            expect.anything(),
        );
    });

    it("Should render color reset button is disabled when control is disabled", () => {
        const MockColorResetButton = vi.spyOn(ColorResetButton, "default");
        renderColorControls({
            disabled: true,
        });

        expect(MockColorResetButton).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            expect.anything(),
        );
    });

    it("Should render color checkbox is enabled when control is enabled", () => {
        const MockColorCheckbox = vi.spyOn(ColorCheckbox, "default");
        renderColorControls({
            disabled: false,
        });

        expect(MockColorCheckbox).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: false,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            expect.anything(),
        );
    });

    it.each([
        ["Should render color item correctly", false, false],
        ["Should disabled color item when control disabled", true, false],
        ["Should disabled color item when color config disabled", false, true],
    ])("%s", (_test: string, isControlDisabled: boolean, isColorConfigDisabled: boolean) => {
        const MockColorItem = vi.spyOn(ColorItem, "default");

        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                colorConfig: {
                    ...TEST_COLOR_CONFIGS,
                    disabled: isColorConfigDisabled,
                },
            },
        });

        renderColorControls({
            disabled: isControlDisabled,
            properties,
        });

        const expectedProps = {
            ...DEFAULT_PROPS,
            properties,
            disabled: isControlDisabled || isColorConfigDisabled,
        };

        expect(MockColorItem).toHaveBeenCalledTimes(3);
        expect(MockColorItem).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                ...expectedProps,
                color: TEST_COLOR_CONFIGS.positive,
                colorType: ComparisonColorType.POSITIVE,
                valuePath: COMPARISON_COLOR_CONFIG_POSITIVE,
            }),
            expect.anything(),
        );
        expect(MockColorItem).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                ...expectedProps,
                color: TEST_COLOR_CONFIGS.negative,
                colorType: ComparisonColorType.NEGATIVE,
                valuePath: COMPARISON_COLOR_CONFIG_NEGATIVE,
            }),
            expect.anything(),
        );
        expect(MockColorItem).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                ...expectedProps,
                color: TEST_COLOR_CONFIGS.equals,
                colorType: ComparisonColorType.EQUALS,
                valuePath: COMPARISON_COLOR_CONFIG_EQUALS,
            }),
            expect.anything(),
        );
    });
});
