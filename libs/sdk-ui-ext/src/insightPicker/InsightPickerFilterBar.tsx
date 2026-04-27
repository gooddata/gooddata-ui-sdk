// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type IUiAsyncTableFilterOption,
    UiAsyncTableFilter,
    UiIconButton,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import { InsightPickerSortDropdown } from "./InsightPickerSortDropdown.js";
import { messages } from "./messages.js";
import { type InsightPickerSortBy, type InsightPickerSortDirection } from "./types.js";

interface IInsightPickerFilterBarProps {
    author?: string;
    authorFilterOptions: IUiAsyncTableFilterOption[];
    tagFilterOptions: IUiAsyncTableFilterOption[];
    authorsLoaded: boolean;
    tagsLoaded: boolean;
    includeTags?: string[];
    excludeTags?: string[];
    authorFilter: string[];
    tagFilter: string[];
    onAuthorFilterChange: (ids: string[]) => void;
    onTagFilterChange: (ids: string[]) => void;
    sortBy: InsightPickerSortBy;
    sortDirection: InsightPickerSortDirection;
    onSortChange: (sortBy: InsightPickerSortBy, sortDirection: InsightPickerSortDirection) => void;
}

export function InsightPickerFilterBar({
    author,
    authorFilterOptions,
    tagFilterOptions,
    authorsLoaded,
    tagsLoaded,
    includeTags,
    excludeTags,
    authorFilter,
    tagFilter,
    onAuthorFilterChange,
    onTagFilterChange,
    sortBy,
    sortDirection,
    onSortChange,
}: IInsightPickerFilterBarProps) {
    const intl = useIntl();

    const selectedAuthorOptions = useMemo<IUiAsyncTableFilterOption[]>(
        () =>
            authorFilter.length === 0
                ? authorFilterOptions
                : authorFilterOptions.filter((o) => authorFilter.includes(o.value)),
        [authorFilterOptions, authorFilter],
    );

    const scopedTagOptions = useMemo<IUiAsyncTableFilterOption[]>(() => {
        let opts = tagFilterOptions;
        if (includeTags?.length) {
            opts = opts.filter((o) => includeTags.includes(o.value));
        }
        if (excludeTags?.length) {
            opts = opts.filter((o) => !excludeTags.includes(o.value));
        }
        return opts;
    }, [tagFilterOptions, includeTags, excludeTags]);

    const selectedTagOptions = useMemo<IUiAsyncTableFilterOption[]>(
        () =>
            tagFilter.length === 0
                ? scopedTagOptions
                : scopedTagOptions.filter((o) => tagFilter.includes(o.value)),
        [scopedTagOptions, tagFilter],
    );

    const authorChipTooltip = useMemo(
        () => selectedAuthorOptions.map((o) => o.label).join(", "),
        [selectedAuthorOptions],
    );
    const tagChipTooltip = useMemo(
        () => selectedTagOptions.map((o) => o.label).join(", "),
        [selectedTagOptions],
    );

    const handleAuthorChipApply = useCallback(
        (options: IUiAsyncTableFilterOption[]) => onAuthorFilterChange(options.map((o) => o.value)),
        [onAuthorFilterChange],
    );
    const handleAuthorChipReset = useCallback(() => onAuthorFilterChange([]), [onAuthorFilterChange]);
    const handleTagChipApply = useCallback(
        (options: IUiAsyncTableFilterOption[]) => onTagFilterChange(options.map((o) => o.value)),
        [onTagFilterChange],
    );
    const handleTagChipReset = useCallback(() => onTagFilterChange([]), [onTagFilterChange]);

    // Reset button: back to defaults (author = [current user], tags = [])
    const isAuthorDefault = author
        ? authorFilter.length === 1 && authorFilter[0] === author
        : authorFilter.length === 0;
    const hasActiveFilters = !isAuthorDefault || tagFilter.length > 0;
    const handleResetAllFilters = useCallback(() => {
        onAuthorFilterChange(author ? [author] : []);
        onTagFilterChange([]);
    }, [author, onAuthorFilterChange, onTagFilterChange]);

    const resetFiltersLabel = intl.formatMessage(messages.resetFilters);

    return (
        <div className="gd-ui-ext-insight-picker-filter-bar">
            <div className="gd-ui-ext-insight-picker-filter-bar-filters">
                {author && authorsLoaded ? (
                    <span title={authorChipTooltip}>
                        <UiAsyncTableFilter
                            label={intl.formatMessage(messages.filterCreatedBy)}
                            options={authorFilterOptions}
                            selected={selectedAuthorOptions}
                            onItemsSelect={handleAuthorChipApply}
                            isMultiSelect
                            onChipReset={authorFilter.length > 0 ? handleAuthorChipReset : undefined}
                        />
                    </span>
                ) : null}
                {tagsLoaded ? (
                    <span title={tagChipTooltip}>
                        <UiAsyncTableFilter
                            label={intl.formatMessage(messages.filterTag)}
                            options={scopedTagOptions}
                            selected={selectedTagOptions}
                            onItemsSelect={handleTagChipApply}
                            isMultiSelect
                            onChipReset={tagFilter.length > 0 ? handleTagChipReset : undefined}
                        />
                    </span>
                ) : null}
                {hasActiveFilters ? (
                    <UiTooltip
                        triggerBy={["hover", "focus"]}
                        anchor={
                            <UiIconButton
                                icon="history"
                                variant="tertiary"
                                size="small"
                                label={resetFiltersLabel}
                                onClick={handleResetAllFilters}
                                dataTestId="s-insight-picker-reset-filters"
                            />
                        }
                        content={resetFiltersLabel}
                    />
                ) : null}
            </div>
            <InsightPickerSortDropdown
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
            />
        </div>
    );
}
