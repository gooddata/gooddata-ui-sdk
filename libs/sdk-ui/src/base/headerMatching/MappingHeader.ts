// (C) 2007-2022 GoodData Corporation
import {
    IMeasureDescriptor,
    IAttributeDescriptor,
    IResultAttributeHeader,
    ITotalDescriptor,
    isAttributeDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";

/**
 * @privateRemarks
 * TODO: SDK8: remove this, replace with something more meaningful
 *
 * @public
 */
export type IMappingHeader =
    | IAttributeDescriptor
    | IResultAttributeHeader
    | IMeasureDescriptor
    | ITotalDescriptor;

//
//
//

/**
 * @internal
 */
export function hasMappingHeaderLocalIdentifier(header: IMappingHeader): boolean {
    return isAttributeDescriptor(header) || isMeasureDescriptor(header);
}

/**
 * @internal
 */
export function getMappingHeaderLocalIdentifier(header: IMappingHeader): string {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.localIdentifier;
    } else if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.localIdentifier;
    }

    throw new Error(`Mapping header of type "${Object.keys(header)}" has no localIdentifier`);
}

/**
 * @internal
 */
export function getMappingHeaderName(header: IMappingHeader): string | undefined {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.formOf.name;
    } else if (isResultAttributeHeader(header)) {
        return header.attributeHeaderItem.name;
    } else if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.name;
    }
}

/**
 * @internal
 */
export function getMappingHeaderIdentifier(header: IMappingHeader): string | undefined {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.identifier;
    } else if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.identifier;
    }
    throw new Error(`Mapping header of type "${Object.keys(header)}" has no identifier`);
}

/**
 * @internal
 */
export function getMappingHeaderUri(header: IMappingHeader): string | undefined {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.uri;
    } else if (isResultAttributeHeader(header)) {
        return header.attributeHeaderItem.uri;
    } else if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.uri;
    }
}
