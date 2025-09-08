// (C) 2023-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { MessageDescriptor } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IColor } from "@gooddata/sdk-model";
import { ComparisonColorType, DEFAULT_COMPARISON_PALETTE, IColorConfig } from "@gooddata/sdk-ui-charts";

import { comparisonMessages } from "../../../../../../../locales.js";
import { IComparisonControlProperties } from "../../../../../../interfaces/ControlProperties.js";
import { createTestProperties } from "../../../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../../../utils/internalIntlProvider.js";
import { COMPARISON_COLOR_CONFIG_POSITIVE } from "../../../ComparisonValuePath.js";
import ColorItem from "../ColorItem.js";

const POSITIVE_LABEL_TEXT_QUERY = "Primary > Secondary";
const NEGATIVE_LABEL_TEXT_QUERY = "Primary < Secondary";
const EQUALS_LABEL_TEXT_QUERY = "Primary = Secondary";

const COLOR_ITEM_SELECTOR = ".s-colored-items-list-item";
const COLOR_ITEM_SQUARE_SELECTOR = `${COLOR_ITEM_SELECTOR} > div`;

describe("ColorItem", () => {
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
        color: TEST_COLOR_CONFIGS.positive,
        colorType: ComparisonColorType.POSITIVE,
        colorPalette: DEFAULT_COMPARISON_PALETTE,
        labelDescriptor: comparisonMessages["colorsConfigPositive"],
        valuePath: COMPARISON_COLOR_CONFIG_POSITIVE,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                colorConfig: TEST_COLOR_CONFIGS,
            },
        }),
        pushData: mockPushData,
    };

    const renderColorItem = (
        params: {
            disabled?: boolean;
            color?: IColor;
            colorType?: ComparisonColorType;
            labelDescriptor?: MessageDescriptor;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <ColorItem {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render positive color correctly", () => {
        const { getByText, container } = renderColorItem();
        expect(getByText(POSITIVE_LABEL_TEXT_QUERY)).toBeInTheDocument();
        expect(container.querySelector(COLOR_ITEM_SQUARE_SELECTOR)).toHaveStyle(
            "background-color: rgb(5, 5, 5)",
        );
    });

    it("Should render negative color correctly", () => {
        const { getByText, container } = renderColorItem({
            color: TEST_COLOR_CONFIGS.negative,
            colorType: ComparisonColorType.NEGATIVE,
            labelDescriptor: comparisonMessages["colorsConfigNegative"],
        });
        expect(getByText(NEGATIVE_LABEL_TEXT_QUERY)).toBeInTheDocument();
        expect(container.querySelector(COLOR_ITEM_SQUARE_SELECTOR)).toHaveStyle(
            "background-color: rgb(0, 193, 141)",
        );
    });

    it("Should render equals color correctly", () => {
        const { getByText, container } = renderColorItem({
            color: TEST_COLOR_CONFIGS.equals,
            colorType: ComparisonColorType.EQUALS,
            labelDescriptor: comparisonMessages["colorsConfigEquals"],
        });
        expect(getByText(EQUALS_LABEL_TEXT_QUERY)).toBeInTheDocument();
        expect(container.querySelector(COLOR_ITEM_SQUARE_SELECTOR)).toHaveStyle(
            "background-color: rgb(148, 161, 173)",
        );
    });

    it("Should disabled color item", () => {
        const { container } = renderColorItem({
            disabled: true,
        });
        expect(container.querySelector(COLOR_ITEM_SELECTOR)).toHaveClass("is-disabled");
    });
});
