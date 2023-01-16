// (C) 2022-2023 GoodData Corporation
import React, { useContext, useMemo, useCallback } from "react";
import { filterObjRef, IDashboardAttributeFilter } from "@gooddata/sdk-model";
import { selectOtherContextAttributeFilters, useDashboardSelector } from "../../../model";
import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter";
import { useParentsConfiguration } from "./dashboardDropdownBody/configuration/hooks/useParentsConfiguration";
import { useDisplayFormConfiguration } from "./dashboardDropdownBody/configuration/hooks/useDisplayFormConfiguration";
import { useTitleConfiguration } from "./dashboardDropdownBody/configuration/hooks/useTitleConfiguration";

/**
 * @internal
 */
export type IAttributeFilterParentFiltering = ReturnType<typeof useParentsConfiguration> &
    ReturnType<typeof useDisplayFormConfiguration> &
    ReturnType<typeof useTitleConfiguration> & {
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
        onConfigurationClose: onParentFiltersClose,
    } = useParentsConfiguration(neighborFilters, currentFilter);

    const {
        onDisplayFormSelect,
        filterDisplayForms,
        displayFormChanged,
        onDisplayFormChange,
        onConfigurationClose: onDisplayFormClose,
        displayFormChangeStatus,
    } = useDisplayFormConfiguration(currentFilter);

    const {
        title,
        titleChanged,
        titleChangeStatus,
        onTitleUpdate,
        onTitleReset,
        onTitleChange,
        onConfigurationClose: onTitleClose,
    } = useTitleConfiguration(currentFilter);

    const onConfigurationSave = useCallback(() => {
        onParentFiltersChange();
        onDisplayFormChange();
        onTitleChange();
    }, [onParentFiltersChange, onDisplayFormChange]);

    const onConfigurationClose = useCallback(() => {
        onParentFiltersClose();
        onDisplayFormClose();
        onTitleClose();
    }, [onParentFiltersClose, onDisplayFormClose]);

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
                displayFormChangeStatus,
                title,
                titleChanged,
                titleChangeStatus,
                onTitleChange,
                onTitleUpdate,
                onTitleReset,
            }}
        >
            {children}
        </AttributeFilterParentFiltering.Provider>
    );
};
