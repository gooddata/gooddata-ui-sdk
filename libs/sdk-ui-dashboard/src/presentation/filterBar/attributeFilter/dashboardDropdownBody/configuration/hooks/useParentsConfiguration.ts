// (C) 2022 GoodData Corporation
import {
    areObjRefsEqual,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterParent,
    ObjRef,
} from "@gooddata/sdk-model";
import { useState, useMemo, useCallback } from "react";
import invariant from "ts-invariant";
import {
    setAttributeFilterParents,
    useDashboardSelector,
    useDispatchDashboardCommand,
    selectCatalogAttributes,
    IDashboardAttributeFilterParentItem,
} from "../../../../../../model";

export function useParentsConfiguration(
    neighborFilters: IDashboardAttributeFilter[],
    currentFilter: IDashboardAttributeFilter,
) {
    const { filterElementsBy, localIdentifier: currentFilterLocalId } = currentFilter.attributeFilter;
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);

    const saveParentFilterCommand = useDispatchDashboardCommand(setAttributeFilterParents);

    const originalParentFilterSelection = useMemo<Map<string, boolean>>(() => {
        const originalSelection = new Map<string, boolean>();

        neighborFilters.forEach((neighborFilter) => {
            const neighborFilterLocalId = neighborFilter.attributeFilter.localIdentifier;
            invariant(
                neighborFilterLocalId,
                "Cannot initialize the attribute filter configuration panel, neighbor filter has missing 'localIdentifier' property",
            );

            const isSelected =
                filterElementsBy?.some((by) => by.filterLocalIdentifier === neighborFilterLocalId) || false;

            originalSelection.set(neighborFilterLocalId, isSelected);
        });

        return originalSelection;
    }, [filterElementsBy, neighborFilters]);

    const [parents, setParents] = useState<IDashboardAttributeFilterParentItem[]>(() => {
        return neighborFilters.map((neighborFilter) => {
            const neighborFilterLocalId = neighborFilter.attributeFilter.localIdentifier;
            const neighborFilterDisplayForm = neighborFilter.attributeFilter.displayForm;

            const isSelected =
                filterElementsBy?.some((by) => by.filterLocalIdentifier === neighborFilterLocalId) || false;

            const overAttributes = filterElementsBy?.find(
                (by) => by.filterLocalIdentifier === neighborFilterLocalId,
            )?.over.attributes;

            const neighborFilterMetaData = catalogAttributes.find((md) =>
                md.displayForms.some((df) => areObjRefsEqual(df.ref, neighborFilterDisplayForm)),
            );

            invariant(
                currentFilterLocalId,
                "Cannot initialize the attribute filter configuration panel, current filter has missing 'localIdentifier' property.",
            );
            invariant(
                neighborFilterLocalId,
                "Cannot initialize the attribute filter configuration panel, neighbor filter has missing 'localIdentifier' property.",
            );
            invariant(neighborFilterMetaData, "Cannot load metadata for the neighbor filter attribute.");

            return {
                localIdentifier: neighborFilterLocalId,
                title: neighborFilterMetaData.attribute.title,
                isSelected,
                overAttributes: overAttributes,
                selectedConnectingAttribute: undefined,
            };
        });
    });

    function onParentSelect(localIdentifier: string, isSelected: boolean, overAttributes: ObjRef[]) {
        const changedParentIndex = parents.findIndex((parent) => parent.localIdentifier === localIdentifier);
        const changedItem = { ...parents[changedParentIndex] };

        changedItem.isSelected = isSelected;
        changedItem.overAttributes = overAttributes;

        const changedParentItems = [...parents];
        changedParentItems[changedParentIndex] = changedItem;

        setParents(changedParentItems);
    }

    function onConnectingAttributeChanged(localIdentifier: string, selectedAttribute: ObjRef) {
        const changedParentIndex = parents.findIndex((parent) => parent.localIdentifier === localIdentifier);
        const changedItem = { ...parents[changedParentIndex] };

        changedItem.selectedConnectingAttribute = selectedAttribute;

        const changedParentItems = [...parents];
        changedParentItems[changedParentIndex] = changedItem;

        setParents(changedParentItems);
    }

    const parentsConfigChanged = useMemo<boolean>(() => {
        return parents.some(
            (parentItem) =>
                parentItem.isSelected !== originalParentFilterSelection.get(parentItem.localIdentifier),
        );
    }, [parents, originalParentFilterSelection]);

    const connectingAttributeChanged = useMemo<boolean>(() => {
        return parents.some(
            (parentItem) => !areObjRefsEqual(parentItem.selectedConnectingAttribute, undefined),
        );
    }, [parents]);

    const onParentFiltersChange = useCallback(() => {
        // dispatch the command only if the configuration changed
        if (parentsConfigChanged || connectingAttributeChanged) {
            const parentFilters: IDashboardAttributeFilterParent[] = [];
            parents.forEach((parentItem) => {
                if (parentItem.isSelected && parentItem.overAttributes?.length) {
                    parentFilters.push({
                        filterLocalIdentifier: parentItem.localIdentifier,
                        over: {
                            attributes: [],
                        },
                    });
                }
            });
            saveParentFilterCommand(currentFilter.attributeFilter.localIdentifier!, parentFilters);
        }
    }, [parents, connectingAttributeChanged, currentFilter, parentsConfigChanged, saveParentFilterCommand]);

    return {
        parents,
        parentsConfigChanged,
        connectingAttributeChanged,
        onParentSelect,
        onConnectingAttributeChanged,
        onParentFiltersChange,
    };
}
