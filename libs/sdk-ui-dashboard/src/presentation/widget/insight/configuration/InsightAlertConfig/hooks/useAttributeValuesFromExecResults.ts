// (C) 2019-2024 GoodData Corporation
import { useCallback, useEffect, useState } from "react";
import { DataViewFacade } from "@gooddata/sdk-ui";
import {
    areObjRefsEqual,
    IAttributeDescriptor,
    IAttributeMetadataObject,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";

import { IExecutionResultEnvelope } from "../../../../../../model/index.js";

export type AttributeValue = {
    title: string;
    value: string;
    name: string;
};

export function useAttributeValuesFromExecResults(execResult: IExecutionResultEnvelope | undefined) {
    const [isResultLoading, setIsResultLoading] = useState(!execResult || execResult.isLoading);
    const [dataView, setDataView] = useState<DataViewFacade | null>(null);

    useEffect(() => {
        if (execResult) {
            execResult.executionResult?.readAll().then((data) => {
                setDataView(DataViewFacade.for(data));
                setIsResultLoading(false);
            });
        }
    }, [execResult]);

    const getAttributeValues = useCallback(
        (attr: IAttributeMetadataObject): AttributeValue[] => {
            const header = findHeader(dataView, attr);
            const indexes = findDimIndexes(dataView, header);
            return findAttributeValues(dataView, indexes);
        },
        [dataView],
    );

    return {
        isResultLoading,
        getAttributeValues,
    };
}

function findHeader(dataView: DataViewFacade | null, attr: IAttributeMetadataObject) {
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
