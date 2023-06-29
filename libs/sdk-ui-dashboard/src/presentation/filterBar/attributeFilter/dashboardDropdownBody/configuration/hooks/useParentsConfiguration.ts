// (C) 2022 GoodData Corporation
import { IDashboardAttributeFilter, IDashboardAttributeFilterParent, ObjRef } from "@gooddata/sdk-model";
import { useState, useMemo, useCallback } from "react";
import { invariant } from "ts-invariant";
import isEqual from "lodash/isEqual.js";
import {
    setAttributeFilterParents,
    useDispatchDashboardCommand,
    IDashboardAttributeFilterParentItem,
} from "../../../../../../model/index.js";
import { useOriginalConfigurationState } from "./useOriginalConfigurationState.js";

export function useParentsConfiguration(
    neighborFilters: IDashboardAttributeFilter[],
    currentFilter: IDashboardAttributeFilter,
) {
    const { filterElementsBy, localIdentifier: currentFilterLocalId } = currentFilter.attributeFilter;

    invariant(
        currentFilterLocalId,
        "Cannot initialize the attribute filter configuration panel, filter has missing 'localIdentifier' property",
    );

    const saveParentFilterCommand = useDispatchDashboardCommand(setAttributeFilterParents);

    const originalState = useOriginalConfigurationState(neighborFilters, filterElementsBy);

    const [parents, setParents] = useState<IDashboardAttributeFilterParentItem[]>(originalState);

    function onParentSelect(localIdentifier: string, isSelected: boolean, overAttributes: ObjRef[]) {
        const changedParentIndex = parents.findIndex((parent) => parent.localIdentifier === localIdentifier);
        const changedItem = { ...parents[changedParentIndex] };

        changedItem.isSelected = isSelected;
        changedItem.overAttributes = overAttributes;

        if (isSelected) {
            changedItem.selectedConnectingAttribute = overAttributes[0];
        } else {
            // set connecting attributes to undefined to properly check for
            // state updates
            changedItem.selectedConnectingAttribute = undefined;
            changedItem.overAttributes = undefined;
        }

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

    const configurationChanged = useMemo<boolean>(() => {
        return !isEqual(parents, originalState);
    }, [parents, originalState]);

    const onParentFiltersChange = useCallback(() => {
        // dispatch the command only if the configuration changed
        if (configurationChanged) {
            const parentFilters: IDashboardAttributeFilterParent[] = [];
            parents.forEach((parentItem) => {
                if (parentItem.isSelected && parentItem.overAttributes?.length) {
                    const overAttribute =
                        parentItem.selectedConnectingAttribute || parentItem.overAttributes[0];
                    parentFilters.push({
                        filterLocalIdentifier: parentItem.localIdentifier,
                        over: {
                            attributes: [overAttribute],
                        },
                    });
                }
            });
            saveParentFilterCommand(currentFilter.attributeFilter.localIdentifier!, parentFilters);
        }
    }, [parents, configurationChanged, currentFilter, saveParentFilterCommand]);

    const onConfigurationClose = useCallback(() => {
        setParents(originalState);
    }, [originalState]);

    return {
        parents,
        configurationChanged,
        onParentSelect,
        onConnectingAttributeChanged,
        onParentFiltersChange,
        onConfigurationClose,
    };
}
