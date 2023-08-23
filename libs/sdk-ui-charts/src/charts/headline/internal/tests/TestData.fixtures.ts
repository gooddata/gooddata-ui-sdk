// (C) 2023 GoodData Corporation
import { IHeadlineDataItem } from "../interfaces/Headlines.js";
import { IBaseHeadlineItem, EvaluationType } from "../interfaces/BaseHeadlines.js";
import BaseHeadlineDataItem from "../headlines/baseHeadline/baseHeadlineDataItems/BaseHeadlineDataItem.js";
import { IColorConfig } from "../../../../interfaces/index.js";
import { IColorPalette } from "@gooddata/sdk-model";
import { ComparisonColorType } from "../../headlineHelper.js";

export const HEADLINE_VALUE_WRAPPER_SELECTOR = ".s-headline-value-wrapper";
export const HEADLINE_VALUE_SELECTOR = ".s-headline-value";
export const HEADLINE_ITEM_LINK_SELECTOR = ".s-headline-item-link";
export const HEADLINE_TITLE_WRAPPER_SELECTOR = ".s-headline-title-wrapper";
export const HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR = ".s-headline-paginated-compare-section";
export const HEADLINE_LINK_STYLE_UNDERLINE = ".s-headline-link-style-underline";

export const TEST_DATA_ITEM: IHeadlineDataItem = {
    localIdentifier: "mock_local_identifier",
    value: "130000",
    title: "data_item_title",
    format: "$#,##0.00",
    isDrillable: false,
};

export const TEST_BASE_HEADLINE_ITEM: IBaseHeadlineItem = {
    data: TEST_DATA_ITEM,
    elementType: "primaryValue",
    baseHeadlineDataItemComponent: BaseHeadlineDataItem,
};

export const TEST_COLOR_CONFIGS: IColorConfig = {
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

export const TEST_COMPARISON_PALETTE: IColorPalette = [
    {
        guid: ComparisonColorType.POSITIVE,
        fill: { r: 1, g: 1, b: 1 },
    },
    {
        guid: ComparisonColorType.NEGATIVE,
        fill: { r: 2, g: 2, b: 2 },
    },
    {
        guid: ComparisonColorType.EQUALS,
        fill: { r: 3, g: 3, b: 3 },
    },
];

export const TEST_RENDER_VALUE_SPECS: any = [
    ["Should have headline value written out as dash when empty string is provided", { value: "" }, "–"],
    ["Should have headline value written out as dash when null is provided", { value: null }, "–"],
    [
        "Should have headline value written out as specified in format when null value and format is provided",
        { value: null, format: "[=null]EMPTY" },
        "EMPTY",
    ],
    ["Should have headline value written out as dash when undefined is provided", { value: undefined }, "–"],
    ["Should have headline value written out as 0 when 0 is provided", { value: null }, "–"],
    [
        "Should have headline value written out as dash when non number string is provided",
        { value: "xyz" },
        "–",
    ],
    [
        "Should have headline value written out as it is when positive number string is provided without format",
        { value: "1234567890" },
        "1234567890",
    ],
    [
        "Should have headline value written out as it is when negative number string is provided without format",
        { value: "-12345678" },
        "-12345678",
    ],
    [
        "Should have headline value written out as specified in format when value and format is provided",
        { value: "130000", format: "$#,##0.00" },
        "$130,000.00",
    ],
    [
        "Should have headline value written out as specified in format when value and custom format is provided",
        { value: "1666.105", format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00" },
        "$1,666.11",
    ],
];

export const TEST_RENDER_COLOR_SPECS: any = [
    [
        "Should have color applied on headline value when custom format is provided and comparison color is disabled",
        { disabled: true },
        EvaluationType.POSITIVE_VALUE,
        "#9c46b5",
    ],
    [
        "Should have default positive color applied on headline value when comparison color is enabled",
        {},
        EvaluationType.POSITIVE_VALUE,
        "rgb(0, 193, 141)",
    ],
    [
        "Should have default negative color applied on headline value when comparison color is enabled",
        {},
        EvaluationType.NEGATIVE_VALUE,
        "rgb(229, 77, 64)",
    ],
    [
        "Should have default equals color applied on headline value when comparison color is enabled",
        {},
        EvaluationType.EQUALS_VALUE,
        "rgb(148, 161, 173)",
    ],
    [
        "Should have provided rgb positive color applied on headline value",
        TEST_COLOR_CONFIGS,
        EvaluationType.POSITIVE_VALUE,
        "rgb(5, 5, 5)",
    ],
    [
        "Should have provided palette negative color applied on headline value",
        TEST_COLOR_CONFIGS,
        EvaluationType.NEGATIVE_VALUE,
        "rgb(0, 193, 141)",
    ],
    [
        "Should have provided palette equals color applied on headline value",
        TEST_COLOR_CONFIGS,
        EvaluationType.EQUALS_VALUE,
        "rgb(148, 161, 173)",
    ],
    [
        "Should have color applied on headline value when custom format is provided and comparison color is disabled with custom palette",
        { disabled: true },
        EvaluationType.POSITIVE_VALUE,
        "#9c46b5",
        TEST_COMPARISON_PALETTE,
    ],
    [
        "Should have positive color applied on headline value when comparison color is enabled with custom palette",
        {},
        EvaluationType.POSITIVE_VALUE,
        "rgb(1, 1, 1)",
        TEST_COMPARISON_PALETTE,
    ],
    [
        "Should have negative color applied on headline value when comparison color is enabled with custom palette",
        {},
        EvaluationType.NEGATIVE_VALUE,
        "rgb(2, 2, 2)",
        TEST_COMPARISON_PALETTE,
    ],
    [
        "Should have equals color applied on headline value when comparison color is enabled with custom palette",
        {},
        EvaluationType.EQUALS_VALUE,
        "rgb(3, 3, 3)",
        TEST_COMPARISON_PALETTE,
    ],
    [
        "Should have provided rgb positive color applied on headline value with custom palette",
        TEST_COLOR_CONFIGS,
        EvaluationType.POSITIVE_VALUE,
        "rgb(5, 5, 5)",
        TEST_COMPARISON_PALETTE,
    ],
    [
        "Should have provided palette negative color applied on headline value with custom palette",
        TEST_COLOR_CONFIGS,
        EvaluationType.NEGATIVE_VALUE,
        "rgb(1, 1, 1)",
        TEST_COMPARISON_PALETTE,
    ],
    [
        "Should have provided palette equals color applied on headline value with custom palette",
        TEST_COLOR_CONFIGS,
        EvaluationType.EQUALS_VALUE,
        "rgb(3, 3, 3)",
        TEST_COMPARISON_PALETTE,
    ],
];
