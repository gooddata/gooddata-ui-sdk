// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, type ReactNode, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import {
    type FilterContextItem,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfigItem,
    type ObjRef,
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
    type OverlayPositionType,
    Typography,
    UiButton,
    UiIconButton,
    UiTooltip,
    isActionKey,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { AutomationAttributeFilter } from "./AutomationAttributeFilter.js";
import { AutomationDateFilter } from "./AutomationDateFilter.js";
import { type IAutomationFiltersTab } from "../../../model/index.js";
import {
    AUTOMATION_FILTERS_DIALOG_ID,
    AUTOMATION_FILTERS_DIALOG_TITLE_ID,
    AUTOMATION_FILTERS_GROUP_LABEL_ID,
} from "../../constants/automations.js";
import { AttributesDropdown } from "../../filterBar/index.js";
import { useAutomationFilters, useAutomationFiltersByTab } from "../useAutomationFilters.js";

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
    onFiltersChange: (filters: FilterContextItem[], enableNewScheduledExport: boolean) => void;
    storeFilters: boolean;
    onStoreFiltersChange: (
        value: boolean,
        filters?: FilterContextItem[],
        filtersByTab?: Record<string, FilterContextItem[]>,
    ) => void;
    isDashboardAutomation?: boolean;
    areFiltersMissing?: boolean;
    overlayPositionType?: OverlayPositionType;
    hideTitle?: boolean;
    showAllFilters?: boolean;
    disableDateFilters?: boolean;
    /**
     * Filters structured per tab.
     * When provided (with multiple tabs), filters will be rendered grouped by tab sections.
     * When undefined or single tab, the flat filter list is used instead.
     */
    filtersByTab?: IAutomationFiltersTab[];
    /**
     * Edited filters per tab state.
     * Used together with filtersByTab to track user edits per tab.
     */
    editedFiltersByTab?: Record<string, FilterContextItem[]>;
    /**
     * Callback to update filters for a specific tab.
     * Called when user adds, changes, or removes a filter in a tab section.
     */
    onFiltersByTabChange?: (filtersByTab: Record<string, FilterContextItem[]>) => void;
}

interface IAutomationCheckboxOrNoteProps {
    isDashboardAutomation?: boolean;
    storeFilters: boolean;
    handleStoreFiltersChange: (value: boolean) => void;
    handleKeyDown: (e: KeyboardEvent) => void;
    automationFilterSelectTooltipId: string;
}

function AutomationCheckboxOrNote({
    isDashboardAutomation,
    storeFilters,
    handleStoreFiltersChange,
    handleKeyDown,
    automationFilterSelectTooltipId,
}: IAutomationCheckboxOrNoteProps) {
    const intl = useIntl();
    return isDashboardAutomation ? (
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
                    content={<FormattedMessage id="dialogs.automation.filters.useFiltersMessage.tooltip" />}
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
    );
}

