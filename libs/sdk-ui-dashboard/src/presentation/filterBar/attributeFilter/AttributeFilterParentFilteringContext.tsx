// (C) 2022-2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useRef } from "react";

import { invariant } from "ts-invariant";

import {
    DashboardAttributeFilterConfigModeValues,
    type IAttributeElement,
    type IAttributeMetadataObject,
    type IAttributeOrMeasure,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    filterObjRef,
} from "@gooddata/sdk-model";

import { useDependentDateFiltersConfiguration } from "./dashboardDropdownBody/configuration/hooks/useDependentDateFiltersConfiguration.js";
import { useDisplayFormConfiguration } from "./dashboardDropdownBody/configuration/hooks/useDisplayFormConfiguration.js";
import { useLimitingItemsConfiguration } from "./dashboardDropdownBody/configuration/hooks/useLimitingItemsConfiguration.js";
import { useModeConfiguration } from "./dashboardDropdownBody/configuration/hooks/useModeConfiguration.js";
import { useParentsConfiguration } from "./dashboardDropdownBody/configuration/hooks/useParentsConfiguration.js";
import { useSelectionModeConfiguration } from "./dashboardDropdownBody/configuration/hooks/useSelectionModeConfiguration.js";
import { useTitleConfiguration } from "./dashboardDropdownBody/configuration/hooks/useTitleConfiguration.js";
import { useAttributeFilterDisplayFormFromMap } from "../../../_staging/sharedHooks/useAttributeFilterDisplayFormFromMap.js";
import { dashboardAttributeFilterItemToAttributeFilter } from "../../../converters/filterConverters.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectAllCatalogDisplayFormsMap } from "../../../model/store/catalog/catalogSelectors.js";
import {
    selectFilterContextDateFilter,
    selectFilterContextDateFiltersWithDimension,
    selectOtherContextAttributeFilters,
} from "../../../model/store/tabs/filterContext/filterContextSelectors.js";

/**
 * @internal
 */
export type IAttributeFilterParentFiltering = ReturnType<typeof useParentsConfiguration> &
    ReturnType<typeof useDisplayFormConfiguration> &
    ReturnType<typeof useTitleConfiguration> &
    ReturnType<typeof useSelectionModeConfiguration> &
    ReturnType<typeof useModeConfiguration> & {
        onConfigurationSave: (
            currentDisplayFormRef: ObjRef,
            committedSelectionElements: IAttributeElement[],
        ) => void;
        showDisplayFormPicker: boolean;
        showResetTitle: boolean;
        defaultAttributeFilterTitle?: string;
        attributeFilterDisplayForm: ObjRef;
        availableDatasetsForFilter: IAttributeOrMeasure[];
    } & ReturnType<typeof useLimitingItemsConfiguration> &
    ReturnType<typeof useDependentDateFiltersConfiguration>;

export const AttributeFilterParentFiltering = createContext<IAttributeFilterParentFiltering>(null as any); // TODO: Fix typing

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
    displayAsLabel?: ObjRef;
    attributes?: IAttributeMetadataObject[];
    children?: ReactNode;
};

/**
 * @internal
 */
