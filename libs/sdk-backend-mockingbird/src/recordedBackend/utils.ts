// (C) 2019-2022 GoodData Corporation

import { IElementsQueryAttributeFilter, IElementsQueryOptions } from "@gooddata/sdk-backend-spi";
import { IMeasure, IRelativeDateFilter, ObjRef, objRefToString } from "@gooddata/sdk-model";
import SparkMD5 from "spark-md5";
import stringify from "json-stable-stringify";
import omitBy from "lodash/omitBy";
import isEmpty from "lodash/isEmpty";

/**
 * @internal
 */
export function identifierToRecording(id: string): string {
    return id.replace(/\./g, "_");
}

/**
 * This function should be used to obtain keys for certain {@link RecordedBackendConfig} settings.
 *
 * @internal
 */
export function objRefsToStringKey(refs: ObjRef[]): string {
    const sorted = refs.map(objRefToString).sort();
    return sorted.join("_");
}

/**
 * Calculates unique fingerprint for display form elements query params.
 * Returns empty string for empty params.
 *
 * @internal
 */
export function elementsQueryParamsFingerprint(
    params: {
        options?: IElementsQueryOptions;
        attributeFilters?: IElementsQueryAttributeFilter[];
        dateFilters?: IRelativeDateFilter[];
        measures?: IMeasure[];
    } = {},
) {
    const sanitizedParams = omitBy(params, isEmpty);
    return isEmpty(sanitizedParams) ? "" : SparkMD5.hash(stringify(params));
}

/**
 * Get unique elements query entry id for recorded elements.
 *
 * @internal
 */
export function elementsQueryParamsToElementsEntryId(
    params: {
        options?: IElementsQueryOptions;
        attributeFilters?: IElementsQueryAttributeFilter[];
        dateFilters?: IRelativeDateFilter[];
        measures?: IMeasure[];
    } = {},
) {
    const elementsQueryFp = elementsQueryParamsFingerprint(params);
    return elementsQueryFp ? `elements_${elementsQueryFp}` : "elements";
}

/**
 * Get unique elements request entry id for recorded elements.
 *
 * @internal
 */
export function elementsQueryParamsToRequestEntryId(
    params: {
        options?: IElementsQueryOptions;
        attributeFilters?: IElementsQueryAttributeFilter[];
        dateFilters?: IRelativeDateFilter[];
        measures?: IMeasure[];
    } = {},
) {
    const elementsQueryFp = elementsQueryParamsFingerprint(params);
    return elementsQueryFp ? `request_${elementsQueryFp}` : "request";
}
