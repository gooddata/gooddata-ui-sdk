// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import {
    AttributeFilterButtonV2,
    IAttributeFilterDropdownButtonProps,
    IAttributeFilterDropdownActionsProps,
} from "@gooddata/sdk-ui-filters";
import {
    AttributeFilterDropdownButton,
    AttributeFilterElementsSelect,
    IAttributeFilterElementsSelectProps,
} from "@gooddata/sdk-ui-filters/esm/internal";

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
} from "../../../model";
import {
    AttributeFilterParentFilteringProvider,
    useAttributeFilterParentFiltering,
} from "./AttributeFilterParentFilteringContext";

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardAttributeFilter = (props: IDashboardAttributeFilterProps): JSX.Element => {
    const { filter, onFilterChanged, isDraggable } = props;
    const { parentFilters, parentFilterOverAttribute } = useParentFilters(filter);
    const locale = useDashboardSelector(selectLocale);
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

    const CustomDropdownButton = useMemo(() => {
        return function DropdownButton(props: IAttributeFilterDropdownButtonProps) {
            return <AttributeFilterDropdownButton {...props} isDraggable={isDraggable} />;
        };
    }, [isDraggable]);

    const CustomDropdownActions = useMemo(() => {
        return function DropdownActions(props: IAttributeFilterDropdownActionsProps) {
            const {
                onConfigurationSave,
                parentsConfigChanged,
                connectingAttributeChanged,
                displayFormChanged,
            } = useAttributeFilterParentFiltering();

            return (
                <>
                    {isConfigurationOpen ? (
                        <CustomConfigureAttributeFilterDropdownActions
                            isSaveDisabled={
                                !(parentsConfigChanged || displayFormChanged || connectingAttributeChanged)
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
                            applyText={applyText}
                            cancelText={cancelText}
                            onConfigurationButtonClick={() => {
                                setIsConfigurationOpen(true);
                            }}
                            onDeleteButtonClick={() => {
                                handleRemoveAttributeFilter();
                            }}
                        />
                    )}
                </>
            );
        };
    }, [isConfigurationOpen, cancelText, saveText, applyText, handleRemoveAttributeFilter]);

    const CustomElementsSelect = useMemo(() => {
        return function ElementsSelect(props: IAttributeFilterElementsSelectProps) {
            return (
                <>
                    {isConfigurationOpen ? (
                        <AttributeFilterConfiguration
                            closeHandler={() => setIsConfigurationOpen(false)}
                            filterRef={filterRef}
                            onChange={() => {}}
                            filterByText={filterByText}
                            displayValuesAsText={displayValuesAsText}
                        />
                    ) : (
                        <AttributeFilterElementsSelect {...props} />
                    )}
                </>
            );
        };
    }, [isConfigurationOpen, filterRef, filterByText, displayValuesAsText]);

    return (
        <AttributeFilterParentFilteringProvider filter={filter}>
            <AttributeFilterButtonV2
                filter={attributeFilter}
                onApply={(newFilter) => {
                    onFilterChanged(
                        attributeFilterToDashboardAttributeFilter(
                            newFilter,
                            filter.attributeFilter.localIdentifier,
                        ),
                    );
                }}
                parentFilters={parentFilters}
                parentFilterOverAttribute={parentFilterOverAttribute}
                locale={locale}
                DropdownButtonComponent={CustomDropdownButton}
                DropdownActionsComponent={CustomDropdownActions}
                ElementsSelectComponent={CustomElementsSelect}
            />
        </AttributeFilterParentFilteringProvider>
    );
};
