// (C) 2025 GoodData Corporation
import { ITextWrappingMenuItem } from "../../../types/menu.js";
import { PivotTableNextTextWrappingConfig } from "../../../types/textWrapping.js";

export function constructTextWrappingMenuItems(
    config: PivotTableNextTextWrappingConfig,
): ITextWrappingMenuItem[] {
    return [
        {
            type: "textWrapping",
            id: "header",
            title: "Header",
            isActive: !!config.textWrapping?.wrapHeaderText,
        },
        {
            type: "textWrapping",
            id: "cell",
            title: "Cell",
            isActive: !!config.textWrapping?.wrapText,
        },
    ];
}
