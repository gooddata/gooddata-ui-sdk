// (C) 2025 GoodData Corporation
import { IntlShape } from "react-intl";

import { messages } from "../../../../locales.js";
import { ITextWrappingMenuItem } from "../../../types/menu.js";
import { PivotTableNextTextWrappingConfig } from "../../../types/textWrapping.js";

export function constructTextWrappingMenuItems(
    config: PivotTableNextTextWrappingConfig,
    intl: IntlShape,
): ITextWrappingMenuItem[] {
    return [
        {
            type: "textWrapping",
            id: "header",
            title: intl.formatMessage(messages["textWrappingHeader"]),
            isActive: !!config.textWrapping?.wrapHeaderText,
        },
        {
            type: "textWrapping",
            id: "cell",
            title: intl.formatMessage(messages["textWrappingCell"]),
            isActive: !!config.textWrapping?.wrapText,
        },
    ];
}
