// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { Dropdown, ItemsWrapper, SingleSelectListItem, UiIcon, UiIconButton } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";
import { type InsightPickerSortBy, type InsightPickerSortDirection } from "./types.js";

interface IInsightPickerSortDropdownProps {
    sortBy: InsightPickerSortBy;
    sortDirection: InsightPickerSortDirection;
    onSortChange: (sortBy: InsightPickerSortBy, sortDirection: InsightPickerSortDirection) => void;
}

const SORT_OPTIONS: InsightPickerSortBy[] = ["lastModified", "name"];

export function InsightPickerSortDropdown({
    sortBy,
    sortDirection,
    onSortChange,
}: IInsightPickerSortDropdownProps) {
    const intl = useIntl();

    const sortLabels: Record<InsightPickerSortBy, string> = {
        lastModified: intl.formatMessage(messages.sortByLastModified),
        name: intl.formatMessage(messages.sortByName),
    };

    const toggleDirection = useCallback(() => {
        onSortChange(sortBy, sortDirection === "desc" ? "asc" : "desc");
    }, [sortBy, sortDirection, onSortChange]);

    return (
        <div className="gd-ui-ext-insight-picker-sort">
            <Dropdown
                alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                renderButton={({ toggleDropdown }) => (
                    <button className="gd-ui-ext-insight-picker-sort-button" onClick={toggleDropdown}>
                        <span className="gd-ui-ext-insight-picker-sort-label">{sortLabels[sortBy]}</span>
                        <UiIcon type="navigateDown" size={10} color="complementary-6" />
                    </button>
                )}
                renderBody={({ closeDropdown }) => (
                    <div className="gd-ui-ext-insight-picker-sort-popup">
                        <div className="gd-ui-ext-insight-picker-sort-header">
                            {intl.formatMessage(messages.sortByHeader)}
                        </div>
                        <ItemsWrapper smallItemsSpacing>
                            {SORT_OPTIONS.map((option) => (
                                <SingleSelectListItem
                                    key={option}
                                    title={sortLabels[option]}
                                    isSelected={sortBy === option}
                                    onClick={() => {
                                        onSortChange(option, sortDirection);
                                        closeDropdown();
                                    }}
                                    elementType="button"
                                    accessibilityConfig={{ role: "menuitem" }}
                                />
                            ))}
                        </ItemsWrapper>
                    </div>
                )}
            />
            <UiIconButton
                icon={sortDirection === "desc" ? "arrowDown" : "arrowUp"}
                label={intl.formatMessage(
                    sortDirection === "desc"
                        ? messages.sortDirectionDescending
                        : messages.sortDirectionAscending,
                )}
                size="small"
                variant="tertiary"
                onClick={toggleDirection}
            />
        </div>
    );
}
