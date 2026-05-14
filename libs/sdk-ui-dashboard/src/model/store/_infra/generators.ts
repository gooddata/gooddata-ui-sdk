// (C) 2024-2026 GoodData Corporation

import { type ObjRef, objRefToString } from "@gooddata/sdk-model";

export const generateFilterLocalIdentifier = (ref: ObjRef, index: number): string => {
    return `${objRefToString(ref)}_${index}_attributeFilter`;
};

export const generateMeasureValueFilterLocalIdentifier = (ref: ObjRef, index: number): string => {
    return `${objRefToString(ref)}_${index}_measureValueFilter`;
};
