// (C) 2021-2025 GoodData Corporation

import { type ReactElement, type ReactNode, useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { DashboardAttributeFilterConfigModeValues, filterObjRef } from "@gooddata/sdk-model";
import {
    AttributeDatasetInfo,
    AttributeFilterButton,
    AttributeFilterDependencyTooltip,
    AttributeFilterDropdownButton,
    AttributeFilterElementsSelect,
    AttributeFilterLoading,
    AttributeFilterStatusBar,
    type IAttributeFilterDropdownActionsProps,
    type IAttributeFilterDropdownButtonProps,
    type IAttributeFilterElementsSelectProps,
    type IAttributeFilterStatusBarProps,
    SingleSelectionAttributeFilterStatusBar,
    useAttributeFilterContext,
    useAutoOpenAttributeFilterDropdownButton,
    useOnCloseAttributeFilterDropdownButton,
} from "@gooddata/sdk-ui-filters";
import { LOADING_HEIGHT, LoadingMask } from "@gooddata/sdk-ui-kit";

import {
    AttributeFilterParentFilteringProvider,
    useAttributeFilterParentFiltering,
} from "./AttributeFilterParentFilteringContext.js";
import {
    CustomAttributeFilterDropdownActions,
    CustomConfigureAttributeFilterDropdownActions,
} from "./CustomDropdownActions.js";
import { AttributeFilterConfiguration } from "./dashboardDropdownBody/configuration/AttributeFilterConfiguration.js";
import { useAttributeDataSet } from "./dashboardDropdownBody/configuration/hooks/useAttributeDataSet.js";
import { type IDashboardAttributeFilterProps } from "./types.js";
import { useDependentDateFilters } from "./useDependentDateFilters.js";
import { useParentFilters } from "./useParentFilters.js";
import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { useAttributes } from "../../../_staging/sharedHooks/useAttributes.js";
import {
    selectAttributeFilterConfigsModeMap,
    selectAttributeFilterConfigsModeMapByTab,
    selectBackendCapabilities,
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    selectEnablePreserveFilterSelectionDuringInit,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsAttributeFilterDependentByLocalIdentifier,
    selectIsAttributeFilterDependentByLocalIdentifierForTab,
    selectIsFilterFromCrossFilteringByLocalIdentifier,
    selectIsInEditMode,
    selectLocale,
    selectPreloadedAttributesWithReferences,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../model/index.js";
import { getVisibilityIcon } from "../utils.js";

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export function DefaultDashboardAttributeFilter(props: IDashboardAttributeFilterProps): ReactElement | null {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    // Wait for batch preload of the required attribute filter data (labels and datasets), otherwise, each filter will spawn its own request.
    const filtersPreloaded = useDashboardSelector(selectPreloadedAttributesWithReferences);
    const showFilter = isInEditMode || filtersPreloaded;

    const LoadingComponent = props.AttributeFilterLoadingComponent || AttributeFilterLoading;

    if (!showFilter) {
        return <LoadingComponent />;
    }

    return <DefaultDashboardAttributeFilterInner {...props} />;
}

/**
 * @internal
 */
export function StandaloneDashboardAttributeFilter(
    props: IDashboardAttributeFilterProps,
): ReactElement | null {
    return <DefaultDashboardAttributeFilterInner {...props} />;
}

function DefaultDashboardAttributeFilterInner(props: IDashboardAttributeFilterProps): ReactElement | null {
    const {
        filter,
        workingFilter,
        onFilterChanged,
        isDraggable,
        readonly,
        autoOpen,
        onClose,
        displayAsLabel,
        overlayPositionType,
        tabId,
    } = props;
    const { parentFilters, parentFilterOverAttribute } = useParentFilters(filter, tabId);
    const { dependentDateFilters } = useDependentDateFilters(filter, tabId);
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const capabilities = useDashboardSelector(selectBackendCapabilities);

    // Use tab-specific selectors when tabId is provided
    // Always call all hooks unconditionally
    const attributeFilterConfigsModeMapByTab = useDashboardSelector(selectAttributeFilterConfigsModeMapByTab);
    const attributeFilterConfigsModeMapActive = useDashboardSelector(selectAttributeFilterConfigsModeMap);
    const attributeFilterConfigsModeMap = useMemo(
        () =>
            tabId
                ? (attributeFilterConfigsModeMapByTab[tabId] ?? new Map())
                : attributeFilterConfigsModeMapActive,
        [tabId, attributeFilterConfigsModeMapByTab, attributeFilterConfigsModeMapActive],
    );

    const attributeFilter = useMemo(() => dashboardAttributeFilterToAttributeFilter(filter), [filter]);
    const workingAttributeFilter = useMemo(
        () => dashboardAttributeFilterToAttributeFilter(workingFilter ?? filter),
        [workingFilter, filter],
    );
    const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
    const userInteraction = useDashboardUserInteraction();

    // Always call selectors unconditionally, select the right one based on tabId
    const isAttributeFilterDependentActive = useDashboardSelector(
        selectIsAttributeFilterDependentByLocalIdentifier(filter.attributeFilter.localIdentifier!),
    );
    const isAttributeFilterDependentForTab = useDashboardSelector(
        tabId
            ? selectIsAttributeFilterDependentByLocalIdentifierForTab(
                  filter.attributeFilter.localIdentifier!,
                  tabId,
              )
            : selectIsAttributeFilterDependentByLocalIdentifier(filter.attributeFilter.localIdentifier!),
    );
    const isAttributeFilterDependent = tabId
        ? isAttributeFilterDependentForTab
        : isAttributeFilterDependentActive;
    const isVirtualAttributeFilter = useDashboardSelector(
        selectIsFilterFromCrossFilteringByLocalIdentifier(filter.attributeFilter.localIdentifier!),
    );
    const enableImmediateAttributeFilterDisplayAsLabelMigration = useDashboardSelector(
        selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    );
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const enablePreserveSelectionDuringInit = useDashboardSelector(
        selectEnablePreserveFilterSelectionDuringInit,
    );

    const filterRef = useMemo(() => {
        return filterObjRef(attributeFilter);
    }, [attributeFilter]);

    const intl = useIntl();

    const cancelText = intl.formatMessage({ id: "gs.list.cancel" });
    const closeText = intl.formatMessage({ id: "close" });
    const saveText = intl.formatMessage({ id: "attributesDropdown.save" });
    const applyText = intl.formatMessage({ id: "gs.list.apply" });
    const displayValuesAsText = intl.formatMessage({ id: "attributesDropdown.displayValuesAs" });
    const filterByText = intl.formatMessage({ id: "attributesDropdown.filterBy" });
    const titleText = intl.formatMessage({ id: "attributesDropdown.title" });
    const resetTitleText = intl.formatMessage({ id: "attributesDropdown.title.reset" });
    const selectionTitleText = intl.formatMessage({ id: "attributesDropdown.selectionMode" });
    const multiSelectionOptionText = intl.formatMessage({ id: "attributesDropdown.selectionMode.multi" });
    const singleSelectionOptionText = intl.formatMessage({ id: "attributesDropdown.selectionMode.single" });
    const singleSelectionDisabledTooltip = intl.formatMessage({
        id: "attributesDropdown.selectionMode.disabled.tooltip",
    });
    const parentFiltersDisabledTooltip = intl.formatMessage({
        id: "attributesDropdown.parentFilter.disabled.tooltip",
    });
    const modeCategoryTitleText = intl.formatMessage({ id: "filter.configuration.mode.title" });

    const onCloseFilter = useCallback(() => {
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    const attributeFilterRef = useMemo(() => {
        return [filterRef];
    }, [filterRef]);

    const { attributes } = useAttributes(attributeFilterRef);

    const visibilityIcon = useMemo(
        () =>
            getVisibilityIcon(
                attributeFilterConfigsModeMap.get(filter.attributeFilter.localIdentifier!),
                isEditMode,
                !!capabilities.supportsHiddenAndLockedFiltersOnUI,
                intl,
            ),
        [
            attributeFilterConfigsModeMap,
            filter.attributeFilter.localIdentifier,
            isEditMode,
            capabilities.supportsHiddenAndLockedFiltersOnUI,
            intl,
        ],
    );

    const CustomDropdownButton = useMemo(() => {
        function DropdownButton(props: IAttributeFilterDropdownButtonProps) {
            useAutoOpenAttributeFilterDropdownButton(props, Boolean(autoOpen));
            useOnCloseAttributeFilterDropdownButton(props, onCloseFilter);

            const { isOpen, title } = props;
            const { defaultAttributeFilterTitle, displayFormChangeStatus, attributeFilterDisplayForm } =
                useAttributeFilterParentFiltering();
            const { attributeDataSet } = useAttributeDataSet(attributeFilterDisplayForm);

            const displayAttributeTooltip = isEditMode && displayFormChangeStatus !== "running";
            const filterDependencyIconTooltip = intl.formatMessage(
                { id: "filter.dependency.icon.tooltip" },
                {
                    filterTitle: title,
                    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                },
            );

            const CustomTooltipComponent = useMemo(() => {
                function TooltipComponent() {
                    return (
                        <AttributeDatasetInfo
                            title={title}
                            defaultAttributeFilterTitle={defaultAttributeFilterTitle}
                            attributeDataSet={attributeDataSet}
                        />
                    );
                }

                if (displayAttributeTooltip && attributeDataSet && isOpen) {
                    return TooltipComponent;
                }

                return undefined;
            }, [displayAttributeTooltip, defaultAttributeFilterTitle, attributeDataSet, isOpen, title]);

            const shouldExtendTitle =
                !!capabilities.supportsKeepingDependentFiltersSelection && isAttributeFilterDependent;
            const titleExtension = shouldExtendTitle ? (
                <AttributeFilterDependencyTooltip tooltipContent={filterDependencyIconTooltip} />
            ) : null;

            return (
                <AttributeFilterDropdownButton
                    {...props}
                    isDraggable={isDraggable}
                    TooltipContentComponent={CustomTooltipComponent}
                    titleExtension={titleExtension}
                    className={
                        isVirtualAttributeFilter ? "gd-virtual-attribute-filter-dropdown-button" : undefined
                    }
                />
            );
        }

        return DropdownButton;
    }, [
        autoOpen,
        onCloseFilter,
        isEditMode,
        intl,
        capabilities.supportsKeepingDependentFiltersSelection,
        isAttributeFilterDependent,
        isDraggable,
        isVirtualAttributeFilter,
    ]);

    const CustomDropdownActions = useMemo(() => {
        function DropdownActions(props: IAttributeFilterDropdownActionsProps) {
            const { currentDisplayFormRef, committedSelectionElements } = useAttributeFilterContext();
            const withoutApply = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);

            const {
                title,
                configurationChanged,
                displayFormChanged,
                titleChanged,
                onConfigurationSave,
                onConfigurationClose,
                selectionModeChanged,
                modeChanged,
                limitingItemsChanged,
                onDependentDateFiltersConfigurationChanged,
            } = useAttributeFilterParentFiltering();

            const isTitleDefined = !!title && title.trim().length > 0;
            const isSaveDisabled = isTitleDefined
                ? !(
                      configurationChanged ||
                      displayFormChanged ||
                      titleChanged ||
                      selectionModeChanged ||
                      modeChanged ||
                      limitingItemsChanged ||
                      onDependentDateFiltersConfigurationChanged
                  )
                : true;

            return (
                <>
                    {isConfigurationOpen ? (
                        <CustomConfigureAttributeFilterDropdownActions
                            isSaveDisabled={isSaveDisabled}
                            onSaveButtonClick={() => {
                                onConfigurationSave(currentDisplayFormRef, committedSelectionElements);
                                setIsConfigurationOpen(false);
                            }}
                            onCancelButtonClick={() => {
                                setIsConfigurationOpen(false);
                            }}
                            cancelText={cancelText}
                            saveText={saveText}
                        />
                    ) : (
                        <CustomAttributeFilterDropdownActions
                            {...props}
                            filterDisplayFormRef={filter.attributeFilter.displayForm}
                            filterSelectionMode={filter.attributeFilter.selectionMode}
                            applyText={applyText}
                            cancelText={withoutApply ? closeText : cancelText}
                            onConfigurationButtonClick={() => {
                                setIsConfigurationOpen(true);
                                onConfigurationClose();
                                userInteraction.attributeFilterInteraction(
                                    "attributeFilterConfigurationOpened",
                                );
                            }}
                            attributes={attributes}
                        />
                    )}
                </>
            );
        }

        return DropdownActions;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isConfigurationOpen,
        cancelText,
        saveText,
        filter.attributeFilter.displayForm,
        filter.attributeFilter.selectionMode,
        applyText,
        attributes,
    ]);

    const CustomElementsSelect = useMemo(() => {
        function ElementsSelect(props: IAttributeFilterElementsSelectProps) {
            const { displayFormChangeStatus } = useAttributeFilterParentFiltering();

            const closeHandler = useCallback(() => {
                setIsConfigurationOpen(false);
            }, []);

            if (displayFormChangeStatus === "running") {
                return <LoadingMask height={LOADING_HEIGHT} />;
            }

            return (
                <>
                    {isConfigurationOpen ? (
                        <AttributeFilterConfiguration
                            intl={intl}
                            closeHandler={closeHandler}
                            filterRef={filterRef}
                            filterByText={filterByText}
                            displayValuesAsText={displayValuesAsText}
                            titleText={titleText}
                            resetTitleText={resetTitleText}
                            selectionTitleText={selectionTitleText}
                            multiSelectionOptionText={multiSelectionOptionText}
                            singleSelectionOptionText={singleSelectionOptionText}
                            modeCategoryTitleText={modeCategoryTitleText}
                            singleSelectionDisabledTooltip={singleSelectionDisabledTooltip}
                            parentFiltersDisabledTooltip={parentFiltersDisabledTooltip}
                            showConfigModeSection={!!capabilities.supportsHiddenAndLockedFiltersOnUI}
                        />
                    ) : (
                        <AttributeFilterElementsSelect {...props} />
                    )}
                </>
            );
        }

        return ElementsSelect;
    }, [
        isConfigurationOpen,
        filterRef,
        filterByText,
        displayValuesAsText,
        titleText,
        resetTitleText,
        selectionTitleText,
        multiSelectionOptionText,
        singleSelectionOptionText,
        singleSelectionDisabledTooltip,
        parentFiltersDisabledTooltip,
        modeCategoryTitleText,
        intl,
        capabilities,
    ]);

    const createStatusBarComponent = (params: {
        filterSelectionMode: string | undefined;
        isApplyAllAtOnceEnabledAndSet: boolean;
        supportsShowingFilteredElements: boolean | undefined;
        userInteraction: ReturnType<typeof useDashboardUserInteraction>;
    }) => {
        const {
            filterSelectionMode,
            isApplyAllAtOnceEnabledAndSet,
            supportsShowingFilteredElements,
            userInteraction,
        } = params;

        function CustomStatusBar(props: IAttributeFilterStatusBarProps) {
            const context = useAttributeFilterContext();

            const afterClearIrrelevantSelection = useCallback(() => {
                if (isApplyAllAtOnceEnabledAndSet) {
                    context?.onApply?.(true, true);
                }
            }, [context]);

            const enableShowingFilteredElements = !!supportsShowingFilteredElements;
            const handleShowFilteredElements = () => {
                props.onShowFilteredElements?.();
                userInteraction.attributeFilterInteraction("attributeFilterShowAllValuesClicked");
            };

            if (filterSelectionMode === "single" && !props.isInverted) {
                return (
                    <SingleSelectionAttributeFilterStatusBar
                        {...props}
                        onShowFilteredElements={handleShowFilteredElements}
                        enableShowingFilteredElements={enableShowingFilteredElements}
                    />
                );
            }

            return (
                <AttributeFilterStatusBar
                    {...props}
                    onShowFilteredElements={handleShowFilteredElements}
                    onClearIrrelevantSelection={() => {
                        props.onClearIrrelevantSelection?.();
                        afterClearIrrelevantSelection();
                        userInteraction.attributeFilterInteraction(
                            "attributeFilterClearIrrelevantValuesClicked",
                        );
                    }}
                    enableShowingFilteredElements={enableShowingFilteredElements}
                />
            );
        }

        return CustomStatusBar;
    };

    const CustomStatusBarComponent = useMemo(() => {
        return createStatusBarComponent({
            filterSelectionMode: filter.attributeFilter.selectionMode,
            isApplyAllAtOnceEnabledAndSet,
            supportsShowingFilteredElements: capabilities.supportsShowingFilteredElements ?? false,
            userInteraction,
        });
    }, [
        filter.attributeFilter.selectionMode,
        capabilities.supportsShowingFilteredElements,
        userInteraction,
        isApplyAllAtOnceEnabledAndSet,
    ]);

    const AttributeFilterComponent = props.AttributeFilterComponent ?? AttributeFilterButton;

    return (
        <AttributeFilterParentFilteringProvider
            filter={filter}
            attributes={attributes}
            displayAsLabel={displayAsLabel}
        >
            <AttributeFilterComponent
                title={filter.attributeFilter.title}
                resetOnParentFilterChange={false}
                filter={isApplyAllAtOnceEnabledAndSet ? workingAttributeFilter : attributeFilter}
                displayAsLabel={displayAsLabel}
                overlayPositionType={overlayPositionType}
                onApply={(
                    newFilter,
                    isInverted,
                    selectionMode,
                    selectionTitles,
                    displayAsLabel,
                    isResultOfMigration,
                    additionalProps,
                ) => {
                    const isSelectionInvalid = additionalProps?.isSelectionInvalid ?? false;
                    const applyToWorkingOnly = additionalProps?.applyToWorkingOnly ?? false;

                    const convertedFilter = attributeFilterToDashboardAttributeFilter(
                        newFilter,
                        filter.attributeFilter.localIdentifier,
                        filter.attributeFilter.title,
                        selectionTitles,
                        isInverted,
                        selectionMode,
                    );
                    if (isApplyAllAtOnceEnabledAndSet) {
                        onFilterChanged(convertedFilter, displayAsLabel, true, false, isSelectionInvalid);
                    }
                    if (!applyToWorkingOnly) {
                        onFilterChanged(
                            convertedFilter,
                            displayAsLabel,
                            false,
                            isResultOfMigration,
                            isSelectionInvalid,
                        );
                    }
                }}
                onSelect={(
                    newFilter,
                    isInverted,
                    selectionMode,
                    selectionTitles,
                    displayAsLabel,
                    isResultOfMigration,
                    additionalProps,
                ) => {
                    if (isApplyAllAtOnceEnabledAndSet) {
                        onFilterChanged(
                            attributeFilterToDashboardAttributeFilter(
                                newFilter,
                                filter.attributeFilter.localIdentifier,
                                filter.attributeFilter.title,
                                selectionTitles,
                                isInverted,
                                selectionMode,
                            ),
                            displayAsLabel,
                            true,
                            isResultOfMigration as unknown as boolean | undefined,
                            (additionalProps as unknown as { isSelectionInvalid?: boolean })
                                ?.isSelectionInvalid,
                        );
                    }
                }}
                parentFilters={parentFilters}
                dependentDateFilters={dependentDateFilters}
                parentFilterOverAttribute={parentFilterOverAttribute}
                validateElementsBy={filter.attributeFilter.validateElementsBy}
                locale={locale}
                DropdownButtonComponent={CustomDropdownButton}
                DropdownActionsComponent={CustomDropdownActions}
                ElementsSelectComponent={CustomElementsSelect}
                fullscreenOnMobile
                selectionMode={filter.attributeFilter.selectionMode}
                selectFirst
                attributeFilterMode={
                    readonly
                        ? DashboardAttributeFilterConfigModeValues.READONLY
                        : DashboardAttributeFilterConfigModeValues.ACTIVE
                }
                customIcon={visibilityIcon}
                StatusBarComponent={CustomStatusBarComponent}
                enableImmediateAttributeFilterDisplayAsLabelMigration={
                    enableImmediateAttributeFilterDisplayAsLabelMigration
                }
                withoutApply={isApplyAllAtOnceEnabledAndSet}
                enablePreserveSelectionDuringInit={enablePreserveSelectionDuringInit}
            />
        </AttributeFilterParentFilteringProvider>
    );
}
