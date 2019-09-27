// (C) 2007-2018 GoodData Corporation
import { IMappingHeader } from "../interfaces/MappingHeader";
import {
    isAttributeHeader,
    isMeasureHeaderItem,
    isResultAttributeHeaderItem,
} from "@gooddata/sdk-backend-spi";

export function hasMappingHeaderLocalIdentifier(header: IMappingHeader): boolean {
    return isAttributeHeader(header) || isMeasureHeaderItem(header);
}

export function getMappingHeaderLocalIdentifier(header: IMappingHeader): string {
    if (isAttributeHeader(header)) {
        return header.attributeHeader.localIdentifier;
    }
    if (isMeasureHeaderItem(header)) {
        return header.measureHeaderItem.localIdentifier;
    }

    throw new Error(`Mapping header of type "${Object.keys(header)}" has no localIdentifier`);
}

export function getMappingHeaderName(header: IMappingHeader): string {
    if (isAttributeHeader(header)) {
        return header.attributeHeader.formOf.name;
    }
    if (isResultAttributeHeaderItem(header)) {
        return header.attributeHeaderItem.name;
    }
    if (isMeasureHeaderItem(header)) {
        return header.measureHeaderItem.name;
    }
}

export function getMappingHeaderIdentifier(header: IMappingHeader): string {
    if (isAttributeHeader(header)) {
        return header.attributeHeader.identifier;
    }
    if (isMeasureHeaderItem(header)) {
        return header.measureHeaderItem.identifier;
    }
    throw new Error(`Mapping header of type "${Object.keys(header)}" has no identifier`);
}

export function getMappingHeaderUri(header: IMappingHeader): string {
    if (isAttributeHeader(header)) {
        return header.attributeHeader.uri;
    }
    if (isResultAttributeHeaderItem(header)) {
        return header.attributeHeaderItem.uri;
    }
    if (isMeasureHeaderItem(header)) {
        return header.measureHeaderItem.uri;
    }
}
