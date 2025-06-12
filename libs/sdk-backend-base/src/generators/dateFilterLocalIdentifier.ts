// (C) 2025 GoodData Corporation

import { ObjRef, objRefToString } from "@gooddata/sdk-model";

/**
 * Date filter local identifier generator.
 *
 * The identifiers are predictable.
 *
 * @param index - The index of the date filter in the list of filters.
 * @param dateDatasetRef - Optional reference to the date dataset.
 * @returns A string representing the generated local identifier.
 *
 * @internal
 */
export const generateDateFilterLocalIdentifier = (index: number, dateDatasetRef?: ObjRef): string => {
    return dateDatasetRef ? `${objRefToString(dateDatasetRef)}_${index}_dateFilter` : `${index}_dateFilter`;
};
