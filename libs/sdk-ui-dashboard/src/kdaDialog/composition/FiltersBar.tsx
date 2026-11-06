// (C) 2025-2026 GoodData Corporation

import { useCallback, useLayoutEffect, useRef } from "react";

import { useIntl } from "react-intl";

import {
    type DashboardAttributeFilterItem,
    dashboardAttributeFilterItemLocalIdentifier,
} from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectRestrictedDashboardFilterCount } from "../../model/store/filtering/dashboardFilterSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { AttributeBar } from "../components/bars/AttributeBar.js";
import { DateBar } from "../components/bars/DateBar.js";
import { KdaBar } from "../components/KdaBar.js";
import { KdaRestrictedFiltersNotice } from "../components/KdaRestrictedFiltersNotice.js";

import { AddFilterButton } from "./AddFilterButton.js";
import { useAttributeFiltersChangeHandler } from "./hooks/useAttributeFiltersChangeHandler.js";
import { usePeriodChangeHandler } from "./hooks/usePeriodChangeHandler.js";

export function FiltersBar() {
    const intl = useIntl();

    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const restrictedFilterCount = useDashboardSelector(selectRestrictedDashboardFilterCount);

    const addFilterButtonId = useIdPrefixed("kda-add-filter-button");
    const attributeBarsRef = useRef<HTMLDivElement>(null);
    const deletedIndexRef = useRef<number | null>(null);

    const { attributeFilters, onChangeAttributeFilter, onDeleteAttributeFilter } =
        useAttributeFiltersChangeHandler();
    const { isAvailable, options, onPeriodChange } = usePeriodChangeHandler();

    const onDelete = useCallback(
        (filter: DashboardAttributeFilterItem) => {
            deletedIndexRef.current = attributeFilters.indexOf(filter);
            onDeleteAttributeFilter(filter);
        },
        [attributeFilters, onDeleteAttributeFilter],
    );

    useLayoutEffect(() => {
        const deletedIndex = deletedIndexRef.current;
        if (deletedIndex === null) {
            return;
        }
        deletedIndexRef.current = null;

        const bars = Array.from(attributeBarsRef.current?.children ?? []);
        const bar = bars[Math.min(deletedIndex, bars.length - 1)];
        const target =
            bar?.querySelector<HTMLElement>(".gd-ui-kit-chip__trigger") ??
            document.getElementById(addFilterButtonId);
        target?.focus();
    }, [addFilterButtonId, attributeFilters]);

    return (
        <KdaBar
            title={intl.formatMessage({ id: "kdaDialog.dialog.bars.filters.title" })}
            content={
                <>
                    <KdaRestrictedFiltersNotice count={restrictedFilterCount} />
                    <DateBar options={options} isAvailable={isAvailable} onPeriodChange={onPeriodChange} />
                    <div ref={attributeBarsRef} style={{ display: "contents" }}>
                        {attributeFilters.map((attributeFilter, i) => (
                            <AttributeBar
                                key={dashboardAttributeFilterItemLocalIdentifier(attributeFilter) ?? i}
                                attribute={attributeFilter}
                                attributeConfigs={attributeConfigs}
                                onChange={onChangeAttributeFilter}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                    <AddFilterButton buttonId={addFilterButtonId} />
                </>
            }
        />
    );
}
