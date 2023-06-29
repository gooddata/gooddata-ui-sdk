// (C) 2021-2023 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
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
} from "@gooddata/sdk-ui-filters";

import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "../../../_staging/dashboard/dashboardFilterConverter.js";

import { IDashboardAttributeFilterProps } from "./types.js";
import { useParentFilters } from "./useParentFilters.js";
import { filterObjRef } from "@gooddata/sdk-model";
import { AttributeFilterConfiguration } from "./dashboardDropdownBody/configuration/AttributeFilterConfiguration.js";
import {
    CustomAttributeFilterDropdownActions,
    CustomConfigureAttributeFilterDropdownActions,
} from "./CustomDropdownActions.js";
import {
    removeAttributeFilter,
    useDashboardDispatch,
    selectLocale,
    useDashboardSelector,
    selectIsInEditMode,
} from "../../../model/index.js";
import {
    AttributeFilterParentFilteringProvider,
    useAttributeFilterParentFiltering,
} from "./AttributeFilterParentFilteringContext.js";
import { LoadingMask, LOADING_HEIGHT } from "@gooddata/sdk-ui-kit";
import { useAttributes } from "../../../_staging/sharedHooks/useAttributes.js";
import { useAttributeDataSet } from "./dashboardDropdownBody/configuration/hooks/useAttributeDataSet.js";

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
    const { filter, onFilterChanged, isDraggable, autoOpen, onClose } = props;
    const { parentFilters, parentFilterOverAttribute } = useParentFilters(filter);
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const attributeFilter = useMemo(() => dashboardAttributeFilterToAttributeFilter(filter), [filter]);
    const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);

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

    const onCloseFilter = useCallback(() => {
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    const attributeFilterRef = useMemo(() => {
        return [filterRef];
    }, [filterRef]);

    const { attributes } = useAttributes(attributeFilterRef);

    const CustomDropdownButton = useMemo(() => {
        return function DropdownButton(props: IAttributeFilterDropdownButtonProps) {
            useAutoOpenAttributeFilterDropdownButton(props, Boolean(autoOpen));
            useOnCloseAttributeFilterDropdownButton(props, onCloseFilter);

            const { isOpen, title } = props;
            const { defaultAttributeFilterTitle, displayFormChangeStatus, attributeFilterDisplayForm } =
                useAttributeFilterParentFiltering();

            const { attributeDataSet } = useAttributeDataSet(attributeFilterDisplayForm);

            const displayAttributeTooltip = isEditMode && displayFormChangeStatus !== "running";

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
            }, [displayAttributeTooltip, defaultAttributeFilterTitle, attributeDataSet, isOpen, title]);

            return (
                <AttributeFilterDropdownButton
                    {...props}
                    isDraggable={isDraggable}
                    TooltipContentComponent={CustomTooltipComponent}
                />
            );
        };
    }, [isDraggable, autoOpen, isEditMode, onCloseFilter]);

    const CustomDropdownActions = useMemo(() => {
        return function DropdownActions(props: IAttributeFilterDropdownActionsProps) {
            const {
                title,
                configurationChanged,
                displayFormChanged,
                titleChanged,
                onConfigurationSave,
                onConfigurationClose,
                selectionModeChanged,
            } = useAttributeFilterParentFiltering();

            const isTitleDefined = !!title && title.length > 0;
            const isSaveDisabled = isTitleDefined
                ? !(configurationChanged || displayFormChanged || titleChanged || selectionModeChanged)
                : true;

            return (
                <>
                    {isConfigurationOpen ? (
                        <CustomConfigureAttributeFilterDropdownActions
                            isSaveDisabled={isSaveDisabled}
                            onSaveButtonClick={() => {
                                onConfigurationSave();
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
                            cancelText={cancelText}
                            onConfigurationButtonClick={() => {
                                setIsConfigurationOpen(true);
                                onConfigurationClose();
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
                            closeHandler={closeHandler}
                            filterRef={filterRef}
                            filterByText={filterByText}
                            displayValuesAsText={displayValuesAsText}
                            titleText={titleText}
                            resetTitleText={resetTitleText}
                            selectionTitleText={selectionTitleText}
                            multiSelectionOptionText={multiSelectionOptionText}
                            singleSelectionOptionText={singleSelectionOptionText}
                            singleSelectionDisabledTooltip={singleSelectionDisabledTooltip}
                            parentFiltersDisabledTooltip={parentFiltersDisabledTooltip}
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
    ]);

    return (
        <AttributeFilterParentFilteringProvider filter={filter} attributes={attributes}>
            <AttributeFilterButton
                title={filter.attributeFilter.title}
                resetOnParentFilterChange={false}
                filter={attributeFilter}
                onApply={(newFilter) => {
                    onFilterChanged(
                        attributeFilterToDashboardAttributeFilter(
                            newFilter,
                            filter.attributeFilter.localIdentifier,
                            filter.attributeFilter.title,
                        ),
                    );
                }}
                parentFilters={parentFilters}
                parentFilterOverAttribute={parentFilterOverAttribute}
                locale={locale}
                DropdownButtonComponent={CustomDropdownButton}
                DropdownActionsComponent={CustomDropdownActions}
                ElementsSelectComponent={CustomElementsSelect}
                fullscreenOnMobile
                selectionMode={filter.attributeFilter.selectionMode}
                selectFirst={true}
            />
        </AttributeFilterParentFilteringProvider>
    );
};
