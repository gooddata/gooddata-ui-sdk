// (C) 2023 GoodData Corporation
import { IHeadlineDataItem } from "../../../interfaces/Headlines.js";
import { IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import BaseHeadlineDataItem from "../baseHeadlineDataItems/BaseHeadlineDataItem.js";

export const HEADLINE_VALUE_WRAPPER_SELECTOR = ".s-headline-value-wrapper";
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

export const TEST_RENDER_VALUE_SPECS: any = [
    ["Should have primary value written out as dash when empty string is provided", { value: "" }, "–"],
    ["Should have primary value written out as dash when null is provided", { value: null }, "–"],
    [
        "Should have primary value written out as specified in format when null value and format is provided",
        { value: null, format: "[=null]EMPTY" },
        "EMPTY",
    ],
    ["Should have primary value written out as dash when undefined is provided", { value: undefined }, "–"],
    [
        "Should have primary value written out as dash when non number string is provided",
        { value: "xyz" },
        "–",
    ],
    [
        "Should have primary value written out as it is when positive number string is provided without format",
        { value: "1234567890" },
        "1234567890",
    ],
    [
        "Should have primary value written out as it is when negative number string is provided without format",
        { value: "-12345678" },
        "-12345678",
    ],
];
