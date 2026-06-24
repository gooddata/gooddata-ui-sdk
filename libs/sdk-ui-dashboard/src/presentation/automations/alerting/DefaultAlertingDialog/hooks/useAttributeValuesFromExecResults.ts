// (C) 2019-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import type { IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IAttributeDescriptor,
    type IAttributeMetadataObject,
    type IMeasure,
    areObjRefsEqual,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";
import { DataViewFacade, type IDataSeries } from "@gooddata/sdk-ui";

type IExecutionResultEnvelope = { isLoading?: boolean; executionResult?: IExecutionResult };

export type AttributeValue = {
    title: string;
    value: string;
    name: string;
};

export function useAttributeValuesFromExecResults(execResult: IExecutionResultEnvelope | undefined) {
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
                        setDataView(DataViewFacade.for(data));
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
    }, [execResult]);

    const getAttributeValues = useCallback(
        (attr: IAttributeMetadataObject): AttributeValue[] => {
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

            const header = findAttributeHeader2(dataView, attr);
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

function calculatePredictedValue(data: IDataSeries[], values?: string[] | null) {
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

function calculateValues(dataView: DataViewFacade | null, indexes: [number, number], value?: string | null) {
    return findAttributeValues(dataView, indexes)
        .map((v) => v.title)
        .filter((v) => {
            if (value) {
                return v === value;
            }
            return true;
        });
}

function findAttributeHeader(dataView: DataViewFacade | null, attr: IAttributeMetadataObject) {
    if (!dataView) {
        return null;
    }

    return (
        dataView
            .meta()
            .attributeDescriptors()
            .find((descriptor) => {
                return (
                    areObjRefsEqual(descriptor.attributeHeader.ref, attr.ref) ||
                    attr.displayForms.some((displayForm) => {
                        return areObjRefsEqual(descriptor.attributeHeader.ref, displayForm.ref);
                    })
                );
            }) ?? null
    );
}

function findAttributeHeader2(dataView: DataViewFacade | null, attr: IAttribute | undefined) {
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
