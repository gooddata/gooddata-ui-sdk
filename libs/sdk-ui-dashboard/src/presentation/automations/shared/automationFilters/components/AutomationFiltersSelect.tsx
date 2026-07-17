// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, type ReactNode, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import {
    type FilterContextItem,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type ICatalogMeasure,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardMeasureValueFilter,
    type IdentifierRef,
    type ObjRef,
    areObjRefsEqual,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    isCatalogAttribute,
    isCatalogDateDataset,
    isCatalogMeasure,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardMeasureValueFilter,
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

import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";
import {
    AUTOMATION_FILTERS_DIALOG_ID,
    AUTOMATION_FILTERS_DIALOG_TITLE_ID,
    AUTOMATION_FILTERS_GROUP_LABEL_ID,
} from "../../../../constants/automations.js";
import {
    AttributesDropdown,
    type IParameterDropdownListItem,
} from "../../../../filterBar/attributeFilter/addAttributeFilter/AttributesDropdown.js";
import { type IAutomationParameter } from "../automationParameters.js";
import { useAutomationFilters, useAutomationFiltersByTab } from "../useAutomationFilters.js";
import { useParameterAnnouncements } from "../useParameterAnnouncements.js";

import { AutomationAttributeFilter } from "./AutomationAttributeFilter.js";
import { AutomationDateFilter } from "./AutomationDateFilter.js";
import { AutomationMeasureValueFilter } from "./AutomationMeasureValueFilter.js";
import { AutomationParameter } from "./AutomationParameter.js";

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
    /**
     * Parameter chips to render. Provided only when the `enableParameters` feature is on.
     */
    parameters?: IAutomationParameter[];
    /**
     * Workspace parameters addable via the "+" menu (catalog minus the selected set).
     */
    availableParameters?: IAutomationParameter[];
    /**
     * Called when a parameter is added from the "+" menu.
     */
    onParameterAdd?: (ref: IdentifierRef) => void;
    /**
     * Called when an `active` parameter chip's value is edited.
     */
    onParameterChange?: (ref: IdentifierRef, value: number) => void;
    /**
     * Called when an `active` parameter chip is removed.
     */
    onParameterDelete?: (ref: IdentifierRef) => void;
    /**
     * Parameter chips per tab. Used in tab-rendering mode (multi-tab dashboard schedules).
     */
    parametersByTab?: Record<string, IAutomationParameter[]>;
    /**
     * Addable workspace parameters per tab. Used in tab-rendering mode.
     */
    availableParametersByTab?: Record<string, IAutomationParameter[]>;
    /**
     * Called when a parameter is added from a tab section's "+" menu.
     */
    onParameterAddByTab?: (tabId: string, ref: IdentifierRef) => void;
    /**
     * Called when an `active` parameter chip's value is edited in a tab section.
     */
    onParameterChangeByTab?: (tabId: string, ref: IdentifierRef, value: number) => void;
    /**
     * Called when an `active` parameter chip is removed in a tab section.
     */
    onParameterDeleteByTab?: (tabId: string, ref: IdentifierRef) => void;
    /**
     * When the `enableParameters` feature is on, the store-filters tooltip mentions parameter values too.
     */
    parametersEnabled?: boolean;
}

interface IAutomationCheckboxOrNoteProps {
    isDashboardAutomation?: boolean;
    storeFilters: boolean;
    handleStoreFiltersChange: (value: boolean) => void;
    handleKeyDown: (e: KeyboardEvent) => void;
    automationFilterSelectTooltipId: string;
    parametersEnabled?: boolean;
}

