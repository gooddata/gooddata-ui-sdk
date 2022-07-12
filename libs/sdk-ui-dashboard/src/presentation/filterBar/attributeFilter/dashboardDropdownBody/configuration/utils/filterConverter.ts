// (C) 2022 GoodData Corporation

import {
    areObjRefsEqual,
    IAttributeDisplayFormMetadataObject,
    IDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { ConnectingAttributeMatrix, isNonEmptyConnectingAttribute } from "../../../../../../model";
import { IConfigurationParentItem } from "../parentFilters/ParentFiltersListItem";

import flatMap from "lodash/flatMap";
import invariant from "ts-invariant";

export function convertDashboardFilterToParentItem(
    filter: IDashboardAttributeFilter,
    filtersMeta: IAttributeDisplayFormMetadataObject[],
    filtersToIndexMap: Map<string, number>,
    connectingAttributesMatrix: ConnectingAttributeMatrix,
): IConfigurationParentItem | undefined {
    const displayForm = filtersMeta.find((filterMeta) =>
        areObjRefsEqual(filterMeta.ref, filter.attributeFilter.displayForm),
    );

    const currentFilterIndex = filtersToIndexMap.get(filter.attributeFilter.localIdentifier!);

    invariant(
        currentFilterIndex !== undefined,
        "The index for the current filter could not be found in the map.",
    );

    const connectingAttributes = flatMap(connectingAttributesMatrix[currentFilterIndex]).filter(
        isNonEmptyConnectingAttribute,
    );

    if (!displayForm) {
        return;
    }

    return {
        title: displayForm.title,
        ref: filter.attributeFilter.displayForm,
        isSelected: true,
        isCircularDependency: false,
        connectingAttributes: connectingAttributes,
        selectedConnectingAttributeRef: filter.attributeFilter.displayForm,
        meta: displayForm,
    };
}
