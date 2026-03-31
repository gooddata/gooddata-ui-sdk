// (C) 2022-2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useRef } from "react";

import { invariant } from "ts-invariant";

import {
    DashboardAttributeFilterConfigModeValues,
    type DashboardAttributeFilterItem,
    DashboardAttributeFilterSelectionTypeValues,
    type IAttributeElement,
    type IAttributeMetadataObject,
    type IAttributeOrMeasure,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemTitle,
    filterObjRef,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

import { useDependentDateFiltersConfiguration } from "./dashboardDropdownBody/configuration/hooks/useDependentDateFiltersConfiguration.js";
import { useDisplayFormConfiguration } from "./dashboardDropdownBody/configuration/hooks/useDisplayFormConfiguration.js";
import { useLimitingItemsConfiguration } from "./dashboardDropdownBody/configuration/hooks/useLimitingItemsConfiguration.js";
import { useModeConfiguration } from "./dashboardDropdownBody/configuration/hooks/useModeConfiguration.js";
import { useParentsConfiguration } from "./dashboardDropdownBody/configuration/hooks/useParentsConfiguration.js";
import { useSelectionModeConfiguration } from "./dashboardDropdownBody/configuration/hooks/useSelectionModeConfiguration.js";
import { useSelectionTypeConfiguration } from "./dashboardDropdownBody/configuration/hooks/useSelectionTypeConfiguration.js";
import { useTitleConfiguration } from "./dashboardDropdownBody/configuration/hooks/useTitleConfiguration.js";
import { mergeDashboardAttributeFilterMetadata } from "./mergeDashboardAttributeFilterMetadata.js";
import { useAttributeFilterDisplayFormFromMap } from "../../../_staging/sharedHooks/useAttributeFilterDisplayFormFromMap.js";
import { dashboardAttributeFilterItemToAttributeFilter } from "../../../converters/filterConverters.js";
import { replaceAttributeFilterItemSelection } from "../../../model/commands/filters.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";
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
    ReturnType<typeof useModeConfiguration> &
    ReturnType<typeof useSelectionTypeConfiguration> & {
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
    filterItem: DashboardAttributeFilterItem;
    displayAsLabel?: ObjRef;
    attributes?: IAttributeMetadataObject[];
    children?: ReactNode;
};

/**
 * @internal
 */
export function AttributeFilterParentFilteringProvider({
    children,
    filterItem,
    attributes,
    displayAsLabel,
}: IAttributeFilterParentFilteringProviderProps) {
    const currentFilter: IDashboardAttributeFilter = useMemo(
        () => (isDashboardAttributeFilter(filterItem) ? filterItem : toSyntheticAttributeFilter(filterItem)),
        [filterItem],
    );

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
        selectionType,
        selectionTypeChanged,
        onSelectionTypeUpdate,
        onSelectionTypeChange,
        onConfigurationClose: onSelectionTypeClose,
    } = useSelectionTypeConfiguration(filterItem);

    const { run: replaceFilterItem } = useDashboardCommandProcessing({
        commandCreator: replaceAttributeFilterItemSelection,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const {
        limitingItems,
        limitingItemsChanged,
        onLimitingItemsUpdate,
        onLimitingItemsChange,
        onConfigurationClose: onLimitingItemsClose,
    } = useLimitingItemsConfiguration(currentFilter);

    const onConfigurationSave = useCallback(() => {
        // When selection type changed to an exclusive mode, reset filter to All of the target type
        if (
            selectionTypeChanged &&
            selectionType !== DashboardAttributeFilterSelectionTypeValues.LIST_OR_TEXT
        ) {
            const filterLocalId = dashboardAttributeFilterItemLocalIdentifier(filterItem);
            const displayForm = dashboardAttributeFilterItemDisplayForm(filterItem);

            // Only include title if the filter has a custom (non-default) title,
            // otherwise leave it unset so saved views can match without a title mismatch
            const explicitTitle = title === defaultAttributeFilterTitle ? undefined : title;

            if (selectionType === DashboardAttributeFilterSelectionTypeValues.LIST && filterLocalId) {
                replaceFilterItem(
                    filterLocalId,
                    mergeDashboardAttributeFilterMetadata(filterItem, {
                        attributeFilter: {
                            displayForm,
                            negativeSelection: true,
                            attributeElements: { uris: [] },
                            localIdentifier: filterLocalId,
                            title: explicitTitle,
                        },
                    }),
                );
            } else if (selectionType === DashboardAttributeFilterSelectionTypeValues.TEXT && filterLocalId) {
                replaceFilterItem(
                    filterLocalId,
                    mergeDashboardAttributeFilterMetadata(filterItem, {
                        arbitraryAttributeFilter: {
                            displayForm,
                            values: [],
                            negativeSelection: true,
                            localIdentifier: filterLocalId,
                            title: explicitTitle,
                        },
                    }),
                );
            }
        }

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
        onSelectionTypeChange();
        onLimitingItemsChange();
    }, [
        selectionMode,
        selectionType,
        selectionTypeChanged,
        filterItem,
        title,
        defaultAttributeFilterTitle,
        replaceFilterItem,
        onParentFiltersChange,
        onDisplayFormChange,
        onTitleChange,
        onSelectionModeChange,
        onModeChange,
        onSelectionTypeChange,
        onLimitingItemsChange,
        onDependentDateFiltersChange,
    ]);

    const onConfigurationClose = useCallback(() => {
        onParentFiltersClose();
        onDisplayFormClose();
        onTitleClose();
        onSelectionModeClose();
        onModeClose();
        onSelectionTypeClose();
        onLimitingItemsClose();
        onDependentDateFiltersClose();
    }, [
        onParentFiltersClose,
        onDisplayFormClose,
        onTitleClose,
        onSelectionModeClose,
        onModeClose,
        onSelectionTypeClose,
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
                selectionType,
                selectionTypeChanged,
                onSelectionTypeUpdate,
                onSelectionTypeChange,
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

/**
 * Converts a text filter (arbitrary or match) to a synthetic IDashboardAttributeFilter
 * so it can be consumed by the provider hooks that expect IDashboardAttributeFilter.
 */
function toSyntheticAttributeFilter(filter: DashboardAttributeFilterItem): IDashboardAttributeFilter {
    if (isDashboardArbitraryAttributeFilter(filter)) {
        const {
            displayForm,
            localIdentifier,
            title,
            filterElementsBy,
            filterElementsByDate,
            validateElementsBy,
        } = filter.arbitraryAttributeFilter;
        return {
            attributeFilter: {
                displayForm,
                localIdentifier,
                title,
                filterElementsBy,
                filterElementsByDate,
                validateElementsBy,
                negativeSelection: false,
                attributeElements: { uris: [] },
            },
        };
    }

    // Match filter
    const displayForm = dashboardAttributeFilterItemDisplayForm(filter);
    const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
    const title = dashboardAttributeFilterItemTitle(filter);
    return {
        attributeFilter: {
            displayForm,
            localIdentifier,
            title,
            negativeSelection: false,
            attributeElements: { uris: [] },
        },
    };
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
            selectionType: DashboardAttributeFilterSelectionTypeValues.TEXT,
            selectionTypeChanged: false,
            onSelectionTypeUpdate: noop,
            onSelectionTypeChange: noop,
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
