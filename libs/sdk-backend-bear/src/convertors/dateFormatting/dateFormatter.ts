// (C) 2020 GoodData Corporation
import {
    IAttributeDescriptor,
    IDimensionDescriptor,
    IResultHeader,
    isAttributeDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-backend-spi";
import { createDateValueFormatter } from "./dateValueFormatter";
import { DateFormat, DEFAULT_DATE_FORMAT } from "./dateValueParser";
import { createDefaultDateFormatter } from "./defaultDateFormatter";

export function findDateAttributeUri(dimensions: IDimensionDescriptor[]): string | undefined {
    const dateAttrDescriptor = dimensions
        .reduce((attrDimensions: IAttributeDescriptor[], dimensionItem: IDimensionDescriptor) => {
            attrDimensions.push(...dimensionItem.headers.filter(isAttributeDescriptor));
            return attrDimensions;
        }, [])
        .find(
            (attrDescriptor: IAttributeDescriptor): boolean =>
                attrDescriptor.attributeHeader.type === "GDC.time.day_us",
        );
    if (!dateAttrDescriptor) {
        return undefined;
    }
    return dateAttrDescriptor.attributeHeader.formOf.uri;
}

export function transformDateFormat(
    resultHeader: IResultHeader,
    dateAttributeUri?: string,
    dateFormat?: DateFormat,
): IResultHeader {
    if (
        !isResultAttributeHeader(resultHeader) ||
        !dateAttributeUri ||
        !dateFormat ||
        dateFormat === DEFAULT_DATE_FORMAT
    ) {
        return resultHeader;
    }
    const resultHeaderUri = resultHeader.attributeHeaderItem.uri;
    if (!resultHeaderUri.startsWith(dateAttributeUri)) {
        return resultHeader;
    }
    try {
        const dateValueFormatter = createDateValueFormatter(createDefaultDateFormatter(dateFormat));
        return {
            attributeHeaderItem: {
                name: dateValueFormatter(resultHeader.attributeHeaderItem.name),
                uri: resultHeaderUri,
            },
        };
    } catch {
        return resultHeader;
    }
}
