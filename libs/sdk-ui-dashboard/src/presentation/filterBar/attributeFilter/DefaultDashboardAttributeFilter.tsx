// (C) 2021-2022 GoodData Corporation
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
} from "../../../model";
import {
    AttributeFilterParentFilteringProvider,
    useAttributeFilterParentFiltering,
} from "./AttributeFilterParentFilteringContext";
import { useMediaQuery } from "@gooddata/sdk-ui-kit";

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardAttributeFilter = (props: IDashboardAttributeFilterProps): JSX.Element => {
    const { filter, onFilterChanged, isDraggable, autoOpen, onClose } = props;
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

    const onCloseFilter = useCallback(() => {
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    const CustomDropdownButton = useMemo(() => {
        return function DropdownButton(props: IAttributeFilterDropdownButtonProps) {
            const { isOpen } = props;
            const isMobile = useMediaQuery("mobileDevice");
            useAutoOpenAttributeFilterDropdownButton(props, !!autoOpen);
            useOnCloseAttributeFilterDropdownButton(props, onCloseFilter);

            let buttonSpacing: React.CSSProperties = isDraggable
                ? { margin: "7px 11px 7px -10px" }
                : { margin: "7px 11px 7px 0" };

            if (isOpen && isMobile) {
                buttonSpacing = {};
            }

            return (
                <div style={buttonSpacing}>
                    <AttributeFilterDropdownButton {...props} isDraggable={isDraggable} />
                </div>
            );
        };
    }, [isDraggable, autoOpen, onCloseFilter]);

    const CustomDropdownActions = useMemo(() => {
        return function DropdownActions(props: IAttributeFilterDropdownActionsProps) {
            const { onConfigurationSave, configurationChanged, displayFormChanged, onConfigurationClose } =
                useAttributeFilterParentFiltering();

            return (
                <>
                    {isConfigurationOpen ? (
                        <CustomConfigureAttributeFilterDropdownActions
                            isSaveDisabled={!(configurationChanged || displayFormChanged)}
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
                                onConfigurationClose();
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
            const closeHandler = useCallback(() => {
                setIsConfigurationOpen(false);
            }, []);
            return (
                <>
                    {isConfigurationOpen ? (
                        <AttributeFilterConfiguration
                            closeHandler={closeHandler}
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
            <AttributeFilterButton
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
                fullscreenOnMobile
            />
        </AttributeFilterParentFilteringProvider>
    );
};
