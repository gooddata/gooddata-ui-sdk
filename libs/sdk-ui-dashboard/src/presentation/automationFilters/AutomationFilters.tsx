// (C) 2025 GoodData Corporation

import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import noop from "lodash/noop.js";
import {
    areObjRefsEqual,
    FilterContextItem,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfigItem,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button, Icon, Typography } from "@gooddata/sdk-ui-kit";
import { AttributesDropdown } from "../filterBar/index.js";
import { useAutomationFilters } from "./useAutomationFilters.js";
import { AutomationAttributeFilter } from "./components/AutomationAttributeFilter.js";
import { AutomationDateFilter } from "./components/AutomationDateFilter.js";
import { gdColorStateBlank } from "../constants/colors.js";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

const TOOLTIP_ALIGN_POINTS = [{ align: "cr cl" }, { align: "cl cr" }];

export interface IAutomationFiltersProps {
    id?: string;
    availableFilters: FilterContextItem[] | undefined;
    selectedFilters: FilterContextItem[] | undefined;
    onFiltersChange: (filters: FilterContextItem[]) => void;
    useFilters: boolean;
    onUseFiltersChange: (value: boolean, filters: FilterContextItem[]) => void;
    isDashboardAutomation?: boolean;
    areFiltersMissing?: boolean;
}

export const AutomationFilters: React.FC<IAutomationFiltersProps> = ({
    id,
    availableFilters = [],
    selectedFilters = [],
    onFiltersChange,
    isDashboardAutomation,
    useFilters,
    onUseFiltersChange,
    areFiltersMissing,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        visibleFilters,
        attributes,
        dateDatasets,
        attributeConfigs,
        dateConfigs,
        handleAddFilter,
        handleDeleteFilter,
        handleChangeFilter,
    } = useAutomationFilters({
        availableFilters,
        selectedFilters,
        onFiltersChange,
    });

    return (
        <div id={id} className="gd-automation-filters">
            <div
                className={cx("gd-automation-filters__list", {
                    "gd-automation-filters__list--expanded": isExpanded,
                })}
            >
                {selectedFilters.length > 1 ? (
                    <span className="gd-automation-filters__expansion-button s-automation-filters-show-all-button">
                        <Button
                            className={cx("gd-button gd-button-link-dimmed gd-button-small gd-icon-right", {
                                "gd-icon-chevron-up": isExpanded,
                                "gd-icon-chevron-down": !isExpanded,
                            })}
                            value={
                                isExpanded
                                    ? intl.formatMessage({ id: "dialogs.automation.filters.showLess" })
                                    : intl.formatMessage({ id: "dialogs.automation.filters.showAll" })
                            }
                            onClick={() => setIsExpanded(!isExpanded)}
                        />
                    </span>
                ) : undefined}
                {visibleFilters.map((filter) => (
                    <div
                        key={
                            isDashboardAttributeFilter(filter)
                                ? filter.attributeFilter.localIdentifier
                                : filter.dateFilter.localIdentifier
                        }
                        className="gd-automation-filters__list-item"
                    >
                        <AutomationFilter
                            filter={filter}
                            attributeConfigs={attributeConfigs}
                            dateConfigs={dateConfigs}
                            onChange={handleChangeFilter}
                            onDelete={handleDeleteFilter}
                        />
                    </div>
                ))}
                <AttributesDropdown
                    onClose={noop}
                    onSelect={handleAddFilter}
                    attributes={attributes}
                    dateDatasets={dateDatasets}
                    openOnInit={false}
                    className="gd-automation-filters__dropdown s-automation-filters-add-filter-dropdown"
                    DropdownButtonComponent={({ onClick }) => (
                        <Button
                            className="gd-button-link gd-button-icon-only gd-icon-plus"
                            size="small"
                            onClick={onClick}
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage({
                                    id: "dialogs.automation.filters.add",
                                }),
                            }}
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
            </div>
            {!isDashboardAutomation ? (
                <div className="gd-automation-filters__message">
                    <FormattedMessage id="dialogs.automation.filters.activeFilters" />
                </div>
            ) : null}
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
            {isDashboardAutomation ? (
                <label className="input-checkbox-label gd-automation-filters__use-filters-checkbox s-automation-filters-use-filters-checkbox">
                    <input
                        type="checkbox"
                        className="input-checkbox s-checkbox"
                        checked={useFilters}
                        onChange={(e) => onUseFiltersChange(e.target.checked, selectedFilters)}
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
                        <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                            <FormattedMessage
                                id="dialogs.automation.useFiltersMessage.tooltip"
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
            ) : null}
        </div>
    );
};

interface IAutomationFilterProps {
    filter: FilterContextItem;
    attributeConfigs: IDashboardAttributeFilterConfig[];
    dateConfigs: IDashboardDateFilterConfigItem[];
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
}

const AutomationFilter: React.FC<IAutomationFilterProps> = ({
    filter,
    attributeConfigs,
    dateConfigs,
    onChange,
    onDelete,
}) => {
    if (isDashboardAttributeFilter(filter)) {
        const config = attributeConfigs.find(
            (attribute) => attribute.localIdentifier === filter.attributeFilter.localIdentifier,
        );
        const displayAsLabel = config?.displayAsLabel;
        const isLocked = config?.mode === "readonly";

        return (
            <AutomationAttributeFilter
                key={filter.attributeFilter.localIdentifier}
                filter={filter}
                onChange={onChange}
                onDelete={onDelete}
                isLocked={isLocked}
                displayAsLabel={displayAsLabel}
            />
        );
    } else {
        const config = dateConfigs.find((date) =>
            areObjRefsEqual(date.dateDataSet, filter.dateFilter.dataSet),
        );
        const isLocked = config?.config.mode === "readonly";

        return (
            <AutomationDateFilter
                key={filter.dateFilter.localIdentifier}
                filter={filter}
                onChange={onChange}
                onDelete={onDelete}
                isLocked={isLocked}
            />
        );
    }
};
