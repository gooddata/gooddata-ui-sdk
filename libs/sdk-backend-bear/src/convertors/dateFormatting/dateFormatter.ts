// (C) 2020-2023 GoodData Corporation
import {
    IDimensionDescriptor,
    IAttributeDescriptor,
    IResultHeader,
    isAttributeDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";
import { createDateValueFormatter } from "./dateValueFormatter.js";
import { DateFormat, DEFAULT_DATE_FORMAT } from "./dateValueParser.js";
import { createDefaultDateFormatter } from "./defaultDateFormatter.js";

// TODO: rewrite. move search for date attributes into data view facade / meta() section
export function findDateAttributeUris(dimensions: IDimensionDescriptor[]): string[] {
    const dateAttrsDescriptor = dimensions
        .reduce((attrDimensions: IAttributeDescriptor[], dimensionItem: IDimensionDescriptor) => {
            attrDimensions.push(...dimensionItem.headers.filter(isAttributeDescriptor));
            return attrDimensions;
        }, [])
        .filter(
            (attrDescriptor: IAttributeDescriptor): boolean =>
                attrDescriptor.attributeHeader.type === "GDC.time.day_us",
        );
    return dateAttrsDescriptor.map((dateAttrDescriptor) => dateAttrDescriptor.attributeHeader.formOf.uri);
}

export function transformDateFormat(
    resultHeader: IResultHeader,
    dateAttributeUris?: string[],
    dateFormat?: DateFormat,
): IResultHeader {
    if (
        !isResultAttributeHeader(resultHeader) ||
        !dateAttributeUris?.length ||
        !dateFormat ||
        dateFormat === DEFAULT_DATE_FORMAT
    ) {
        return resultHeader;
    }
    const resultHeaderUri = resultHeader.attributeHeaderItem.uri;
    const foundUri = dateAttributeUris.some((dateAttributeUri) =>
        resultHeaderUri?.startsWith(dateAttributeUri),
    );
    if (!foundUri) {
        return resultHeader;
    }
    try {
        const dateValueFormatter = createDateValueFormatter(createDefaultDateFormatter(dateFormat));
        return {
            attributeHeaderItem: {
                name: dateValueFormatter(resultHeader.attributeHeaderItem.name!),
                uri: resultHeaderUri,
            },
        };
    } catch {
        return resultHeader;
    }
}
