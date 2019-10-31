// (C) 2007-2018 GoodData Corporation
import { IMappingHeader } from "../interfaces/MappingHeader";
import {
    isAttributeDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-backend-spi";

export function hasMappingHeaderLocalIdentifier(header: IMappingHeader): boolean {
    return isAttributeDescriptor(header) || isMeasureDescriptor(header);
}

export function getMappingHeaderLocalIdentifier(header: IMappingHeader): string {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.localIdentifier;
    }
    if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.localIdentifier;
    }

    throw new Error(`Mapping header of type "${Object.keys(header)}" has no localIdentifier`);
}

export function getMappingHeaderName(header: IMappingHeader): string {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.formOf.name;
    }
    if (isResultAttributeHeader(header)) {
        return header.attributeHeaderItem.name;
    }
    if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.name;
    }
}

export function getMappingHeaderIdentifier(header: IMappingHeader): string {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.identifier;
    }
    if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.identifier;
    }
    throw new Error(`Mapping header of type "${Object.keys(header)}" has no identifier`);
}

export function getMappingHeaderUri(header: IMappingHeader): string {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.uri;
    }
    if (isResultAttributeHeader(header)) {
        return header.attributeHeaderItem.uri;
    }
    if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.uri;
    }
}