function Divider() {
    return <div className="gd-automation-filters__divider" style={{ height: "20px" }} />;
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
    hideTitle = false,
    showAllFilters = false,
    disableDateFilters = false,
    filtersByTab,
    editedFiltersByTab,
    onFiltersByTabChange,
}: IAutomationFiltersSelectProps) {
    // Determine rendering mode first
    const shouldRenderByTab = !!filtersByTab && filtersByTab.length > 1;

    // Use appropriate hook based on rendering mode
    const flatFiltersData = useAutomationFilters({
        availableFilters,
        selectedFilters,
        disableDateFilters,
        onFiltersChange,
        onStoreFiltersChange,
    });

    const tabFiltersData = useAutomationFiltersByTab({
        filtersByTab,
        editedFiltersByTab,
        onFiltersByTabChange,
        onStoreFiltersChange,
        disableDateFilters,
    });

    // Use data from the appropriate hook based on rendering mode
    const {
        commonDateFilterId,
        lockedFilters,
        attributeConfigs,
        dateConfigs,
        filterAnnouncement,
        filterGroupRef,
        makeFilterGroupUnfocusable,
        setAddFilterButtonRefs,
    } = shouldRenderByTab && tabFiltersData.processedFiltersByTab ? tabFiltersData : flatFiltersData;

    const filters = shouldRenderByTab ? [] : flatFiltersData.visibleFilters;
    const attributes = shouldRenderByTab ? [] : flatFiltersData.attributes;
    const dateDatasets = shouldRenderByTab ? [] : flatFiltersData.dateDatasets;

    const handleChangeFilter = shouldRenderByTab
        ? () => {} // Not used in tab mode
        : flatFiltersData.handleChangeFilter;

    const handleDeleteFilter = shouldRenderByTab
        ? () => {} // Not used in tab mode
        : flatFiltersData.handleDeleteFilter;

    const handleAddFilter = shouldRenderByTab
        ? () => {} // Not used in tab mode
        : flatFiltersData.handleAddFilter;

    const handleStoreFiltersChange = shouldRenderByTab
        ? tabFiltersData.handleStoreFiltersChange
        : flatFiltersData.handleStoreFiltersChange;

    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(showAllFilters);
    const isExpandable = !showAllFilters && filters.length > COLLAPSED_FILTERS_COUNT;

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

    const disableFilters = !storeFilters && !!isDashboardAutomation;

    return (
        <div className="gd-input-component gd-notification-channels-automation-filters s-gd-notifications-channels-dialog-automation-filters">
            {hideTitle ? (
                <div className="sr-only" id={AUTOMATION_FILTERS_GROUP_LABEL_ID}>
                    <FormattedMessage
                        id="dialogs.schedule.email.filters"
                        values={{ count: filters.length }}
                    />
                </div>
            ) : (
                <div className="gd-label" id={AUTOMATION_FILTERS_GROUP_LABEL_ID}>
                    {isExpandable && !shouldRenderByTab ? (
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
            )}
            <div className="gd-automation-filters">
                {showAllFilters ? (
                    <>
                        <AutomationCheckboxOrNote
                            isDashboardAutomation={isDashboardAutomation}
                            storeFilters={storeFilters}
                            handleStoreFiltersChange={handleStoreFiltersChange}
                            handleKeyDown={handleKeyDown}
                            automationFilterSelectTooltipId={automationFilterSelectTooltipId}
                        />
                        <Divider />
                    </>
                ) : null}

                <div
                    className={`gd-automation-filters__wrapper${storeFilters || !isDashboardAutomation ? "" : " gd-automation-filters__wrapper--disabled"}`}
                >
                    {disableFilters ? <div className="gd-automation-filters__overlay" /> : null}
                    {shouldRenderByTab && tabFiltersData.processedFiltersByTab ? (
                        // Render filters grouped by tab with dividers between sections
                        <div
                            className="gd-automation-filters__list gd-automation-filters__list--tabbed"
                            role="group"
                            aria-labelledby={AUTOMATION_FILTERS_GROUP_LABEL_ID}
                            ref={filterGroupRef}
                            onBlur={makeFilterGroupUnfocusable}
                        >
                            {tabFiltersData.processedFiltersByTab.map((tab, index) => {
                                // Check if all filters for this tab are already selected
                                const tabEditedFilters = editedFiltersByTab?.[tab.tabId] ?? [];
                                const tabAvailableFilters =
                                    filtersByTab?.find((t) => t.tabId === tab.tabId)?.availableFilters ?? [];
                                const isTabAddButtonDisabled =
                                    tabEditedFilters.length >= tabAvailableFilters.length;
                                const tabTooltipText = isTabAddButtonDisabled
                                    ? tooltipTextValues.addDisabled
                                    : tooltipTextValues.add;

                                return (
                                    <AutomationFiltersTabSection
                                        key={tab.tabId}
                                        tabTitle={tab.tabTitle}
                                        tabId={tab.tabId}
                                        filters={tab.visibleFilters}
                                        attributeConfigs={tab.attributeConfigs}
                                        commonDateFilterId={commonDateFilterId}
                                        lockedFilters={tab.lockedFilters}
                                        onChange={(filter) =>
                                            tabFiltersData.handleTabFilterChange(tab.tabId, filter)
                                        }
                                        onDelete={(filter) =>
                                            tabFiltersData.handleTabFilterDelete(tab.tabId, filter)
                                        }
                                        overlayPositionType={overlayPositionType}
                                        showDivider={index < tabFiltersData.processedFiltersByTab!.length - 1}
                                        readonlyFilters={disableFilters}
                                        // Add button for each tab section
                                        addFilterButton={
                                            <AttributesDropdown
                                                id={`${AUTOMATION_FILTERS_DIALOG_ID}-${tab.tabId}`}
                                                onClose={() => {}}
                                                onSelect={(value) => {
                                                    tabFiltersData.handleTabFilterAdd(
                                                        tab.tabId,
                                                        value,
                                                        tab.attributes,
                                                        tab.dateDatasets,
                                                    );
                                                }}
                                                attributes={tab.attributes}
                                                dateDatasets={tab.dateDatasets}
                                                openOnInit={false}
                                                overlayPositionType={overlayPositionType}
                                                className="gd-automation-filters__dropdown s-automation-filters-add-filter-dropdown"
                                                getCustomItemTitle={(item) =>
                                                    getCatalogItemCustomTitle(
                                                        item,
                                                        availableFilters,
                                                        tab.dateConfigs,
                                                    )
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
                                                        content={tabTooltipText}
                                                        anchor={
                                                            <ButtonDisabledFocusableWrapper
                                                                isDisabled={isTabAddButtonDisabled}
                                                                ariaLabel={tabTooltipText}
                                                                onRefSet={(element) =>
                                                                    setAddFilterButtonRefs(element, buttonRef)
                                                                }
                                                            >
                                                                <UiIconButton
                                                                    icon="plus"
                                                                    label={tabTooltipText}
                                                                    onClick={onClick}
                                                                    variant="tertiary"
                                                                    isDisabled={isTabAddButtonDisabled}
                                                                    ref={(element) => {
                                                                        if (!isTabAddButtonDisabled) {
                                                                            setAddFilterButtonRefs(
                                                                                element,
                                                                                buttonRef,
                                                                            );
                                                                        }
                                                                    }}
                                                                    accessibilityConfig={{
                                                                        ariaLabel: tabTooltipText,
                                                                        ariaControls: isOpen
                                                                            ? `${AUTOMATION_FILTERS_DIALOG_ID}-${tab.tabId}`
                                                                            : undefined,
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
                                                        <Typography
                                                            tagName="h3"
                                                            id={AUTOMATION_FILTERS_DIALOG_TITLE_ID}
                                                        >
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
                                        }
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        // Render flat filter list (original behavior)
                        <div
                            className="gd-automation-filters__list"
                            role="group"
                            aria-labelledby={AUTOMATION_FILTERS_GROUP_LABEL_ID}
                            ref={filterGroupRef}
                            onBlur={makeFilterGroupUnfocusable}
                        >
                            {filters
                                .slice(
                                    0,
                                    showAllFilters || isExpanded ? filters.length : COLLAPSED_FILTERS_COUNT,
                                )
                                .map((filter) => {
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
                                            isReadOnly={disableFilters}
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
                                                    onRefSet={(element) =>
                                                        setAddFilterButtonRefs(element, buttonRef)
                                                    }
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
                                                            ariaControls: isOpen
                                                                ? AUTOMATION_FILTERS_DIALOG_ID
                                                                : undefined,
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
                    )}
                </div>
                {showAllFilters ? null : (
                    <>
                        <Divider />
                        <AutomationCheckboxOrNote
                            isDashboardAutomation={isDashboardAutomation}
                            storeFilters={storeFilters}
                            handleStoreFiltersChange={handleStoreFiltersChange}
                            handleKeyDown={handleKeyDown}
                            automationFilterSelectTooltipId={automationFilterSelectTooltipId}
                        />
                    </>
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
    isReadOnly: boolean;
    tabId?: string;
}

function AutomationFilter({
    filter,
    attributeConfigs,
    onChange,
    onDelete,
    isCommonDateFilter,
    overlayPositionType,
    lockedFilters,
    isReadOnly,
    tabId,
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
                readonly={isReadOnly}
                tabId={tabId}
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
                readonly={isReadOnly}
                tabId={tabId}
            />
        );
    }
}

interface IAutomationFiltersTabSectionProps {
    tabId: string;
    tabTitle: string;
    filters: FilterContextItem[];
    attributeConfigs: IDashboardAttributeFilterConfig[];
    commonDateFilterId: string | undefined;
    lockedFilters: FilterContextItem[];
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
    overlayPositionType?: OverlayPositionType;
    /** Show divider after this tab section */
    showDivider?: boolean;
    /** Add filter button to render at the end of filters list */
    addFilterButton?: ReactNode;
    readonlyFilters: boolean;
}

/**
 * Renders filters for a single tab with a tab title header.
 * Used when displaying filters grouped by tab for whole dashboard automations.
 */
function AutomationFiltersTabSection({
    tabId,
    tabTitle,
    filters,
    attributeConfigs,
    commonDateFilterId,
    lockedFilters,
    onChange,
    onDelete,
    overlayPositionType,
    showDivider = false,
    addFilterButton,
    readonlyFilters,
}: IAutomationFiltersTabSectionProps) {
    const intl = useIntl();
    const tabSectionLabelId = useIdPrefixed(`automation-filters-tab-${tabId}`);

    // Display tab title or fallback to generic "Tab" label
    const displayTitle = tabTitle || intl.formatMessage({ id: "dialogs.automation.filters.tab.untitled" });
    const tabLabel = intl.formatMessage({ id: "dialogs.automation.filters.tab.label" });

    if (filters.length === 0) {
        return null;
    }

    const content = (
        <span className="gd-automation-filters__tab-title s-automation-filters-tab-title">
            {displayTitle}
        </span>
    );

    return (
        <>
            <div
                className="gd-automation-filters__tab-section s-automation-filters-tab-section"
                role="group"
                aria-labelledby={tabSectionLabelId}
            >
                <div className="gd-automation-filters__tab-header">
                    <span className="gd-automation-filters__tab-label">{tabLabel}</span>
                    <UiTooltip
                        content={content}
                        triggerBy={["hover", "focus"]}
                        optimalPlacement
                        anchor={
                            <span
                                className="gd-automation-filters__tab-title s-automation-filters-tab-title"
                                id={tabSectionLabelId}
                            >
                                {displayTitle}
                            </span>
                        }
                    />
                </div>
                <div className="gd-automation-filters__tab-filters">
                    {filters.map((filter) => {
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
                                onChange={onChange}
                                onDelete={onDelete}
                                isCommonDateFilter={isCommonDateFilter}
                                overlayPositionType={overlayPositionType}
                                lockedFilters={lockedFilters}
                                isReadOnly={readonlyFilters}
                                tabId={tabId}
                            />
                        );
                    })}
                    {addFilterButton}
                </div>
            </div>
            {showDivider ? <div className="gd-automation-filters__tab-divider" /> : null}
        </>
    );
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
