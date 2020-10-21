// (C) 2020 GoodData Corporation
import { IResultHeader, isResultAttributeHeader } from "@gooddata/sdk-backend-spi";
import { createDateValueFormatter } from "./dateValueFormatter";
import { DateFormat } from "./dateValueParser";
import { createDefaultDateFormatter } from "./defaultDateFormatter";

export function transformDateFormat(resultHeader: IResultHeader, dateFormat?: DateFormat): IResultHeader {
    if (!isResultAttributeHeader(resultHeader) || !dateFormat) {
        return resultHeader;
    }
    try {
        const dateValueFormatter = createDateValueFormatter(createDefaultDateFormatter(dateFormat));
        return {
            attributeHeaderItem: {
                name: dateValueFormatter(resultHeader.attributeHeaderItem.name),
                uri: resultHeader.attributeHeaderItem.uri,
            },
        };
    } catch {
        return resultHeader;
    }
}
