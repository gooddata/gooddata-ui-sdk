// (C) 2025 GoodData Corporation

import { KeyboardEvent, ReactElement, ReactNode, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import {
    FilterContextItem,
    ICatalogAttribute,
    ICatalogDateDataset,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfigItem,
    ObjRef,
    areObjRefsEqual,
    dashboardFilterLocalIdentifier,
    isCatalogAttribute,
    isCatalogDateDataset,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    OverlayPositionType,
    Typography,
    UiButton,
    UiIconButton,
    UiTooltip,
    isActionKey,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { AutomationAttributeFilter } from "./AutomationAttributeFilter.js";
import { AutomationDateFilter } from "./AutomationDateFilter.js";
import {
    AUTOMATION_FILTERS_DIALOG_ID,
    AUTOMATION_FILTERS_DIALOG_TITLE_ID,
    AUTOMATION_FILTERS_GROUP_LABEL_ID,
} from "../../constants/automations.js";
import { AttributesDropdown } from "../../filterBar/index.js";
import { useAutomationFilters } from "../useAutomationFilters.js";

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

export function AutomationFiltersSelect({
    availableFilters = [],
    selectedFilters = [],
    onFiltersChange,
    isDashboardAutomation,
    storeFilters,
    onStoreFiltersChange,
    areFiltersMissing,
    overlayPositionType,
}: IAutomationFiltersSelectProps) {
    const {
        commonDateFilterId,
        lockedFilters,
        visibleFilters: filters,
        attributes,
        dateDatasets,
        attributeConfigs,
        dateConfigs,
        filterAnnouncement,
        filterGroupRef,
        handleAddFilter,
        handleDeleteFilter,
        handleChangeFilter,
        handleStoreFiltersChange,
        makeFilterGroupUnfocusable,
        setAddFilterButtonRefs,
    } = useAutomationFilters({
        availableFilters,
        selectedFilters,
        onFiltersChange,
        onStoreFiltersChange,
    });

    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(false);
    const isExpandable = filters.length > COLLAPSED_FILTERS_COUNT;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (isActionKey(e)) {
            e.preventDefault();
            handleStoreFiltersChange(!storeFilters);
        }
    };

    const automationFilterSelectTooltipId = useIdPrefixed("automation-filter-select-tooltip");
    const isAddButtonDisabled = availableFilters?.length === selectedFilters?.length;
    const tooltipTextValues = {
        add: intl.formatMessage({ id: "dialogs.automation.filters.add" }),
        addDisabled: intl.formatMessage({ id: "dialogs.automation.filters.addDisabled" }),
    };
    const tooltipText = isAddButtonDisabled ? tooltipTextValues.addDisabled : tooltipTextValues.add;
    const searchAriaLabel = intl.formatMessage({ id: "dialogs.automation.filters.searchAriaLabel" });

    return (
        <div className="gd-input-component gd-notification-channels-automation-filters s-gd-notifications-channels-dialog-automation-filters">
            <div className="gd-label" id={AUTOMATION_FILTERS_GROUP_LABEL_ID}>
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
                                ariaDescription: isExpanded
                                    ? intl.formatMessage({
                                          id: "dialogs.automation.filters.showLess.ariaDescription",
                                      })
                                    : intl.formatMessage({
                                          id: "dialogs.automation.filters.showAll.ariaDescription",
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
                <div
                    className="gd-automation-filters__list"
                    role="group"
                    aria-labelledby={AUTOMATION_FILTERS_GROUP_LABEL_ID}
                    ref={filterGroupRef}
                    onBlur={makeFilterGroupUnfocusable}
                >
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
                            id={AUTOMATION_FILTERS_DIALOG_ID}
                            onClose={() => {}}
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
                            renderVirtualisedList
                            accessibilityConfig={{
                                ariaLabelledBy: AUTOMATION_FILTERS_DIALOG_TITLE_ID,
                                searchAriaLabel: searchAriaLabel,
                            }}
                            DropdownButtonComponent={({ buttonRef, isOpen, onClick }) => (
                                <UiTooltip
                                    arrowPlacement="left"
                                    triggerBy={["hover", "focus"]}
                                    content={tooltipText}
                                    anchor={
                                        <ButtonDisabledFocusableWrapper
                                            isDisabled={isAddButtonDisabled}
                                            ariaLabel={tooltipText}
                                            onRefSet={(element) => setAddFilterButtonRefs(element, buttonRef)}
                                        >
                                            <UiIconButton
                                                icon="plus"
                                                label={tooltipText}
                                                onClick={onClick}
                                                variant="tertiary"
                                                isDisabled={isAddButtonDisabled}
                                                ref={(element) => {
                                                    if (!isAddButtonDisabled) {
                                                        setAddFilterButtonRefs(element, buttonRef);
                                                    }
                                                }}
                                                accessibilityConfig={{
                                                    ariaLabel: tooltipText,
                                                    ariaControls: AUTOMATION_FILTERS_DIALOG_ID,
                                                    ariaExpanded: isOpen,
                                                    ariaHaspopup: "dialog",
                                                }}
                                            />
                                        </ButtonDisabledFocusableWrapper>
                                    }
                                />
                            )}
                            DropdownTitleComponent={() => (
                                <div className="gd-automation-filters__dropdown-header">
                                    <Typography tagName="h3" id={AUTOMATION_FILTERS_DIALOG_TITLE_ID}>
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
                                id: "dialogs.automation.filters.useFiltersMessage",
                            })}
                        />
                        <span className="input-label-text gd-automation-filters__use-filters-message">
                            <div id={automationFilterSelectTooltipId} className="sr-only">
                                <FormattedMessage id="dialogs.automation.filters.useFiltersMessage.tooltip" />
                            </div>
                            <FormattedMessage id="dialogs.automation.filters.useFiltersMessage" />
                            <UiTooltip
                                arrowPlacement="left"
                                triggerBy={["hover", "focus"]}
                                optimalPlacement
                                width={300}
                                content={
                                    <FormattedMessage id="dialogs.automation.filters.useFiltersMessage.tooltip" />
                                }
                                anchor={
                                    <UiIconButton
                                        icon="question"
                                        variant="tertiary"
                                        size="xsmall"
                                        accessibilityConfig={{
                                            ariaLabel: intl.formatMessage({
                                                id: "dialogs.automation.filters.schedule.ariaLabel",
                                            }),
                                            ariaDescribedBy: automationFilterSelectTooltipId,
                                        }}
                                    />
                                }
                            />
                        </span>
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

            {/* Screen reader announcement when filters are added, removed, or changed */}
            <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                {filterAnnouncement}
            </div>
        </div>
    );
}

interface IAutomationFilterProps {
    filter: FilterContextItem;
    attributeConfigs: IDashboardAttributeFilterConfig[];
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
    isCommonDateFilter?: boolean;
    overlayPositionType?: OverlayPositionType;
    lockedFilters: FilterContextItem[];
}

function AutomationFilter({
    filter,
    attributeConfigs,
    onChange,
    onDelete,
    isCommonDateFilter,
    overlayPositionType,
    lockedFilters,
}: IAutomationFilterProps) {
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
}

interface IButtonDisabledFocusableWrapperProps {
    isDisabled: boolean;
    ariaLabel: string;
    onRefSet: (element: HTMLButtonElement | HTMLDivElement | null) => void;
    children: ReactNode;
}

/**
 * Conditionally wraps a disabled button to make it focusable with keyboard,
 * since disabled buttons cannot be focused
 */
function ButtonDisabledFocusableWrapper({
    isDisabled,
    ariaLabel,
    onRefSet,
    children,
}: IButtonDisabledFocusableWrapperProps): ReactElement {
    if (!isDisabled) {
        return <>{children}</>;
    }

    return (
        <div
            tabIndex={0}
            aria-disabled
            role="button"
            aria-label={ariaLabel}
            ref={(element) => onRefSet(element as HTMLDivElement | null)}
            onKeyDown={(e) => {
                if (isActionKey(e)) {
                    e.stopPropagation();
                }
            }}
        >
            {children}
        </div>
    );
}

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
