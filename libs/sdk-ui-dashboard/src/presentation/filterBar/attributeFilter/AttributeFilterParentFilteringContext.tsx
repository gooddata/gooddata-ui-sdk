// (C) 2022 GoodData Corporation
import React, { useContext, useMemo, useCallback } from "react";
import { filterObjRef, IDashboardAttributeFilter } from "@gooddata/sdk-model";
import { selectOtherContextAttributeFilters, useDashboardSelector } from "../../../model";
import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter";
import { useParentsConfiguration } from "./dashboardDropdownBody/configuration/hooks/useParentsConfiguration";
import { useDisplayFormConfiguration } from "./dashboardDropdownBody/configuration/hooks/useDisplayFormConfiguration";

/**
 * @internal
 */
export type IAttributeFilterParentFiltering = ReturnType<typeof useParentsConfiguration> &
    ReturnType<typeof useDisplayFormConfiguration> & {
        onConfigurationSave: () => void;
        showDisplayFormPicker: boolean;
    };

export const AttributeFilterParentFiltering = React.createContext<IAttributeFilterParentFiltering>(
    null as any,
); // TODO: Fix typing

AttributeFilterParentFiltering.displayName = "AttributeFilterParentFiltering";

/**
 * @internal
 */
export const useAttributeFilterParentFiltering = (): IAttributeFilterParentFiltering =>
    useContext(AttributeFilterParentFiltering);

/**
 * @internal
 */
export type IAttributeFilterParentFilteringProviderProps = {
    filter: IDashboardAttributeFilter;
};

/**
 * @internal
 */
export const AttributeFilterParentFilteringProvider: React.FC<
    IAttributeFilterParentFilteringProviderProps
> = (props) => {
    const { children, filter: currentFilter } = props;

    const attributeFilter = useMemo(
        () => dashboardAttributeFilterToAttributeFilter(currentFilter),
        [currentFilter],
    );

    const filterRef = useMemo(() => {
        return filterObjRef(attributeFilter);
    }, [attributeFilter]);

    const neighborFilters: IDashboardAttributeFilter[] = useDashboardSelector(
        selectOtherContextAttributeFilters(filterRef),
    );

    const {
        parents,
        configurationChanged,
        onParentSelect,
        onConnectingAttributeChanged,
        onParentFiltersChange,
        onConfigurationClose,
    } = useParentsConfiguration(neighborFilters, currentFilter);

    const { onDisplayFormSelect, filterDisplayForms, displayFormChanged, onDisplayFormChange } =
        useDisplayFormConfiguration(currentFilter);

    const onConfigurationSave = useCallback(() => {
        onParentFiltersChange();
        onDisplayFormChange();
    }, [onParentFiltersChange, onDisplayFormChange]);

    const showDisplayFormPicker = filterDisplayForms.availableDisplayForms.length > 1;

    return (
        <AttributeFilterParentFiltering.Provider
            value={{
                parents,
                onParentSelect,
                onConnectingAttributeChanged,
                onParentFiltersChange,
                onDisplayFormSelect,
                filterDisplayForms,
                displayFormChanged,
                onDisplayFormChange,
                onConfigurationSave,
                onConfigurationClose,
                showDisplayFormPicker,
                configurationChanged,
            }}
        >
            {children}
        </AttributeFilterParentFiltering.Provider>
    );
};
