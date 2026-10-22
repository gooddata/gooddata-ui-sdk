// (C) 2019-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import type { IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IAttributeDescriptor,
    type IMeasure,
    type ISeparators,
    areObjRefsEqual,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";
import {
    DataViewFacade,
    type IDataSeries,
    createNumberFormatter,
    formatAttributeHeaderValues,
} from "@gooddata/sdk-ui";

/**
 * Formatting applied to attribute element values read from the execution result.
 *
 * @internal
 */
export interface IAttributeValuesFormatting {
    separators?: ISeparators;
}

type IExecutionResultEnvelope = { isLoading?: boolean; executionResult?: IExecutionResult };

/**
 * One distinct value of an attribute in the widget's execution result, as offered by the alert's
 * attribute-value picker.
 *
 * @beta
 */
export type AttributeValue = {
    /**
     * Display title: the formatted element name when the result has one, the raw name otherwise.
     */
    title: string;
    /**
     * The element URI; this is what the alert stores.
     */
    value: string;
    /**
     * The raw element name.
     */
    name: string;
};

/**
 * Reads the widget's execution result and exposes the attribute values and measure values in it.
 *
 * @internal
 */
export function useAttributeValuesFromExecResults(
    execResult: IExecutionResultEnvelope | undefined,
    formatting?: IAttributeValuesFormatting,
) {
    const separators = formatting?.separators;
    // Derive loading from the envelope's own isLoading flag, not from the
    // presence of executionResult: an errored execution has no executionResult
    // but is no longer loading, and there is no readAll() promise to clear the
    // flag, so keying off executionResult would leave it stuck true forever.
    const [isResultLoading, setIsResultLoading] = useState(!execResult || !!execResult.isLoading);
    const [dataView, setDataView] = useState<DataViewFacade | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (execResult?.executionResult) {
            setIsResultLoading(true);
            setDataView(null);
            void execResult.executionResult
                .readAll()
                .then((data) => {
                    if (!cancelled) {
                        setDataView(
                            DataViewFacade.for(
                                formatAttributeHeaderValues(data, createNumberFormatter(separators)),
                            ),
                        );
                        setIsResultLoading(false);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setIsResultLoading(false);
                    }
                });
        } else {
            // No execution result to read (terminal error, or none yet): reflect
            // the envelope's own loading flag so an errored execution doesn't stay
            // stuck loading.
            setDataView(null);
            setIsResultLoading(!execResult || !!execResult.isLoading);
        }
        return () => {
            cancelled = true;
        };
    }, [execResult, separators]);

    const getAttributeValues = useCallback(
        (attr: IAttribute): AttributeValue[] => {
            const header = findAttributeHeader(dataView, attr);
            const indexes = findDimIndexes(dataView, header);
            return findAttributeValues(dataView, indexes);
        },
        [dataView],
    );

    const getMetricValue = useCallback(
        (measure?: IMeasure, attr?: IAttribute, value?: string | null) => {
            if (!measure || !dataView) {
                return undefined;
            }

            const data = Array.from(dataView.data().series().allForMeasure(measure));
            if (!attr && !value) {
                return calculatePredictedValue(data);
            }

            const header = findAttributeHeader(dataView, attr);
            const indexes = findDimIndexes(dataView, header);

            const values = calculateValues(dataView, indexes, value);
            const result = calculatePredictedValue(data, values);
            return result === 0 ? undefined : result;
        },
        [dataView],
    );

    return {
        isResultLoading,
        getAttributeValues,
        getMetricValue,
    };
}

/**
 * Sums the measure values of the series scoped by the given raw attribute values.
 *
 * @remarks
 * Matching works on raw element names: `scopeTitles()` return raw names, so the values passed in must be
 * raw too, never the formatted titles shown in the UI.
 *
 * @internal exported for tests
 */
export function calculatePredictedValue(data: IDataSeries[], values?: string[] | null) {
    return data.reduce((total, series) => {
        return (
            total +
            Array.from(series).reduce((acc, item) => {
                if (item.total) {
                    return acc;
                }
                if (
                    !values ||
                    item.seriesDesc.scopeTitles().some((title) => title && values.includes(title))
                ) {
                    return acc + parseFloat(String(item.rawValue || "0"));
                }
                return acc;
            }, 0)
        );
    }, 0);
}

/**
 * Raw names of the attribute elements to predict the value for: the element the filter value names, or
 * every element when there is none.
 *
 * @remarks
 * The filter value is a raw element value, so it is matched against the raw name and uri, not against the
 * formatted title (dates, numeric computed attributes) shown in the UI; the raw names are returned to match
 * the raw scope titles in {@link calculatePredictedValue}.
 *
 * @internal exported for tests
 */
export function calculateValues(
    dataView: DataViewFacade | null,
    indexes: [number, number],
    value?: string | null,
): string[] {
    return findAttributeValues(dataView, indexes)
        .filter((v) => !value || v.name === value || v.value === value)
        .map((v) => v.name);
}

// By display form, not catalog attribute: two display forms of one attribute are two descriptors.
function findAttributeHeader(dataView: DataViewFacade | null, attr: IAttribute | undefined) {
    if (!dataView || !attr) {
        return null;
    }

    return (
        dataView
            .meta()
            .attributeDescriptors()
            .find((descriptor) => {
                return areObjRefsEqual(descriptor.attributeHeader.ref, attr.attribute.displayForm);
            }) ?? null
    );
}

/**
 * This will find attribute elements array indexes for provided attribute descriptor in the execution results data view.
 * @param dataView - DataViewFacade object to work with execution results data
 * @param header - attribute header to find indexes for
 */
function findDimIndexes(
    dataView: DataViewFacade | null,
    header: IAttributeDescriptor | null,
): [number, number] {
    const def = [-1, -1] as [number, number];

    if (!dataView || !header) {
        return def;
    }

    return dataView.definition.dimensions.reduce((acc, dimension, i) => {
        const j = dimension.itemIdentifiers.findIndex((itemIdentifier) => {
            return itemIdentifier === header.attributeHeader.localIdentifier;
        });

        if (j !== -1) {
            return [i, j];
        }
        return acc;
    }, def);
}

/**
 * Based on found indexes in the execution results data view, this function will return attribute elements
 * that are present in the data view. Values are unique by their uri.
 * @param dataView - DataViewFacade object to work with execution results data
 * @param dimensionIndex - index of the dimension
 * @param elementsIndex - index of the item in the dimension
 */
function findAttributeValues(
    dataView: DataViewFacade | null,
    [dimensionIndex, elementsIndex]: [number, number],
) {
    const headers = dataView?.meta().allHeaders() ?? [];
    const data = (headers[dimensionIndex] ?? [])[elementsIndex] ?? [];

    const values = data
        .map((item) => {
            if (isResultAttributeHeader(item)) {
                return {
                    title: item.attributeHeaderItem.formattedName ?? item.attributeHeaderItem.name,
                    value: item.attributeHeaderItem.uri,
                    name: item.attributeHeaderItem.name,
                };
            }
            return null;
        })
        .filter(Boolean) as AttributeValue[];

    return values.filter((value, index, self) => {
        return self.findIndex((v) => v.value === value.value) === index;
    });
}
