// (C) 2019-2020 GoodData Corporation

import {
    AttributeExecutionResultHeader,
    AttributeHeader,
    ExecutionResultHeader,
    ObjectIdentifier,
    ResultDimension,
} from "../generated/afm-rest-api";

export type ResultDimensionHeader = ResultDimension["headers"][number];

export function isAttributeHeader(header: ResultDimensionHeader): header is AttributeHeader {
    return header && (header as AttributeHeader).attributeHeader !== undefined;
}

export const isObjectIdentifier = (value: unknown): value is ObjectIdentifier => {
    return !!(
        (value as Partial<ObjectIdentifier>)?.identifier?.id &&
        (value as Partial<ObjectIdentifier>)?.identifier?.type
    );
};

export function isResultAttributeHeader(
    header: ExecutionResultHeader,
): header is AttributeExecutionResultHeader {
    return (header as AttributeExecutionResultHeader).attributeHeader !== undefined;
}
