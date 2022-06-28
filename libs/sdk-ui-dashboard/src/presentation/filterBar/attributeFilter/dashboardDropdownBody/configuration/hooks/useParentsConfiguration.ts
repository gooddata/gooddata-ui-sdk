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
    selectConnectingAttributesMatrix,
    selectFiltersToIndexMap,
} from "../../../../../../model";

export function useParentsConfiguration(
    neighborFilters: IDashboardAttributeFilter[],
    currentFilter: IDashboardAttributeFilter,
) {
    const { filterElementsBy, localIdentifier: currentFilterLocalId } = currentFilter.attributeFilter;
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const connectingAttributesMatrix = useDashboardSelector(selectConnectingAttributesMatrix);
    const idToIndexMap = useDashboardSelector(selectFiltersToIndexMap);

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
    }, []);

    const originalSelectedConnectingAttribute = useMemo<Map<string, ObjRef>>(() => {
        const originalConnectingAttributes = new Map<string, ObjRef>();

        for (const neighborFilter of neighborFilters) {
            invariant(
                neighborFilter.attributeFilter.localIdentifier,
                "Cannot initialize the attribute filter configuration panel, neighbor filter has missing 'localIdentifier' property",
            );
            originalConnectingAttributes.set(
                neighborFilter.attributeFilter.localIdentifier,
                getDefaultConnectingAttribute(
                    neighborFilter.attributeFilter.localIdentifier,
                    currentFilterLocalId!,
                ),
            );
        }

        return originalConnectingAttributes;
    }, []);

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
            invariant(
                connectingAttributesMatrix,
                "Cannot load 'connectingAttributesMatrix' property from filterContext state.",
            );

            const selectedConnectingAttribute = getDefaultConnectingAttribute(
                neighborFilterLocalId,
                currentFilterLocalId,
            );

            return {
                localIdentifier: neighborFilterLocalId,
                title: neighborFilterMetaData.attribute.title,
                isSelected,
                overAttributes: overAttributes,
                selectedConnectingAttribute,
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
    }, [parents]);

    const connectingAttributeChanged = useMemo<boolean>(() => {
        return parents.some(
            (parentItem) =>
                !areObjRefsEqual(
                    parentItem.selectedConnectingAttribute,
                    originalSelectedConnectingAttribute.get(parentItem.localIdentifier),
                ),
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
                            attributes: [parentItem.selectedConnectingAttribute],
                        },
                    });
                }
            });
            saveParentFilterCommand(currentFilter.attributeFilter.localIdentifier!, parentFilters);
        }
    }, [parents]);

    // helper functions
    function getDefaultConnectingAttribute(
        neighborFilterLocalId: string,
        currentFilterLocalId: string,
    ): ObjRef {
        const connectingAttributes = filterElementsBy?.find(
            (by) => by.filterLocalIdentifier === neighborFilterLocalId,
        )?.over.attributes;

        invariant(idToIndexMap, "Cannot load 'filtersToIndexMap' property from filterContext state.");

        const currentFilterIndex = idToIndexMap[currentFilterLocalId];
        const neighborFilterIndex = idToIndexMap[neighborFilterLocalId];

        invariant(
            currentFilterIndex !== undefined,
            "Cannot initialize the attribute filter configuration panel state for parents, current filter index not found in mapping",
        );

        invariant(
            neighborFilterIndex !== undefined,
            "Cannot initialize the attribute filter configuration panel state for parents, neighbor filter index not found in mapping",
        );

        return connectingAttributes
            ? connectingAttributes[0]
            : connectingAttributesMatrix![currentFilterIndex][neighborFilterIndex][0].ref;
    }

    return {
        parents,
        parentsConfigChanged,
        connectingAttributeChanged,
        onParentSelect,
        onConnectingAttributeChanged,
        onParentFiltersChange,
    };
}
