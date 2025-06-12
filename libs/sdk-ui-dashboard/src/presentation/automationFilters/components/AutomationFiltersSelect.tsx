// (C) 2025 GoodData Corporation

import {
    areObjRefsEqual,
    dashboardFilterLocalIdentifier,
    FilterContextItem,
    ICatalogAttribute,
    ICatalogDateDataset,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfigItem,
    isCatalogAttribute,
    isCatalogDateDataset,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    Icon,
    isActionKey,
    OverlayPositionType,
    Typography,
    UiButton,
    UiIconButton,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import noop from "lodash/noop.js";
import React, { RefObject, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { gdColorStateBlank } from "../../constants/colors.js";
import { AttributesDropdown } from "../../filterBar/index.js";
import { useAutomationFilters } from "../useAutomationFilters.js";
import { AutomationAttributeFilter } from "./AutomationAttributeFilter.js";
import { AutomationDateFilter } from "./AutomationDateFilter.js";

const COLLAPSED_FILTERS_COUNT = 2;

export interface IAutomationFiltersProps {
    id?: string;
    filters: FilterContextItem[] | undefined;
    attributeConfigs: IDashboardAttributeFilterConfig[];
    dateConfigs: IDashboardDateFilterConfigItem[];
    attributes: ICatalogAttribute[];
    dateDatasets: ICatalogDateDataset[];
    handleChangeFilter: (filter: FilterContextItem | undefined) => void;
    handleDeleteFilter: (filter: FilterContextItem) => void;
    handleAddFilter: (
        displayForm: ObjRef,
        attributes: ICatalogAttribute[],
        dateDatasets: ICatalogDateDataset[],
    ) => void;
    storeFilters: boolean;
    handleStoreFiltersChange: (value: boolean) => void;
    isDashboardAutomation?: boolean;
    areFiltersMissing?: boolean;
}

export interface IAutomationFiltersSelectProps {
    availableFilters: FilterContextItem[] | undefined;
    selectedFilters: FilterContextItem[] | undefined;
    onFiltersChange: (filters: FilterContextItem[]) => void;
    storeFilters: boolean;
    onStoreFiltersChange: (value: boolean, filters: FilterContextItem[]) => void;
    isDashboardAutomation?: boolean;
    areFiltersMissing?: boolean;
    overlayPositionType?: OverlayPositionType;
}

export const AutomationFiltersSelect: React.FC<IAutomationFiltersSelectProps> = ({
    availableFilters = [],
    selectedFilters = [],
    onFiltersChange,
    isDashboardAutomation,
    storeFilters,
    onStoreFiltersChange,
    areFiltersMissing,
    overlayPositionType,
}) => {
    const {
        commonDateFilterId,
        lockedFilters,
        visibleFilters: filters,
        attributes,
        dateDatasets,
        attributeConfigs,
        dateConfigs,
        handleAddFilter,
        handleDeleteFilter,
        handleChangeFilter,
        handleStoreFiltersChange,
    } = useAutomationFilters({
        availableFilters,
        selectedFilters,
        onFiltersChange,
        onStoreFiltersChange,
    });

    const theme = useTheme();
    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(false);
    const isExpandable = filters.length > COLLAPSED_FILTERS_COUNT;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isActionKey(e)) {
            e.preventDefault();
            handleStoreFiltersChange(!storeFilters);
        }
    };

    return (
        <div className="gd-input-component gd-notification-channels-automation-filters s-gd-notifications-channels-dialog-automation-filters">
            <div className="gd-label">
                {isExpandable ? (
                    <BubbleHoverTrigger showDelay={500} hideDelay={0}>
                        <UiButton
                            label={intl.formatMessage(
                                { id: "dialogs.schedule.email.filters" },
                                { count: filters.length },
                            )}
                            variant="tertiary"
                            onClick={() => setIsExpanded(!isExpanded)}
                            iconAfter={isExpanded ? "navigateUp" : "navigateDown"}
                            accessibilityConfig={{
                                ariaExpanded: isExpanded,
                                ariaLabel: isExpanded
                                    ? intl.formatMessage({
                                          id: "dialogs.automation.filters.showLess.ariaLabel",
                                      })
                                    : intl.formatMessage({
                                          id: "dialogs.automation.filters.showAll.ariaLabel",
                                      }),
                                iconAriaHidden: true,
                            }}
                        />
                        <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                            {isExpanded ? (
                                <FormattedMessage id="dialogs.automation.filters.showLess" />
                            ) : (
                                <FormattedMessage id="dialogs.automation.filters.showAll" />
                            )}
                        </Bubble>
                    </BubbleHoverTrigger>
                ) : (
                    <FormattedMessage
                        id="dialogs.schedule.email.filters"
                        values={{ count: filters.length }}
                    />
                )}
            </div>
            <div className="gd-automation-filters">
                <div className="gd-automation-filters__list">
                    {filters.slice(0, isExpanded ? filters.length : COLLAPSED_FILTERS_COUNT).map((filter) => {
                        const isCommonDateFilter =
                            isDashboardCommonDateFilter(filter) ||
                            (isDashboardDateFilter(filter) &&
                                commonDateFilterId === filter.dateFilter.localIdentifier);

                        return (
                            <AutomationFilter
                                key={
                                    isDashboardAttributeFilter(filter)
                                        ? filter.attributeFilter.localIdentifier
                                        : filter.dateFilter.localIdentifier
                                }
                                filter={filter}
                                attributeConfigs={attributeConfigs}
                                onChange={handleChangeFilter}
                                onDelete={handleDeleteFilter}
                                isCommonDateFilter={isCommonDateFilter}
                                overlayPositionType={overlayPositionType}
                                lockedFilters={lockedFilters}
                            />
                        );
                    })}
                    {isExpanded || !isExpandable ? (
                        <AttributesDropdown
                            onClose={noop}
                            onSelect={(value) => {
                                handleAddFilter(value, attributes, dateDatasets);
                                setIsExpanded(true);
                            }}
                            attributes={attributes}
                            dateDatasets={dateDatasets}
                            openOnInit={false}
                            overlayPositionType={overlayPositionType}
                            className="gd-automation-filters__dropdown s-automation-filters-add-filter-dropdown"
                            getCustomItemTitle={(item) =>
                                getCatalogItemCustomTitle(item, availableFilters, dateConfigs)
                            }
                            renderVirtualisedList={true}
                            DropdownButtonComponent={({ buttonRef, onClick }) => (
                                <UiIconButton
                                    icon="plus"
                                    label={intl.formatMessage({
                                        id: "dialogs.automation.filters.add",
                                    })}
                                    onClick={onClick}
                                    variant="tertiary"
                                    ref={buttonRef as RefObject<HTMLButtonElement>}
                                />
                            )}
                            DropdownTitleComponent={() => (
                                <div className="gd-automation-filters__dropdown-header">
                                    <Typography tagName="h3">
                                        <FormattedMessage id="dialogs.automation.filters.title" />
                                    </Typography>
                                </div>
                            )}
                            renderNoData={() => (
                                <div className="gd-automation-filters__dropdown-no-filters">
                                    <FormattedMessage id="dialogs.automation.filters.noFilters" />
                                </div>
                            )}
                        />
                    ) : null}
                </div>
                {isDashboardAutomation ? (
                    <label className="input-checkbox-label gd-automation-filters__use-filters-checkbox s-automation-filters-use-filters-checkbox">
                        <input
                            type="checkbox"
                            className="input-checkbox s-checkbox"
                            checked={storeFilters}
                            onChange={(e) => handleStoreFiltersChange(e.target.checked)}
                            onKeyDown={handleKeyDown}
                            aria-label={intl.formatMessage({
                                id: "dialogs.automation.filters.attachment",
                            })}
                        />
                        <span className="input-label-text">
                            <FormattedMessage id="dialogs.automation.filters.useFiltersMessage" />
                        </span>
                        <BubbleHoverTrigger eventsOnBubble>
                            <Icon.QuestionMark
                                className="gd-automation-filters__checkbox-icon"
                                color={theme?.palette?.complementary?.c6 ?? gdColorStateBlank}
                                width={14}
                                height={14}
                                ariaHidden={true}
                            />
                            <Bubble alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}>
                                <FormattedMessage
                                    id="dialogs.automation.filters.useFiltersMessage.tooltip"
                                    values={{
                                        a: (chunk) => (
                                            <a
                                                href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#filters"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {chunk}
                                            </a>
                                        ),
                                    }}
                                />
                            </Bubble>
                        </BubbleHoverTrigger>
                    </label>
                ) : (
                    <div className="gd-automation-filters__message">
                        <FormattedMessage id="dialogs.automation.filters.activeFilters" />
                    </div>
                )}
                {areFiltersMissing ? (
                    <div className="gd-automation-filters__warning-message">
                        <FormattedMessage
                            id="dialogs.automation.filters.missing"
                            values={{
                                b: (chunk) => <strong>{chunk}</strong>,
                            }}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

interface IAutomationFilterProps {
    filter: FilterContextItem;
    attributeConfigs: IDashboardAttributeFilterConfig[];
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
    isCommonDateFilter?: boolean;
    overlayPositionType?: OverlayPositionType;
    lockedFilters: FilterContextItem[];
}

const AutomationFilter: React.FC<IAutomationFilterProps> = ({
    filter,
    attributeConfigs,
    onChange,
    onDelete,
    isCommonDateFilter,
    overlayPositionType,
    lockedFilters,
}) => {
    if (isDashboardAttributeFilter(filter)) {
        const config = attributeConfigs.find(
            (attribute) => attribute.localIdentifier === filter.attributeFilter.localIdentifier,
        );
        const displayAsLabel = config?.displayAsLabel;
        const isLocked = lockedFilters.some(
            (f) => dashboardFilterLocalIdentifier(f) === dashboardFilterLocalIdentifier(filter),
        );

        return (
            <AutomationAttributeFilter
                key={filter.attributeFilter.localIdentifier}
                filter={filter}
                onChange={onChange}
                onDelete={onDelete}
                isLocked={isLocked}
                displayAsLabel={displayAsLabel}
                overlayPositionType={overlayPositionType}
            />
        );
    } else {
        const isLocked = lockedFilters.some(
            (f) => dashboardFilterLocalIdentifier(f) === dashboardFilterLocalIdentifier(filter),
        );

        return (
            <AutomationDateFilter
                key={filter.dateFilter.localIdentifier}
                filter={filter}
                onChange={onChange}
                onDelete={onDelete}
                isLocked={isLocked}
                isCommonDateFilter={isCommonDateFilter}
                overlayPositionType={overlayPositionType}
            />
        );
    }
};

/**
 * Get custom dashboard filter title for relevant catalog item,
 * so we can show it in the catalog items dropdown.
 */
function getCatalogItemCustomTitle(
    item: ICatalogAttribute | ICatalogDateDataset,
    availableFilters: FilterContextItem[],
    dateConfigs: IDashboardDateFilterConfigItem[],
) {
    if (isCatalogAttribute(item)) {
        const availableFilter = availableFilters?.find(
            (filter): filter is IDashboardAttributeFilter =>
                isDashboardAttributeFilter(filter) &&
                areObjRefsEqual(filter.attributeFilter.displayForm, item.defaultDisplayForm.ref),
        );
        return availableFilter?.attributeFilter.title;
    } else if (isCatalogDateDataset(item)) {
        const selectedConfig = dateConfigs?.find((config) =>
            areObjRefsEqual(config.dateDataSet, item.dataSet.ref),
        );
        return selectedConfig?.config.filterName;
    }

    return undefined;
}