function AutomationCheckboxOrNote({
    isDashboardAutomation,
    storeFilters,
    handleStoreFiltersChange,
    handleKeyDown,
    automationFilterSelectTooltipId,
    parametersEnabled,
}: IAutomationCheckboxOrNoteProps) {
    const intl = useIntl();
    // Keep both message ids as static literals so the i18n extractor sees them.
    const useFiltersTooltip = parametersEnabled ? (
        <FormattedMessage id="dialogs.automation.filters.useFiltersMessage.parameters.tooltip" />
    ) : (
        <FormattedMessage id="dialogs.automation.filters.useFiltersMessage.tooltip" />
    );
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
                    {useFiltersTooltip}
                </div>
                <FormattedMessage id="dialogs.automation.filters.useFiltersMessage" />
                <UiTooltip
                    arrowPlacement="left"
                    triggerBy={["hover", "focus"]}
                    optimalPlacement
                    width={300}
                    content={useFiltersTooltip}
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
    parameters = [],
    availableParameters = [],
    onParameterAdd,
    onParameterChange,
    onParameterDelete,
    parametersByTab,
    availableParametersByTab,
    onParameterAddByTab,
    onParameterChangeByTab,
    onParameterDeleteByTab,
    parametersEnabled,
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

    const { focusAddFilterButton } = flatFiltersData;

    const filters = shouldRenderByTab ? [] : flatFiltersData.visibleFilters;
    const visibleParameters = shouldRenderByTab ? [] : parameters;
    const attributes = shouldRenderByTab ? [] : flatFiltersData.attributes;
    const dateDatasets = shouldRenderByTab ? [] : flatFiltersData.dateDatasets;
    const measures = shouldRenderByTab ? [] : flatFiltersData.measures;

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
    const chipCount = filters.length + visibleParameters.length;
    const isExpandable = !showAllFilters && chipCount > COLLAPSED_FILTERS_COUNT;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (isActionKey(e)) {
            e.preventDefault();
            handleStoreFiltersChange(!storeFilters);
        }
    };

    const automationFilterSelectTooltipId = useIdPrefixed("automation-filter-select-tooltip");
    const parameterDropdownItems: IParameterDropdownListItem[] = availableParameters.map((parameter) => ({
        type: "parameter",
        ref: parameter.ref,
        title: parameter.title,
    }));
    const isAddButtonDisabled =
        availableFilters?.length === selectedFilters?.length && availableParameters.length === 0;
    const tooltipTextValues = {
        add: intl.formatMessage({ id: "dialogs.automation.filters.add" }),
        addDisabled: intl.formatMessage({ id: "dialogs.automation.filters.addDisabled" }),
    };
    const tooltipText = isAddButtonDisabled ? tooltipTextValues.addDisabled : tooltipTextValues.add;
    const searchAriaLabel = intl.formatMessage({ id: "dialogs.automation.filters.searchAriaLabel" });

    // Screen-reader announcements for parameter chip add/remove/change
    const {
        parameterAnnouncement,
        announceParameterAdded,
        announceParameterChanged,
        announceParameterRemoved,
    } = useParameterAnnouncements();

    const disableFilters = !storeFilters && !!isDashboardAutomation;

    return (
        <div className="gd-input-component gd-notification-channels-automation-filters s-gd-notifications-channels-dialog-automation-filters">
            {hideTitle ? (
                <div className="sr-only" id={AUTOMATION_FILTERS_GROUP_LABEL_ID}>
                    <FormattedMessage id="dialogs.schedule.email.filters" values={{ count: chipCount }} />
                </div>
            ) : (
                <div className="gd-label" id={AUTOMATION_FILTERS_GROUP_LABEL_ID}>
                    {isExpandable && !shouldRenderByTab ? (
                        <BubbleHoverTrigger showDelay={500} hideDelay={0}>
                            <UiButton
                                label={intl.formatMessage(
                                    { id: "dialogs.schedule.email.filters" },
                                    { count: chipCount },
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
                        <FormattedMessage id="dialogs.schedule.email.filters" values={{ count: chipCount }} />
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
                            parametersEnabled={parametersEnabled}
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
                                const tabParameters = parametersByTab?.[tab.tabId] ?? [];
                                const tabAvailableParameters = availableParametersByTab?.[tab.tabId] ?? [];
                                const tabParameterDropdownItems: IParameterDropdownListItem[] =
                                    tabAvailableParameters.map((parameter) => ({
                                        type: "parameter",
                                        ref: parameter.ref,
                                        title: parameter.title,
                                    }));
                                const isTabAddButtonDisabled =
                                    tabEditedFilters.length >= tabAvailableFilters.length &&
                                    tabAvailableParameters.length === 0;
                                const tabTooltipText = isTabAddButtonDisabled
                                    ? tooltipTextValues.addDisabled
                                    : tooltipTextValues.add;

                                return (
                                    <AutomationFiltersTabSection
                                        key={tab.tabId}
                                        tabTitle={tab.tabTitle}
                                        tabId={tab.tabId}
                                        canAddItems={!isTabAddButtonDisabled}
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
                                        parameters={tabParameters}
                                        onParameterChange={(ref, value) => {
                                            announceParameterChanged(tabParameters, ref, value);
                                            onParameterChangeByTab?.(tab.tabId, ref, value);
                                        }}
                                        onParameterDelete={(ref) => {
                                            announceParameterRemoved(tabParameters, ref);
                                            onParameterDeleteByTab?.(tab.tabId, ref);
                                        }}
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
                                                parameters={tabParameterDropdownItems}
                                                onParameterSelect={(ref) => {
                                                    announceParameterAdded(tabAvailableParameters, ref);
                                                    onParameterAddByTab?.(tab.tabId, ref);
                                                }}
                                                attributes={tab.attributes}
                                                dateDatasets={tab.dateDatasets}
                                                measures={tab.measures}
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
                            {/* Filter and parameter chips share one list so the collapsed view
                                truncates them by a single rule instead of two coupled slices. */}
                            {[
                                ...filters.map((filter) => {
                                    const isCommonDateFilter =
                                        isDashboardCommonDateFilter(filter) ||
                                        (isDashboardDateFilter(filter) &&
                                            commonDateFilterId === filter.dateFilter.localIdentifier);

                                    return (
                                        <AutomationFilter
                                            key={dashboardFilterLocalIdentifier(filter)}
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
                                }),
                                ...visibleParameters.map((parameter) => (
                                    <AutomationParameter
                                        key={`parameter-${parameter.ref.identifier}`}
                                        parameter={parameter}
                                        onChange={(ref, value) => {
                                            announceParameterChanged(visibleParameters, ref, value);
                                            onParameterChange?.(ref, value);
                                        }}
                                        onDelete={(ref) => {
                                            announceParameterRemoved(visibleParameters, ref);
                                            onParameterDelete?.(ref);
                                        }}
                                        overlayPositionType={overlayPositionType}
                                        isReadOnly={disableFilters}
                                    />
                                )),
                            ].slice(0, showAllFilters || isExpanded ? undefined : COLLAPSED_FILTERS_COUNT)}
                            {isExpanded || !isExpandable ? (
                                <AttributesDropdown
                                    id={AUTOMATION_FILTERS_DIALOG_ID}
                                    onClose={() => {}}
                                    onSelect={(value) => {
                                        handleAddFilter(value, attributes, dateDatasets);
                                        setIsExpanded(true);
                                    }}
                                    parameters={parameterDropdownItems}
                                    onParameterSelect={(ref) => {
                                        announceParameterAdded(availableParameters, ref);
                                        onParameterAdd?.(ref);
                                        setIsExpanded(true);
                                        // Restore "+" focus, else it falls to <body> when the chip's list node unmounts.
                                        setTimeout(focusAddFilterButton);
                                    }}
                                    attributes={attributes}
                                    dateDatasets={dateDatasets}
                                    measures={measures}
                                    openOnInit={false}
                                    overlayPositionType={overlayPositionType}
                                    className="gd-automation-filters__dropdown s-automation-filters-add-filter-dropdown"
                                    getCustomItemTitle={(item) =>
                                        getCatalogItemCustomTitle(item, availableFilters, dateConfigs)
                                    }
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
                            parametersEnabled={parametersEnabled}
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

            {/* Screen reader announcement when parameters are added, removed, or changed */}
            <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                {parameterAnnouncement}
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
    if (isDashboardAttributeFilterItem(filter)) {
        const config = isDashboardAttributeFilter(filter)
            ? attributeConfigs.find(
                  (attribute) => attribute.localIdentifier === filter.attributeFilter.localIdentifier,
              )
            : undefined;
        const displayAsLabel = config?.displayAsLabel;
        const isLocked = lockedFilters.some(
            (f) => dashboardFilterLocalIdentifier(f) === dashboardFilterLocalIdentifier(filter),
        );

        return (
            <AutomationAttributeFilter
                key={dashboardFilterLocalIdentifier(filter)}
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
    } else if (isDashboardDateFilter(filter)) {
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
    } else if (isDashboardMeasureValueFilter(filter)) {
        const isLocked = lockedFilters.some(
            (f) => dashboardFilterLocalIdentifier(f) === dashboardFilterLocalIdentifier(filter),
        );

        return (
            <AutomationMeasureValueFilter
                key={filter.dashboardMeasureValueFilter.localIdentifier}
                filter={filter}
                onChange={onChange}
                onDelete={onDelete}
                isLocked={isLocked}
                overlayPositionType={overlayPositionType}
                readonly={isReadOnly}
            />
        );
    }

    return null;
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
    parameters: IAutomationParameter[];
    onParameterChange: (ref: IdentifierRef, value: number) => void;
    onParameterDelete: (ref: IdentifierRef) => void;
    overlayPositionType?: OverlayPositionType;
    /** Show divider after this tab section */
    showDivider?: boolean;
    /** Add filter button to render at the end of filters list */
    addFilterButton?: ReactNode;
    /** Whether the tab has filters or parameters left to add — keeps an otherwise empty tab visible for its add button */
    canAddItems: boolean;
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
    parameters,
    onParameterChange,
    onParameterDelete,
    overlayPositionType,
    showDivider = false,
    addFilterButton,
    canAddItems,
    readonlyFilters,
}: IAutomationFiltersTabSectionProps) {
    const intl = useIntl();
    const tabSectionLabelId = useIdPrefixed(`automation-filters-tab-${tabId}`);

    // Display tab title or fallback to generic "Tab" label
    const displayTitle = tabTitle || intl.formatMessage({ id: "dialogs.automation.filters.tab.untitled" });
    const tabLabel = intl.formatMessage({ id: "dialogs.automation.filters.tab.label" });

    if (filters.length === 0 && parameters.length === 0 && !canAddItems) {
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
                                key={dashboardFilterLocalIdentifier(filter)}
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
                    {parameters.map((parameter) => (
                        <AutomationParameter
                            key={`parameter-${parameter.ref.identifier}`}
                            parameter={parameter}
                            onChange={onParameterChange}
                            onDelete={onParameterDelete}
                            overlayPositionType={overlayPositionType}
                            isReadOnly={readonlyFilters}
                        />
                    ))}
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
            ref={(element) => onRefSet(element)}
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
    item: ICatalogAttribute | ICatalogDateDataset | ICatalogMeasure,
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
    } else if (isCatalogMeasure(item)) {
        const availableFilter = availableFilters?.find(
            (filter): filter is IDashboardMeasureValueFilter =>
                isDashboardMeasureValueFilter(filter) &&
                areObjRefsEqual(dashboardFilterObjRef(filter), item.measure.ref),
        );
        return availableFilter?.dashboardMeasureValueFilter.title;
    }

    return undefined;
}