export function AttributeFilterParentFilteringProvider({
    children,
    filter: currentFilter,
    attributes,
    displayAsLabel,
}: IAttributeFilterParentFilteringProviderProps) {
    const availableDatasetsForFilter: IAttributeOrMeasure[] = useMemo(
        () => [
            {
                attribute: {
                    localIdentifier: dashboardAttributeFilterItemLocalIdentifier(currentFilter)!,
                    displayForm: displayAsLabel ?? dashboardAttributeFilterItemDisplayForm(currentFilter),
                },
            },
        ],
        [currentFilter, displayAsLabel],
    );

    const attributeFilter = useMemo(
        () => dashboardAttributeFilterItemToAttributeFilter(currentFilter),
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

    const neighborDateFilters: IDashboardDateFilter[] = useDashboardSelector(
        selectFilterContextDateFiltersWithDimension,
    );

    const commonDateFilter: IDashboardDateFilter | undefined = useDashboardSelector(
        selectFilterContextDateFilter,
    );

    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const getAttributeFilterDisplayFormFromMap = useAttributeFilterDisplayFormFromMap();
    const filterDisplayForm = getAttributeFilterDisplayFormFromMap(
        dashboardAttributeFilterItemDisplayForm(currentFilter),
    );
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
        dependentDateFilters,
        dependentCommonDateFilter,
        onDependentDateFiltersSelect,
        onConfigurationClose: onDependentDateFiltersClose,
        onDependentDateFiltersChange,
        onDependentDateFiltersConfigurationChanged,
    } = useDependentDateFiltersConfiguration(neighborDateFilters, currentFilter, commonDateFilter);

    const {
        onDisplayFormSelect,
        filterDisplayForms,
        displayFormChanged,
        onDisplayFormChange,
        onConfigurationClose: onDisplayFormClose,
        displayFormChangeStatus,
    } = useDisplayFormConfiguration(currentFilter, memoizedAttributes, displayAsLabel);

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

    const {
        mode,
        modeChanged,
        onModeChange,
        onModeUpdate,
        onConfigurationClose: onModeClose,
    } = useModeConfiguration(currentFilter, DashboardAttributeFilterConfigModeValues.ACTIVE);

    const {
        limitingItems,
        limitingItemsChanged,
        onLimitingItemsUpdate,
        onLimitingItemsChange,
        onConfigurationClose: onLimitingItemsClose,
    } = useLimitingItemsConfiguration(currentFilter);

    const onConfigurationSave = useCallback(() => {
        // the order is important to keep the app in valid state
        if (selectionMode === "single") {
            onParentFiltersChange();
            onDependentDateFiltersChange();
            onSelectionModeChange();
        } else {
            onSelectionModeChange();
            onParentFiltersChange();
            onDependentDateFiltersChange();
        }
        onDisplayFormChange();
        onTitleChange();
        onModeChange();
        onLimitingItemsChange();
    }, [
        selectionMode,
        onParentFiltersChange,
        onDisplayFormChange,
        onTitleChange,
        onSelectionModeChange,
        onModeChange,
        onLimitingItemsChange,
        onDependentDateFiltersChange,
    ]);

    const onConfigurationClose = useCallback(() => {
        onParentFiltersClose();
        onDisplayFormClose();
        onTitleClose();
        onSelectionModeClose();
        onModeClose();
        onLimitingItemsClose();
        onDependentDateFiltersClose();
    }, [
        onParentFiltersClose,
        onDisplayFormClose,
        onTitleClose,
        onSelectionModeClose,
        onModeClose,
        onLimitingItemsClose,
        onDependentDateFiltersClose,
    ]);

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
                mode,
                modeChanged,
                onModeChange,
                onModeUpdate,
                limitingItems,
                limitingItemsChanged,
                onLimitingItemsUpdate,
                onLimitingItemsChange,
                availableDatasetsForFilter,
                dependentDateFilters,
                dependentCommonDateFilter,
                onDependentDateFiltersSelect,
                onDependentDateFiltersChange,
                onDependentDateFiltersConfigurationChanged,
            }}
        >
            {children}
        </AttributeFilterParentFiltering.Provider>
    );
}

const noop = () => {};

/**
 * Lightweight noop provider for text filter types (arbitrary, match) that don't support
 * the full parent filtering configuration yet. Prevents context consumers from crashing
 * when the full {@link AttributeFilterParentFilteringProvider} is not rendered.
 *
 * @internal
 */
export function AttributeFilterNoopParentFilteringProvider({
    children,
    displayForm,
}: {
    children: ReactNode;
    displayForm: ObjRef;
}) {
    const noopValueRef = useRef<IAttributeFilterParentFiltering>(null!);
    if (!noopValueRef.current) {
        noopValueRef.current = {
            parents: [],
            configurationChanged: false,
            onParentSelect: noop,
            onConnectingAttributeChanged: noop,
            onParentFiltersChange: noop,
            onDisplayFormSelect: noop,
            filterDisplayForms: { availableDisplayForms: [], selectedDisplayForm: displayForm },
            displayFormChanged: false,
            onDisplayFormChange: noop,
            displayFormChangeStatus: "success",
            onConfigurationSave: noop as (
                _currentDisplayFormRef: ObjRef,
                _committedSelectionElements: IAttributeElement[],
            ) => void,
            onConfigurationClose: noop,
            showDisplayFormPicker: false,
            showResetTitle: false,
            defaultAttributeFilterTitle: undefined,
            attributeFilterDisplayForm: displayForm,
            title: "",
            titleChanged: false,
            titleChangeStatus: "success",
            onTitleUpdate: noop,
            onTitleReset: noop,
            onTitleChange: noop,
            selectionMode: "multi",
            selectionModeChanged: false,
            onSelectionModeChange: noop,
            onSelectionModeUpdate: noop,
            mode: DashboardAttributeFilterConfigModeValues.ACTIVE,
            modeChanged: false,
            onModeChange: noop,
            onModeUpdate: noop,
            limitingItems: [],
            limitingItemsChanged: false,
            onLimitingItemsUpdate: noop,
            onLimitingItemsChange: noop,
            availableDatasetsForFilter: [],
            dependentDateFilters: [],
            dependentCommonDateFilter: undefined,
            onDependentDateFiltersSelect: noop,
            onDependentDateFiltersChange: noop,
            onDependentDateFiltersConfigurationChanged: false,
        } as unknown as IAttributeFilterParentFiltering;
    }
    return (
        <AttributeFilterParentFiltering.Provider value={noopValueRef.current}>
            {children}
        </AttributeFilterParentFiltering.Provider>
    );
}
