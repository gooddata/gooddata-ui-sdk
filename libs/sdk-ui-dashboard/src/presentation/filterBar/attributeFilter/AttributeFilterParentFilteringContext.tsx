// (C) 2022-2023 GoodData Corporation
import React, { useContext, useMemo, useCallback } from "react";
import { invariant } from "ts-invariant";
import {
    filterObjRef,
    IDashboardAttributeFilter,
    IAttributeMetadataObject,
    areObjRefsEqual,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    selectAllCatalogDisplayFormsMap,
    selectAttributeFilterDisplayFormsMap,
    selectOtherContextAttributeFilters,
    useDashboardSelector,
} from "../../../model/index.js";
import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { useParentsConfiguration } from "./dashboardDropdownBody/configuration/hooks/useParentsConfiguration.js";
import { useDisplayFormConfiguration } from "./dashboardDropdownBody/configuration/hooks/useDisplayFormConfiguration.js";
import { useTitleConfiguration } from "./dashboardDropdownBody/configuration/hooks/useTitleConfiguration.js";
import { useSelectionModeConfiguration } from "./dashboardDropdownBody/configuration/hooks/useSelectionModeConfiguration.js";

/**
 * @internal
 */
export type IAttributeFilterParentFiltering = ReturnType<typeof useParentsConfiguration> &
    ReturnType<typeof useDisplayFormConfiguration> &
    ReturnType<typeof useTitleConfiguration> &
    ReturnType<typeof useSelectionModeConfiguration> & {
        onConfigurationSave: () => void;
        showDisplayFormPicker: boolean;
        showResetTitle: boolean;
        defaultAttributeFilterTitle?: string;
        attributeFilterDisplayForm: ObjRef;
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
    attributes?: IAttributeMetadataObject[];
    children?: React.ReactNode;
};

/**
 * @internal
 */
export const AttributeFilterParentFilteringProvider: React.FC<
    IAttributeFilterParentFilteringProviderProps
> = (props) => {
    const { children, filter: currentFilter, attributes } = props;

    const attributeFilter = useMemo(
        () => dashboardAttributeFilterToAttributeFilter(currentFilter),
        [currentFilter],
    );

    const memoizedAttributes = useMemo(() => {
        return attributes ?? [];
    }, [attributes]);

    const filterRef = useMemo(() => {
        return filterObjRef(attributeFilter);
    }, [attributeFilter]);

    const neighborFilters: IDashboardAttributeFilter[] = useDashboardSelector(
        selectOtherContextAttributeFilters(filterRef),
    );

    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    const attributeFilterDisplayFormsMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const filterDisplayForm = attributeFilterDisplayFormsMap.get(currentFilter.attributeFilter.displayForm);
    invariant(filterDisplayForm);

    const attributeByDisplayForm = memoizedAttributes.find((attribute) =>
        areObjRefsEqual(attribute.ref, filterDisplayForm.attribute),
    );

    const attributeFilterDisplayForm = filterDisplayForm.attribute;

    const defaultAttributeFilterTitle =
        catalogDisplayFormsMap.get(filterDisplayForm.attribute)?.title ?? attributeByDisplayForm?.title;

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
    } = useDisplayFormConfiguration(currentFilter, memoizedAttributes);

    const {
        title,
        titleChanged,
        titleChangeStatus,
        onTitleUpdate,
        onTitleReset,
        onTitleChange,
        onConfigurationClose: onTitleClose,
    } = useTitleConfiguration(currentFilter, defaultAttributeFilterTitle);

    const {
        selectionMode,
        selectionModeChanged,
        onSelectionModeChange,
        onSelectionModeUpdate,
        onConfigurationClose: onSelectionModeClose,
    } = useSelectionModeConfiguration(currentFilter);

    const onConfigurationSave = useCallback(() => {
        // the order is important to keep the app in valid state
        if (selectionMode === "single") {
            onParentFiltersChange();
            onSelectionModeChange();
        } else {
            onSelectionModeChange();
            onParentFiltersChange();
        }
        onDisplayFormChange();
        onTitleChange();
    }, [selectionMode, onParentFiltersChange, onDisplayFormChange, onTitleChange, onSelectionModeChange]);

    const onConfigurationClose = useCallback(() => {
        onParentFiltersClose();
        onDisplayFormClose();
        onTitleClose();
        onSelectionModeClose();
    }, [onParentFiltersClose, onDisplayFormClose, onTitleClose, onSelectionModeClose]);

    const showDisplayFormPicker = filterDisplayForms.availableDisplayForms.length > 1;
    const showResetTitle = title !== defaultAttributeFilterTitle;

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
                defaultAttributeFilterTitle,
                showResetTitle,
                titleChanged,
                titleChangeStatus,
                onTitleChange,
                onTitleUpdate,
                onTitleReset,
                attributeFilterDisplayForm,
                selectionMode,
                selectionModeChanged,
                onSelectionModeChange,
                onSelectionModeUpdate,
            }}
        >
            {children}
        </AttributeFilterParentFiltering.Provider>
    );
};
