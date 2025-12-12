// (C) 2024 GoodData Corporation
import { type ObjRef, objRefToString } from "@gooddata/sdk-model";

export const generateFilterLocalIdentifier = (ref: ObjRef, index: number): string => {
    return `${objRefToString(ref)}_${index}_attributeFilter`;
};
