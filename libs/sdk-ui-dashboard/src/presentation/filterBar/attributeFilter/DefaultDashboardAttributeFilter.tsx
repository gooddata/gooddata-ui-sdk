// (C) 2021-2025 GoodData Corporation
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import {
    AttributeFilterButton,
    IAttributeFilterDropdownButtonProps,
    IAttributeFilterDropdownActionsProps,
    AttributeFilterDropdownButton,
    AttributeFilterElementsSelect,
    IAttributeFilterElementsSelectProps,
    useAutoOpenAttributeFilterDropdownButton,
    useOnCloseAttributeFilterDropdownButton,
    AttributeDatasetInfo,
    AttributeFilterStatusBar,
    IAttributeFilterStatusBarProps,
    SingleSelectionAttributeFilterStatusBar,
    AttributeFilterDependencyTooltip,
    useAttributeFilterContext,
    AttributeFilterLoading,
} from "@gooddata/sdk-ui-filters";
import { DashboardAttributeFilterConfigModeValues, filterObjRef } from "@gooddata/sdk-model";
import { LoadingMask, LOADING_HEIGHT } from "@gooddata/sdk-ui-kit";

import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "../../../_staging/dashboard/dashboardFilterConverter.js";
import {
    removeAttributeFilter,
    useDashboardDispatch,
    selectLocale,
    useDashboardSelector,
    selectIsInEditMode,
    selectBackendCapabilities,
    selectAttributeFilterConfigsModeMap,
    useDashboardUserInteraction,
    selectIsAttributeFilterDependentByLocalIdentifier,
    selectIsFilterFromCrossFilteringByLocalIdentifier,
    selectEnableDuplicatedLabelValuesInAttributeFilter,
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    selectPreloadedAttributesWithReferences,
    selectEnableAttributeFilterVirtualisedList,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../../model/index.js";
import { useAttributes } from "../../../_staging/sharedHooks/useAttributes.js";
import { getVisibilityIcon } from "../utils.js";

import { IDashboardAttributeFilterProps } from "./types.js";
import { useParentFilters } from "./useParentFilters.js";
import { AttributeFilterConfiguration } from "./dashboardDropdownBody/configuration/AttributeFilterConfiguration.js";
import {
    CustomAttributeFilterDropdownActions,
    CustomConfigureAttributeFilterDropdownActions,
} from "./CustomDropdownActions.js";
import {
    AttributeFilterParentFilteringProvider,
    useAttributeFilterParentFiltering,
} from "./AttributeFilterParentFilteringContext.js";
import { useAttributeDataSet } from "./dashboardDropdownBody/configuration/hooks/useAttributeDataSet.js";
import { useDependentDateFilters } from "./useDependentDateFilters.js";

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardAttributeFilter = (
    props: IDashboardAttributeFilterProps,
): JSX.Element | null => {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    // Wait for batch preload of the required attribute filter data (labels and datasets), otherwise, each filter will spawn its own request.
    const filtersPreloaded = useDashboardSelector(selectPreloadedAttributesWithReferences);
    const showFilter = isInEditMode || filtersPreloaded;

    if (!showFilter) {
        return <AttributeFilterLoading />;
    }

    return <DefaultDashboardAttributeFilterInner {...props} />;
};

const DefaultDashboardAttributeFilterInner = (props: IDashboardAttributeFilterProps): JSX.Element | null => {
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
    } = props;
    const { parentFilters, parentFilterOverAttribute } = useParentFilters(filter);
    const { dependentDateFilters } = useDependentDateFilters(filter);
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const attributeFilterConfigsModeMap = useDashboardSelector(selectAttributeFilterConfigsModeMap);
    const attributeFilter = useMemo(() => dashboardAttributeFilterToAttributeFilter(filter), [filter]);
    const workingAttributeFilter = useMemo(
        () => dashboardAttributeFilterToAttributeFilter(workingFilter ?? filter),
        [workingFilter, filter],
    );
    const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
    const userInteraction = useDashboardUserInteraction();
    const isAttributeFilterDependent = useDashboardSelector(
        selectIsAttributeFilterDependentByLocalIdentifier(filter.attributeFilter.localIdentifier!),
    );
    const isVirtualAttributeFilter = useDashboardSelector(
        selectIsFilterFromCrossFilteringByLocalIdentifier(filter.attributeFilter.localIdentifier!),
    );
    const enableDuplicatedLabelValuesInAttributeFilter = useDashboardSelector(
        selectEnableDuplicatedLabelValuesInAttributeFilter,
    );
    const enableImmediateAttributeFilterDisplayAsLabelMigration = useDashboardSelector(
        selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    );
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const enableAttributeFilterVirtualisedList = useDashboardSelector(
        selectEnableAttributeFilterVirtualisedList,
    );

    const filterRef = useMemo(() => {
        return filterObjRef(attributeFilter);
    }, [attributeFilter]);

    const dispatch = useDashboardDispatch();

    const handleRemoveAttributeFilter = useCallback(
        () => dispatch(removeAttributeFilter(filter.attributeFilter.localIdentifier!)),
        [filter, dispatch],
    );

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
        return function DropdownButton(props: IAttributeFilterDropdownButtonProps) {
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
                    // eslint-disable-next-line react/display-name
                    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                },
            );

            const CustomTooltipComponent = useMemo(() => {
                if (displayAttributeTooltip && attributeDataSet && isOpen) {
                    return function TooltipComponent() {
                        return (
                            <AttributeDatasetInfo
                                title={title}
                                defaultAttributeFilterTitle={defaultAttributeFilterTitle}
                                attributeDataSet={attributeDataSet}
                            />
                        );
                    };
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
        };
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
        return function DropdownActions(props: IAttributeFilterDropdownActionsProps) {
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
                            onDeleteButtonClick={() => {
                                handleRemoveAttributeFilter();
                            }}
                            attributes={attributes}
                        />
                    )}
                </>
            );
        };
    }, [
        isConfigurationOpen,
        cancelText,
        saveText,
        filter.attributeFilter.displayForm,
        filter.attributeFilter.selectionMode,
        applyText,
        attributes,
        handleRemoveAttributeFilter,
    ]);

    const CustomElementsSelect = useMemo(() => {
        return function ElementsSelect(props: IAttributeFilterElementsSelectProps) {
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
        };
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

    const CustomStatusBarComponent = useMemo(() => {
        return function StatusBar(props: IAttributeFilterStatusBarProps) {
            const enableShowingFilteredElements = !!capabilities.supportsShowingFilteredElements;
            const handleShowFilteredElements = () => {
                props.onShowFilteredElements?.();
                userInteraction.attributeFilterInteraction("attributeFilterShowAllValuesClicked");
            };

            if (filter.attributeFilter.selectionMode === "single") {
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
                        userInteraction.attributeFilterInteraction(
                            "attributeFilterClearIrrelevantValuesClicked",
                        );
                    }}
                    enableShowingFilteredElements={enableShowingFilteredElements}
                />
            );
        };
    }, [
        filter.attributeFilter.selectionMode,
        filter.attributeFilter.validateElementsBy,
        capabilities.supportsShowingFilteredElements,
        userInteraction,
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
                ) => {
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
                        false,
                        isResultOfMigration,
                    );
                }}
                onSelect={(newFilter, isInverted, selectionMode, selectionTitles, displayAsLabel) => {
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
                selectFirst={true}
                attributeFilterMode={
                    readonly
                        ? DashboardAttributeFilterConfigModeValues.READONLY
                        : DashboardAttributeFilterConfigModeValues.ACTIVE
                }
                customIcon={visibilityIcon}
                StatusBarComponent={CustomStatusBarComponent}
                enableDuplicatedLabelValuesInAttributeFilter={enableDuplicatedLabelValuesInAttributeFilter}
                enableImmediateAttributeFilterDisplayAsLabelMigration={
                    enableImmediateAttributeFilterDisplayAsLabelMigration
                }
                enableAttributeFilterVirtualised={enableAttributeFilterVirtualisedList}
                withoutApply={isApplyAllAtOnceEnabledAndSet}
                enableDashboardFiltersApplyWithoutLoading={true}
            />
        </AttributeFilterParentFilteringProvider>
    );
};
