// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ComparisonColorType, DEFAULT_COMPARISON_PALETTE, type IColorConfig } from "@gooddata/sdk-ui-charts";

import { type IComparisonControlProperties } from "../../../../../../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../../../../../../interfaces/Visualization.js";
import { createTestProperties } from "../../../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../../../utils/internalIntlProvider.js";
import {
    COMPARISON_COLOR_CONFIG_EQUALS,
    COMPARISON_COLOR_CONFIG_NEGATIVE,
    COMPARISON_COLOR_CONFIG_POSITIVE,
} from "../../../ComparisonValuePath.js";
import { ColorCheckbox } from "../ColorCheckbox.js";
import { ColorItem } from "../ColorItem.js";
import { ColorResetButton } from "../ColorResetButton.js";
import { ColorsControl } from "../ColorsControl.js";

vi.mock("../ColorCheckbox.js", async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("../ColorCheckbox.js")>();
    return {
        ...actual,
        ColorCheckbox: vi.fn(actual.ColorCheckbox),
    };
});

vi.mock("../ColorItem.js", async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("../ColorItem.js")>();
    return { ...actual, ColorItem: vi.fn(actual.ColorItem) };
});

vi.mock("../ColorResetButton.js", async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("../ColorResetButton.js")>();
    return {
        ...actual,
        ColorResetButton: vi.fn(actual.ColorResetButton),
    };
});

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
        const MockColorCheckbox = vi.mocked(ColorCheckbox);
        renderColorControls({
            disabled: true,
        });

        expect(MockColorCheckbox).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            undefined,
        );
    });

    it("Should render color reset button is disabled when control is disabled", () => {
        const MockColorResetButton = vi.mocked(ColorResetButton);
        renderColorControls({
            disabled: true,
        });

        expect(MockColorResetButton).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            undefined,
        );
    });

    it("Should render color checkbox is enabled when control is enabled", () => {
        const MockColorCheckbox = vi.mocked(ColorCheckbox);
        renderColorControls({
            disabled: false,
        });

        expect(MockColorCheckbox).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: false,
                properties: DEFAULT_PROPS.properties,
                pushData: DEFAULT_PROPS.pushData,
            }),
            undefined,
        );
    });

    it.each([
        ["Should render color item correctly", false, false],
        ["Should disabled color item when control disabled", true, false],
        ["Should disabled color item when color config disabled", false, true],
    ])("%s", (_test: string, isControlDisabled: boolean, isColorConfigDisabled: boolean) => {
        const MockColorItem = vi.mocked(ColorItem);

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
            undefined,
        );
        expect(MockColorItem).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                ...expectedProps,
                color: TEST_COLOR_CONFIGS.negative,
                colorType: ComparisonColorType.NEGATIVE,
                valuePath: COMPARISON_COLOR_CONFIG_NEGATIVE,
            }),
            undefined,
        );
        expect(MockColorItem).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                ...expectedProps,
                color: TEST_COLOR_CONFIGS.equals,
                colorType: ComparisonColorType.EQUALS,
                valuePath: COMPARISON_COLOR_CONFIG_EQUALS,
            }),
            undefined,
        );
    });
});
