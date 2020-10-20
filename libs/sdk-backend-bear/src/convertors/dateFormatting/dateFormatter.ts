// (C) 2020 GoodData Corporation
import { GdcExecution } from "@gooddata/api-model-bear";
import { createDateValueFormatter } from "./dateValueFormatter";
import { DateFormat } from "./dateValueParser";
import { createDefaultDateFormatter } from "./defaultDateFormatter";

export function transformDateFormat(
    headerItem: GdcExecution.IResultHeaderItem,
    dateFormat: DateFormat,
): GdcExecution.IResultHeaderItem {
    if (!GdcExecution.isAttributeHeaderItem(headerItem)) {
        return headerItem;
    }
    try {
        const dateValueFormatter = createDateValueFormatter(createDefaultDateFormatter(dateFormat));
        return {
            attributeHeaderItem: {
                name: dateValueFormatter(headerItem.attributeHeaderItem.name),
                uri: headerItem.attributeHeaderItem.uri,
            },
        };
    } catch {
        return headerItem;
    }
}
