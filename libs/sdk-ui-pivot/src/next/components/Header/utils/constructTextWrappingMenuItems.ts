// (C) 2025 GoodData Corporation
import { type IntlShape } from "react-intl";

import { messages } from "../../../../locales.js";
import { type ITextWrappingMenuItem } from "../../../types/menu.js";
import { type PivotTableNextTextWrappingConfig } from "../../../types/textWrapping.js";

export interface ITextWrappingMenuOptions {
    includeHeaderWrapping?: boolean;
    includeCellWrapping?: boolean;
}

export function constructTextWrappingMenuItems(
    config: PivotTableNextTextWrappingConfig,
    intl: IntlShape,
    options: ITextWrappingMenuOptions = { includeHeaderWrapping: true, includeCellWrapping: true },
): ITextWrappingMenuItem[] {
    const items: ITextWrappingMenuItem[] = [];

    if (options.includeHeaderWrapping !== false) {
        items.push({
            type: "textWrapping",
            id: "header",
            title: intl.formatMessage(messages["textWrappingHeader"]),
            isActive: !!config.textWrapping?.wrapHeaderText,
        });
    }

    if (options.includeCellWrapping !== false) {
        items.push({
            type: "textWrapping",
            id: "cell",
            title: intl.formatMessage(messages["textWrappingCell"]),
            isActive: !!config.textWrapping?.wrapText,
        });
    }

    return items;
}
