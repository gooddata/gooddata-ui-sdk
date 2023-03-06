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
} from "@gooddata/sdk-ui-filters";

import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "../../../_staging/dashboard/dashboardFilterConverter";

import { IDashboardAttributeFilterProps } from "./types";
import { useParentFilters } from "./useParentFilters";
import { filterObjRef } from "@gooddata/sdk-model";
import { AttributeFilterConfiguration } from "./dashboardDropdownBody/configuration/AttributeFilterConfiguration";
import {
    CustomAttributeFilterDropdownActions,
    CustomConfigureAttributeFilterDropdownActions,
} from "./CustomDropdownActions";
import {
    removeAttributeFilter,
    useDashboardDispatch,
    selectLocale,
    useDashboardSelector,
    selectSettings,
} from "../../../model";
import {
    AttributeFilterParentFilteringProvider,
    useAttributeFilterParentFiltering,
} from "./AttributeFilterParentFilteringContext";
import { LoadingMask, LOADING_HEIGHT } from "@gooddata/sdk-ui-kit";
import { useAttributes } from "../../../_staging/sharedHooks/useAttributes";

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
    const { enableKPIAttributeFilterRenaming } = useDashboardSelector(selectSettings);
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
            useAutoOpenAttributeFilterDropdownButton(props, !!autoOpen);
            useOnCloseAttributeFilterDropdownButton(props, onCloseFilter);
            return <AttributeFilterDropdownButton {...props} isDraggable={isDraggable} />;
        };
    }, [isDraggable, autoOpen, onCloseFilter]);

    const CustomDropdownActions = useMemo(() => {
        return function DropdownActions(props: IAttributeFilterDropdownActionsProps) {
            const {
                title,
                configurationChanged,
                displayFormChanged,
                titleChanged,
                onConfigurationSave,
                onConfigurationClose,
            } = useAttributeFilterParentFiltering();

            const isTitleDefined = !!title && title.length > 0;

            return (
                <>
                    {isConfigurationOpen ? (
                        <CustomConfigureAttributeFilterDropdownActions
                            isSaveDisabled={
                                isTitleDefined
                                    ? !(configurationChanged || displayFormChanged || titleChanged)
                                    : true
                            }
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
                        />
                    ) : (
                        <AttributeFilterElementsSelect {...props} />
                    )}
                </>
            );
        };
    }, [isConfigurationOpen, filterRef, filterByText, displayValuesAsText, titleText, resetTitleText]);

    return (
        <AttributeFilterParentFilteringProvider filter={filter} attributes={attributes ?? []}>
            <AttributeFilterButton
                title={enableKPIAttributeFilterRenaming ? filter.attributeFilter.title : undefined}
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
            />
        </AttributeFilterParentFilteringProvider>
    );
};
