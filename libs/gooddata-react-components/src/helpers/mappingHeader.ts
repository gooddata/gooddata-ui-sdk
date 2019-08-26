// (C) 2007-2018 GoodData Corporation
import {
    IMappingHeader,
    isMappingHeaderAttribute,
    isMappingHeaderAttributeItem,
    isMappingHeaderMeasureItem,
} from "../interfaces/MappingHeader";

export function hasMappingHeaderLocalIdentifier(header: IMappingHeader): boolean {
    return isMappingHeaderAttribute(header) || isMappingHeaderMeasureItem(header);
}

export function getMappingHeaderLocalIdentifier(header: IMappingHeader): string {
    if (isMappingHeaderAttribute(header)) {
        return header.attributeHeader.localIdentifier;
    }
    if (isMappingHeaderMeasureItem(header)) {
        return header.measureHeaderItem.localIdentifier;
    }

    throw new Error(`Mapping header of type "${Object.keys(header)}" has no localIdentifier`);
}

export function getMappingHeaderName(header: IMappingHeader): string {
    if (isMappingHeaderAttribute(header)) {
        return header.attributeHeader.formOf.name;
    }
    if (isMappingHeaderAttributeItem(header)) {
        return header.attributeHeaderItem.name;
    }
    if (isMappingHeaderMeasureItem(header)) {
        return header.measureHeaderItem.name;
    }
}

export function getMappingHeaderIdentifier(header: IMappingHeader): string {
    if (isMappingHeaderAttribute(header)) {
        return header.attributeHeader.identifier;
    }
    if (isMappingHeaderMeasureItem(header)) {
        return header.measureHeaderItem.identifier;
    }
    throw new Error(`Mapping header of type "${Object.keys(header)}" has no identifier`);
}

export function getMappingHeaderUri(header: IMappingHeader): string {
    if (isMappingHeaderAttribute(header)) {
        return header.attributeHeader.uri;
    }
    if (isMappingHeaderAttributeItem(header)) {
        return header.attributeHeaderItem.uri;
    }
    if (isMappingHeaderMeasureItem(header)) {
        return header.measureHeaderItem.uri;
    }
}
